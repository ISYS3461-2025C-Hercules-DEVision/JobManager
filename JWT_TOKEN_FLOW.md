# JWT Token Flow - Complete Guide

## 📋 Table of Contents
1. [Token Generation](#token-generation)
2. [Token Usage](#token-usage)
3. [Token Refresh (NOT IMPLEMENTED)](#token-refresh)
4. [Token Validation](#token-validation)
5. [Token Revocation](#token-revocation)
6. [Security Implementation](#security-implementation)

---

## 🔐 Token Generation

### 1. User Login (Local Authentication)

**Endpoint:** `POST /authentication/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Flow:**
```
Client → Kong Gateway → Authentication Service
  ↓
1. Validate credentials (email + password)
2. Check user exists in MongoDB
3. Verify password with BCrypt
4. Generate JWT token using RS256 (RSA)
```

**Token Generation Code:**
```java
// Backend/authentication/src/main/java/com/job/manager/authentication/util/JwtUtil.java

public String generateToken(String username, String userId) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs); // 10 hours
    
    return Jwts.builder()
        .setSubject(username)              // Email
        .claim("userId", userId)           // User ID
        .setIssuedAt(now)                  // Created timestamp
        .setExpiration(expiryDate)         // Expires after 10 hours
        .signWith(privateKey, SignatureAlgorithm.RS256)  // Sign with RSA private key
        .compact();
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoiNjk1ZjgzZDhlODg0ZjMzYmM2M2I4OWM3IiwiaWF0IjoxNzM2MzI4MDAwLCJleHAiOjE3MzYzNjQwMDB9...",
  "refreshToken": null,
  "expiresIn": 36000,  // 10 hours in seconds
  "userId": "695f83d8e884f33bc63b89c7",
  "hasPublicProfile": false
}
```

### 2. OAuth Login (Google)

**Endpoint:** `POST /authentication/oauth2/google`

**Flow:**
```
1. User clicks "Login with Google"
2. Frontend redirects to Google OAuth consent screen
3. Google authenticates user
4. Google redirects back with authorization code
5. Backend exchanges code for Google user info
6. Check if user exists:
   - If exists → Login
   - If not → Create user with provider=GOOGLE
7. Generate JWT token (same as local login)
```

**Key Difference:**
- OAuth users have `provider = "GOOGLE"` in database
- No password field (cannot login with email/password)
- Email auto-verified (`isVerified = true`)

---

## 🎫 Token Usage

### 1. Client Stores Token

**Frontend (localStorage):**
```javascript
// Frontend/src/utils/HttpUtil.js

// After login
const { accessToken, userId } = response.data;
localStorage.setItem('token', accessToken);
localStorage.setItem('userId', userId);
```

### 2. Client Sends Token in Requests

**HTTP Header:**
```http
GET /companies/695f83d8e884f33bc63b89c7/profile
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

**Frontend Code:**
```javascript
// Frontend/src/utils/HttpUtil.js

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach token to every request
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Kong Gateway Validates Token

**Kong JWT Plugin Configuration:**
```yaml
plugins:
  - name: jwt
    config:
      uri_param_names: []
      cookie_names: []
      claims_to_verify:
        - exp  # Verify expiration
      key_claim_name: iss
      secret_is_base64: false
      run_on_preflight: true
```

**Flow:**
```
Request with "Authorization: Bearer TOKEN"
  ↓
Kong Gateway:
  1. Extract token from header
  2. Verify signature using public key
  3. Check expiration (exp claim)
  4. If valid → Forward to backend service
  5. Add headers: X-User-Id, X-User-Email
  
If invalid/expired:
  → Return 401 Unauthorized
```

### 4. Backend Service Extracts User Info

**@CurrentUser Annotation:**
```java
// Backend/company/src/main/java/com/job/manager/company/annotation/CurrentUser.java

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
```

**Resolver:**
```java
// Backend/company/src/main/java/com/job/manager/company/config/CurrentUserArgumentResolver.java

public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {
    
    @Override
    public Object resolveArgument(...) {
        String userId = request.getHeader("X-User-Id");
        String email = request.getHeader("X-User-Email");
        
        return new AuthenticatedUser(userId, email);
    }
}
```

**Controller Usage:**
```java
@PostMapping("/public-profile")
public ResponseEntity<?> createProfile(
    @CurrentUser AuthenticatedUser user,  // Auto-injected from token
    @RequestBody PublicProfileDto dto
) {
    // user.getUserId() = "695f83d8e884f33bc63b89c7"
    // user.getEmail() = "user@example.com"
    
    return companyService.createProfile(user.getUserId(), dto);
}
```

---

## 🔄 Token Refresh (NOT IMPLEMENTED)

### ⚠️ Current Status: NOT AVAILABLE

**Your system does NOT implement refresh token mechanism.**

### How Refresh Token SHOULD Work (If Implemented):

**1. Token Types:**
```
Access Token:
- Short-lived (10 hours in your case)
- Used for API requests
- Stored in localStorage

Refresh Token:
- Long-lived (7-30 days)
- Used ONLY to get new access token
- Stored in httpOnly cookie (more secure)
```

**2. Refresh Flow:**
```
Access token expires (after 10 hours)
  ↓
Client detects 401 Unauthorized
  ↓
Client calls POST /refresh-token
  Body: { refreshToken: "..." }
  ↓
Backend validates refresh token:
  - Check signature
  - Check expiration
  - Check not in blacklist (Redis)
  ↓
Generate NEW access token + NEW refresh token
  ↓
Return to client:
  {
    "accessToken": "new_token...",
    "refreshToken": "new_refresh_token...",
    "expiresIn": 36000
  }
  ↓
Client updates localStorage
  ↓
Retry original request with new token
```

**3. Why You Don't Have It:**

According to your requirements and code review:
- You explicitly chose **NOT to implement refresh tokens**
- Access token is long-lived (10 hours)
- Users re-login when token expires
- Simpler implementation, fewer moving parts

**4. Trade-offs:**

✅ **Without Refresh Token (Your Approach):**
- Simpler code, fewer endpoints
- Longer access token lifetime (10 hours)
- User stays logged in for 10 hours
- Security: If token stolen, valid for 10 hours

❌ **With Refresh Token (Industry Standard):**
- More complex implementation
- Shorter access token (5-15 minutes)
- Refresh token rotation every request
- Security: If access token stolen, only valid for 15 minutes

---

## ✅ Token Validation

### 1. Signature Validation

**Public/Private Key Pair:**
```
Private Key (Backend):
- Used to SIGN tokens
- Base64-encoded RSA key
- Stored in ECS Task Definition env var: JWT_PRIVATE_KEY

Public Key (Kong Gateway):
- Used to VERIFY tokens
- Derived from private key
- Configured in Kong JWT plugin
```

**Validation Steps:**
```java
public boolean validateToken(String token) {
    try {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(publicKey)       // Verify signature
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return true;  // Valid
    } catch (ExpiredJwtException e) {
        return false;  // Expired
    } catch (JwtException e) {
        return false;  // Invalid signature
    }
}
```

### 2. Expiration Check

**Token Payload:**
```json
{
  "sub": "user@example.com",
  "userId": "695f83d8e884f33bc63b89c7",
  "iat": 1736328000,    // Issued at: 2026-01-08 10:00:00
  "exp": 1736364000     // Expires at: 2026-01-08 20:00:00 (10 hours later)
}
```

**Validation:**
```java
Date expiration = claims.getExpiration();
Date now = new Date();

if (now.after(expiration)) {
    throw new ExpiredJwtException();
}
```

### 3. Blacklist Check (Token Revocation)

**Redis Blacklist:**
```java
// Check if token is in blacklist
public boolean isBlacklisted(String token) {
    String key = "token:blacklist:" + token;
    return redisTemplate.hasKey(key);
}

// In JWT filter
if (isBlacklisted(token)) {
    throw new UnauthorizedException("Token has been revoked");
}
```

---

## 🚫 Token Revocation

### 1. Logout Flow

**Endpoint:** `POST /authentication/logout`

**Flow:**
```
User clicks logout
  ↓
Frontend sends POST /logout with token
  ↓
Backend extracts token from Authorization header
  ↓
Add token to Redis blacklist:
  Key: "token:blacklist:eyJhbGci..."
  Value: "revoked"
  TTL: Remaining token lifetime (exp - now)
  ↓
Frontend deletes token from localStorage
  ↓
Redirect to login page
```

**Code:**
```java
// Backend/authentication/src/main/java/com/job/manager/authentication/controller/AuthenticationController.java

@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request) {
    String token = extractToken(request);
    
    // Get token expiration
    Claims claims = jwtUtil.getClaimsFromToken(token);
    Date expiration = claims.getExpiration();
    long ttl = expiration.getTime() - System.currentTimeMillis();
    
    // Add to blacklist
    String key = "token:blacklist:" + token;
    redisTemplate.opsForValue().set(key, "revoked", ttl, TimeUnit.MILLISECONDS);
    
    return ResponseEntity.ok("Logged out successfully");
}
```

### 2. Blacklist Validation

**JWT Filter:**
```java
// Every request checks blacklist
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    String token = extractToken(request);
    
    // 1. Validate signature
    if (!jwtUtil.validateToken(token)) {
        throw new UnauthorizedException("Invalid token");
    }
    
    // 2. Check blacklist
    String key = "token:blacklist:" + token;
    if (redisTemplate.hasKey(key)) {
        throw new UnauthorizedException("Token has been revoked");
    }
    
    // 3. Proceed
    chain.doFilter(request, response);
}
```

### 3. Automatic Cleanup

**Redis TTL handles cleanup:**
```
Token added to blacklist with TTL = remaining lifetime
  ↓
After token expires naturally, Redis auto-deletes entry
  ↓
No manual cleanup needed
```

---

## 🔒 Security Implementation

### 1. RS256 (RSA) vs HS256 (HMAC)

**Your Choice: RS256 ✅**

```
HS256 (Symmetric):
- Same secret key for sign AND verify
- Kong needs the secret → Security risk
- If Kong compromised, attacker can create tokens

RS256 (Asymmetric):
- Private key to SIGN (Backend only)
- Public key to VERIFY (Kong)
- Kong cannot create tokens, only verify
- More secure for microservices
```

### 2. Private Key Storage

**Development (.env):**
```bash
JWT_PRIVATE_KEY=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
```

**Production (ECS Task Definition):**
```yaml
environment:
  - name: JWT_PRIVATE_KEY
    value: "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t..."
```

**⚠️ Never commit private keys to Git!**

### 3. Token Lifetime Trade-offs

**Your Setting: 10 hours**

```
Shorter (5-15 minutes):
✅ More secure (stolen token expires quickly)
❌ User needs frequent re-authentication
❌ Requires refresh token implementation

Longer (10-24 hours):
✅ Better UX (user stays logged in)
✅ Simpler implementation
❌ If stolen, valid for longer period
```

### 4. HTTPS Requirement

**⚠️ Critical for Production:**
```
Without HTTPS:
- Token sent in plain text
- Man-in-the-middle can intercept
- Attacker steals token → full access

With HTTPS:
- Encrypted transmission
- Token safe during transit
```

---

## 🔄 Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                        │
└─────────────────────────────────────────────────────────────────┘

Frontend                Kong Gateway          Authentication Service
   │                         │                          │
   │──POST /login───────────>│                          │
   │  email + password       │                          │
   │                         │──────────────────────────>│
   │                         │                          │
   │                         │      1. Validate password│
   │                         │      2. Generate JWT     │
   │                         │         (RS256, 10h TTL) │
   │                         │<──────────────────────────│
   │<────────────────────────│                          │
   │  { accessToken, userId }│                          │
   │                         │                          │
   │ Store in localStorage   │                          │
   └─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATED REQUEST                                        │
└─────────────────────────────────────────────────────────────────┘

Frontend                Kong Gateway          Company Service
   │                         │                          │
   │──GET /companies/123────>│                          │
   │  Authorization: Bearer  │                          │
   │  eyJhbGci...            │                          │
   │                         │                          │
   │                         │ 1. Verify JWT signature  │
   │                         │    using public key      │
   │                         │ 2. Check expiration      │
   │                         │ 3. Extract claims        │
   │                         │                          │
   │                         │──────────────────────────>│
   │                         │  Headers:                │
   │                         │    X-User-Id: 123        │
   │                         │    X-User-Email: ...     │
   │                         │                          │
   │                         │<──────────────────────────│
   │<────────────────────────│  Company data            │
   └─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. LOGOUT (Token Revocation)                                    │
└─────────────────────────────────────────────────────────────────┘

Frontend                Kong Gateway          Auth Service     Redis
   │                         │                      │             │
   │──POST /logout──────────>│                      │             │
   │  Authorization: Bearer  │                      │             │
   │                         │──────────────────────>│             │
   │                         │                      │             │
   │                         │              Extract token         │
   │                         │              Get TTL (exp - now)   │
   │                         │                      │─────────────>│
   │                         │                      │  SET        │
   │                         │                      │  token:bl:..│
   │                         │                      │  TTL=8h     │
   │                         │<──────────────────────│             │
   │<────────────────────────│  "Logged out"        │             │
   │                         │                      │             │
   │ Delete localStorage     │                      │             │
   │ Redirect to /login      │                      │             │
   └─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. REQUEST WITH REVOKED TOKEN                                   │
└─────────────────────────────────────────────────────────────────┘

Frontend                Kong Gateway          Auth Service     Redis
   │                         │                      │             │
   │──GET /companies────────>│                      │             │
   │  Authorization: Bearer  │                      │             │
   │  (revoked token)        │                      │             │
   │                         │                      │             │
   │                         │──────────────────────>│             │
   │                         │                      │             │
   │                         │              Check blacklist       │
   │                         │                      │─────────────>│
   │                         │                      │  EXISTS?    │
   │                         │                      │<─────────────│
   │                         │                      │  YES        │
   │                         │<──────────────────────│             │
   │<────────────────────────│  401 Unauthorized    │             │
   │                         │  "Token revoked"     │             │
   │                         │                      │             │
   │ Redirect to /login      │                      │             │
   └─────────────────────────────────────────────────────────────┘
```

---

## 📝 Summary for Interview

### Key Points to Remember:

1. **Token Generation:**
   - RS256 (RSA) algorithm
   - 10-hour expiration
   - Contains userId + email
   - No refresh token (by design)

2. **Token Validation:**
   - Kong Gateway validates signature
   - Checks expiration automatically
   - Forwards user info in headers

3. **Token Usage:**
   - Stored in localStorage (frontend)
   - Sent in Authorization header
   - Backend extracts via @CurrentUser

4. **Token Revocation:**
   - Logout adds token to Redis blacklist
   - TTL = remaining token lifetime
   - Automatic cleanup after expiration

5. **Security:**
   - RS256 (asymmetric) is more secure than HS256
   - HTTPS required in production
   - Private key never exposed to Kong
   - Blacklist prevents use after logout

---

**Questions You Might Be Asked:**

Q: "Why no refresh token?"  
A: "We chose simplicity over complexity. 10-hour access token is long enough for good UX, and users re-login when expired. This reduces attack surface and implementation complexity."

Q: "What if token is stolen?"  
A: "We use HTTPS in production to prevent interception. If stolen, we can revoke via blacklist. Users can logout to invalidate their token immediately."

Q: "Why RS256 instead of HS256?"  
A: "RS256 is more secure for distributed systems. Kong Gateway only needs the public key to verify tokens, not the private key. This prevents Kong from being able to forge tokens if compromised."

Q: "How do you handle expired tokens?"  
A: "Kong Gateway automatically rejects expired tokens with 401. Frontend catches this, clears localStorage, and redirects to login page."



# Terminal 1 - Authentication DB
ssh -i job-manager-tools.pem -L 27017:localhost:27017 ec2-user@ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com -N

# Terminal 2 - Company DB  
ssh -i job-manager-tools.pem -L 27018:localhost:27018 ec2-user@ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com -N

# Terminal 3 - Subscription DB
ssh -i job-manager-tools.pem -L 27020:localhost:27020 ec2-user@ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com -N

# Terminal 4 - Notification DB
ssh -i job-manager-tools.pem -L 27021:localhost:27021 ec2-user@ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com -N

# Terminal 5 - Job DB
ssh -i job-manager-tools.pem -L 27022:localhost:27022 ec2-user@ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com -N


mongodb://admin:admin@localhost:27017/mongodb-authentication?authSource=admin
mongodb://admin:admin@localhost:27018/mongodb-company?authSource=admin
mongodb://admin:admin@localhost:27020/mongodb-subscription?authSource=admin
mongodb://admin:admin@localhost:27021/mongodb-notification?authSource=admin
mongodb://admin:admin@localhost:27022/mongodb-job?authSource=admin