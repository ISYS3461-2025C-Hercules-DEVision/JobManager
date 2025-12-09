# DEVision Security Architecture: Master Reference

This document details the security infrastructure for the DEVision Microservices platform. It covers the data flow, the "Who" (Authentication), the "What" (Authorization), and the code-level implementation details for developers.

---

## 1. High-Level Security Philosophy

We follow a **Stateless, Token-Based Architecture** using **JWT (JSON Web Tokens)**.

* **Authentication (AuthN):** *"Who are you?"*
  * **Centralized:** Handled exclusively by the **Authentication Service** (via Google OAuth2 or Credentials).
* **Authorization (AuthZ):** *"What are you allowed to do?"*
  * **Coarse-Grained:** Handled at the **API Gateway** (Routing & Blacklist checks).
  * **Fine-Grained:** Handled at **Individual Microservices** (Method-level RBAC).
* **Zero Trust Network:**
  * Even internal services must validate the token. We do not trust requests just because they come from inside the cluster.

---

## 2. The Authentication Flow (The "Login" Path)

### Step-by-Step Sequence

1. **Client Request:** User clicks "Login with Google".
2. **Provider Verification:** Google validates the user and returns an **ID Token**.
3. **Exchange:** The Client sends this Google Token to our **Authentication Service**.
4. **Token Generation (Auth Service):**
    * Validates the Google Token.
    * Upserts user in the SQL Database.
    * **Signs a DEVision JWT** using our Private Key.
    * *Payload:* `sub` (userId), `roles` (e.g., JOB_MANAGER), `email`.
5. **Session Caching:** The Auth Service stores metadata (e.g., `is_active: true`) in the **Redis Cluster**.
6. **Response:** Client receives the JWT and must attach it as `Authorization: Bearer <token>` for all subsequent requests.

---

## 3. The Security Filter Chain (Architecture)

We employ a "Defense in Depth" strategy with two distinct filter layers.

### Layer A: The Global Gateway Filter

* **Location:** API Gateway.
* **Role:** The "Bouncer".
* **Actions:**
    1. Intercepts every HTTP request.
    2. **Redis Check:** Verifies the token is not in the "Logout/Blacklist" set in Redis.
    3. **Signature Check:** Uses the Public Key to ensure the token hasn't been tampered with.
    4. **Routing:** Forwards traffic if valid; returns `401` if not.

### Layer B: The Local Service Filter

* **Location:** Every Microservice (Job, Payment, Applicant).
* **Role:** Context Re-hydration.
* **Actions:**
    1. Parses the incoming JWT.
    2. Extracts `roles` and `userId`.
    3. Populates the Spring `SecurityContext`.
    4. Enables the use of annotations like `@PreAuthorize`.

---

## 4. Implementation Details (Developer Cheatsheet)

This section contains the core Java code required in your `common-security` module.

### A. The Token Utility (`JwtUtils.java`)

Handles the low-level parsing and validation of the JWT.

```java
@Component
public class JwtUtils {

    @Value("${app.jwt.secret-key}")
    private String secretKey;

    // Generate Key object
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. Extract Username (or UserId)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Extract Specific Claim (Generic)
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 3. Validate Token
    public boolean isTokenValid(String token, String username) {
        final String extractedUser = extractUsername(token);
        return (extractedUser.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
````

### B. The Authentication Filter (`JwtAuthenticationFilter.java`)

This filter sits in front of your controllers to hydrate the user session.

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService; // Or a Custom UserDetails impl

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Check for Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userEmail = jwtUtils.extractUsername(jwt);

        // 2. If user is found and not yet authenticated in this context
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // In a microservice, you might reconstruct UserDetails directly from Token Claims 
            // instead of hitting the DB to save performance.
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtUtils.isTokenValid(jwt, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 3. Set the Context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### C. Security Configuration (`SecurityConfig.java`)

The boilerplate configuration to lock down endpoints.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // CRITICAL: Enables @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(req -> req
                // Whitelist public endpoints
                .requestMatchers("/api/v1/auth/**", "/actuator/**").permitAll()
                // Lock everything else
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 5\. Authorization Strategy (RBAC & Logic)

The JWT payload serves as the "Passport". We avoid DB calls for permissions where possible.

### Standard JWT Payload Structure

```json
{
  "sub": "user_8812",
  "iat": 1616239022,
  "exp": 1616249022,
  "roles": ["ROLE_APPLICANT"],
  "tier": "PREMIUM_TIER"
}
```

### Protecting Endpoints

Developers use Spring Security annotations to enforce these roles.

```java
// Controller Level
@RestController
@RequestMapping("/api/v1/job-manager")
public class JobController {

    // Only Job Managers can access this
    @PreAuthorize("hasRole('JOB_MANAGER')")
    @PostMapping("/create")
    public ResponseEntity<String> createJob(@RequestBody JobPayload payload) {
        return ResponseEntity.ok("Job Created");
    }

    // Only Premium users can view advanced stats
    @PreAuthorize("hasAuthority('PREMIUM_TIER')")
    @GetMapping("/stats")
    public ResponseEntity<Stats> getStats() {
        return ResponseEntity.ok(statsService.get());
    }
}
```

---

## 6\. Security in Asynchronous Flows (Kafka)

Security extends beyond HTTP. When services communicate via Kafka, trust is maintained via **Context Propagation**.

1. **Producer (e.g., Payment Service):**

      * When an event occurs (e.g., `PaymentSucceeded`), the Producer **must** inject the `userId` into the message header or payload.
      * *Payload:* `{"userId": "101", "event": "PAYMENT_SUCCESS", "timestamp": "..."}`

2. **Consumer (e.g., Notification Service):**

      * The consumer reads the `userId` from the payload.
      * Since the Kafka Broker is internal and inaccessible to the public internet, the consumer trusts that the `userId` provided in the message is valid and authenticated by the upstream service.

---

## 7\. Configuration Reference (`application.yml`)

Ensure these values are set in your Config Server or local `application.yml`.

```yaml
app:
  jwt:
    # Use a secure 256-bit key for HMAC-SHA256
    secret-key: "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    expiration: 3600000        # 1 hour
    refresh-expiration: 86400000 # 24 hours
  
  security:
    cors:
      allowed-origins: "http://localhost:3000, [http://devision.internal](http://devision.internal)"
      allowed-methods: "GET, POST, PUT, DELETE, OPTIONS"
