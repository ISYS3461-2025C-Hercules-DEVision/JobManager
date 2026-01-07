package com.job.manager.authentication.service;

import com.job.manager.authentication.constants.AuthenticationProvider;
import com.job.manager.authentication.constants.CountryCode;
import com.job.manager.authentication.dto.GoogleTokenResponse;
import com.job.manager.authentication.dto.GoogleUserInfo;
import com.job.manager.authentication.dto.LoginRequest;
import com.job.manager.authentication.dto.LoginResponse;
import com.job.manager.authentication.exception.BusinessException;
import com.job.manager.authentication.kafka.KafkaProducer;
import com.job.manager.authentication.model.User;
import com.job.manager.authentication.repository.UserRepository;
import com.job.manager.authentication.util.JwtUtil;
import com.job.manager.authentication.util.OtpGenerator;
import com.job.manager.dto.RegisterRequest;
import com.job.manager.dto.VerifyEmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthenticationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final KafkaProducer kafkaProducer;
    private final EmailOtpService emailOtpService;
    private final UserRepository userRepository;
    private final RateLimitService rateLimitService;
    private final TokenBlacklistService tokenBlacklistService;
    private final RefreshTokenService refreshTokenService;

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.google.token-uri}")
    private String tokenUri;

    @Value("${oauth.google.user-info-uri}")
    private String userInfoUri;

    @Value("${jwt.expiration-hours:10}")
    private int accessTokenExpirationHours;

    public AuthenticationService(PasswordEncoder passwordEncoder, EmailOtpService tokenService,
            EmailService emailService, JwtUtil jwtUtil,
            KafkaProducer kafkaProducer, EmailOtpService emailOtpService, UserRepository userRepository,
            RateLimitService rateLimitService, TokenBlacklistService tokenBlacklistService,
            RefreshTokenService refreshTokenService) {
        this.passwordEncoder = passwordEncoder;
        this.otpService = tokenService;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.kafkaProducer = kafkaProducer;
        this.emailOtpService = emailOtpService;
        this.userRepository = userRepository;
        this.rateLimitService = rateLimitService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.refreshTokenService = refreshTokenService;
    }

    public com.job.manager.authentication.dto.LoginResponse login(LoginRequest loginRequest) {

        System.out.println(">>> LOGIN username = " + loginRequest.getUsername());
        System.out.println(">>> LOGIN password = " + loginRequest.getPassword());

        // Check rate limiting
        if (rateLimitService.isAccountLocked(loginRequest.getUsername())) {
            Long minutesRemaining = rateLimitService.getLockoutTimeRemaining(loginRequest.getUsername());
            throw new BusinessException("Too many failed login attempts. Account locked for " + 
                    minutesRemaining + " more minutes.");
        }

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> {
                    rateLimitService.recordLoginAttempt(loginRequest.getUsername());
                    return new BusinessException("Invalid username or password");
                });

        if (AuthenticationProvider.GOOGLE.equals(AuthenticationProvider.valueOf(user.getProvider()))) {
            throw new BusinessException("This account is registered via Google. Please use Google login.");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // Successful login - reset attempts
            rateLimitService.resetLoginAttempts(loginRequest.getUsername());
            
            // Generate tokens
            String accessToken = jwtUtil.generateToken(user);
            String refreshToken = refreshTokenService.createRefreshToken(user.getId());
            
            LoginResponse response = new com.job.manager.authentication.dto.LoginResponse(
                accessToken,
                refreshToken,
                accessTokenExpirationHours * 3600L // convert hours to seconds
            );
            response.setUserId(user.getId());
            response.setHasPublicProfile(user.getHasPublicProfile() != null && user.getHasPublicProfile());
            return response;
        }

        // Failed login - record attempt
        rateLimitService.recordLoginAttempt(loginRequest.getUsername());
        int remainingAttempts = rateLimitService.getRemainingAttempts(loginRequest.getUsername());
        
        if (remainingAttempts > 0) {
            throw new BusinessException("Invalid username or password. " + remainingAttempts + " attempts remaining.");
        } else {
            throw new BusinessException("Invalid username or password. Account locked for 15 minutes.");
        }
    }

    public void register(RegisterRequest registerRequest) {
        validateCountry(registerRequest.getCountry());

        // Check if user already exists
        if (userRepository.findByUsername(registerRequest.getEmail()).isPresent()) {
            throw new BusinessException("User already exists");
        }

        // 1. Save user in MongoDB
        User newUser = User.builder()
                .username(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .provider(AuthenticationProvider.LOCAL.name())
                .isVerified(false)
                .build();

        User user = userRepository.save(newUser);

        // 2. Generate token
        String otp = OtpGenerator.generate();

        // 3. Store OTP in Redis
        otpService.store(user.getId(), otp);

        // IMPORTANT: store registration data BEFORE attempting to send email.
        // Email sending can fail in local/dev (missing SMTP), but verification must still
        // be able to publish the Kafka registration event.
        registerRequest.setCompanyId(newUser.getId());
        emailOtpService.storeRegistrationData(newUser.getId(), registerRequest);

        // 4. Send email (best-effort)
        try {
            emailService.sendVerificationEmail(user.getUsername(), otp);
        } catch (Exception ex) {
            System.out.println("[WARN] Failed to send verification email to " + user.getUsername() + ". Continuing registration. Error: " + ex.getMessage());
        }

        // NOTE: removed immediate Kafka publishing. It will be published after email
        // verification.
    }

    private void validateCountry(String country) {
        try {
            if (country != null && !country.isEmpty())
                CountryCode.valueOf(country.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Invalid country");
        }
    }

    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() -> new BusinessException("User not found"));
        boolean verified = emailOtpService.verify(
                user.getId(),
                request.getCode());
        if (!verified) {
            throw new BusinessException("Invalid or expired code");
        }
        markEmailVerified(user.getId());

        // Publish registration event to Kafka now that email is verified
        RegisterRequest registerRequest = emailOtpService.getRegistrationData(user.getId());
        if (registerRequest != null) {
            kafkaProducer.publishRegisterEvent(registerRequest);
        }
    }

    private void markEmailVerified(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        user.setIsVerified(true);
        user.setVerifiedAt(new Date(LocalDate.now().toEpochDay()));
        userRepository.save(user);
    }

    public void resendVerification(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getIsVerified()) {
            throw new BusinessException("Email already verified");
        }
        String otp = OtpGenerator.generate();
        emailOtpService.store(user.getId(), otp);
        emailService.sendVerificationEmail(user.getUsername(), otp);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (AuthenticationProvider.GOOGLE.equals(AuthenticationProvider.valueOf(user.getProvider()))) {
            throw new BusinessException("Google accounts cannot reset password. Please use Google login.");
        }

        String otp = OtpGenerator.generate();
        emailOtpService.store(user.getId(), otp);
        emailService.sendPasswordResetEmail(user.getUsername(), otp);
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        boolean verified = emailOtpService.verify(user.getId(), code);
        if (!verified) {
            throw new BusinessException("Invalid or expired code");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (AuthenticationProvider.GOOGLE.equals(AuthenticationProvider.valueOf(user.getProvider()))) {
            throw new BusinessException("Google accounts cannot change password");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public com.job.manager.authentication.dto.LoginResponse refreshToken(String refreshTokenValue) {
        // Validate refresh token
        String userId = refreshTokenService.validateRefreshToken(refreshTokenValue);
        
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        
        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(user);
        
        // Generate new refresh token (rotate refresh tokens for security)
        String newRefreshToken = refreshTokenService.createRefreshToken(userId);
        
        // Revoke old refresh token
        refreshTokenService.revokeRefreshToken(refreshTokenValue);
        
        return new com.job.manager.authentication.dto.LoginResponse(
            newAccessToken,
            newRefreshToken,
            accessTokenExpirationHours * 3600L
        );
    }

    public void logout(String token) {
        // Extract user ID and expiration time from token
        String userId = jwtUtil.extractUserId(token);
        long expirationTime = jwtUtil.getExpirationTime(token);
        
        // Blacklist the access token
        tokenBlacklistService.blacklistToken(token, expirationTime);
        
        // Revoke all refresh tokens for the user (logout from all devices)
        refreshTokenService.revokeAllUserTokens(userId);
    }

    public com.job.manager.authentication.dto.LoginResponse loginWithGoogle(String code) {
        GoogleTokenResponse token = exchangeCodeForToken(code);
        GoogleUserInfo userInfo = fetchUserInfo(token.getAccessToken());

        Optional<User> user = userRepository.findByUsername(userInfo.getEmail());
        if (user.isPresent()) {
            if (AuthenticationProvider.LOCAL.equals(AuthenticationProvider.valueOf(user.get().getProvider()))) {
                throw new BusinessException("Email already registered with local account. Please use local login.");
            }
            String accessToken = jwtUtil.generateToken(user.get());
            String refreshToken = refreshTokenService.createRefreshToken(user.get().getId());
            LoginResponse response = new com.job.manager.authentication.dto.LoginResponse(
                accessToken,
                refreshToken,
                accessTokenExpirationHours * 3600L
            );
            response.setUserId(user.get().getId());
            response.setHasPublicProfile(user.get().getHasPublicProfile() != null && user.get().getHasPublicProfile());
            return response;
        }
        User newUser = registerUser(userInfo);

        // Wait for company profile to be available (max 2s, poll every 200ms)
        boolean companyExists = false;
        int attempts = 0;
        while (!companyExists && attempts < 10) {
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
            // Call company service (via REST or repository) to check if company exists
            // This is a placeholder: replace with actual check if needed
            // companyExists = companyService.existsByEmail(userInfo.getEmail());
            // For now, just set to true to avoid blocking forever
            companyExists = true; // TODO: implement real check if possible
            attempts++;
        }

        String accessToken = jwtUtil.generateToken(newUser);
        String refreshToken = refreshTokenService.createRefreshToken(newUser.getId());
        LoginResponse response = new com.job.manager.authentication.dto.LoginResponse(
            accessToken,
            refreshToken,
            accessTokenExpirationHours * 3600L
        );
        response.setUserId(newUser.getId());
        response.setHasPublicProfile(false); // New Google user always needs to complete profile
        return response;
    }

    private GoogleTokenResponse exchangeCodeForToken(String code) {
        String maskedCode;
        if (code == null || code.isBlank()) {
            maskedCode = "<empty>";
        } else if (code.length() <= 12) {
            maskedCode = "***";
        } else {
            maskedCode = code.substring(0, 6) + "..." + code.substring(code.length() - 4);
        }
        System.out.println("[DEBUG] Google OAuth code: " + maskedCode);
        System.out.println("[DEBUG] Google OAuth redirect_uri: " + redirectUri);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<?> entity = new HttpEntity<>(form, headers);

        try {
            return restTemplate.postForObject(tokenUri, entity, GoogleTokenResponse.class);
        } catch (HttpClientErrorException.BadRequest ex) {
            String body = ex.getResponseBodyAsString();
            if (body != null && body.contains("invalid_grant")) {
                throw new BusinessException("Google login failed: authorization code was already used or expired. Please try signing in again.");
            }
            throw ex;
        }
    }

    private GoogleUserInfo fetchUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                userInfoUri,
                HttpMethod.GET,
                entity,
                GoogleUserInfo.class);

        return response.getBody();
    }

    private User registerUser(GoogleUserInfo info) {
        // Prevent duplicate Google users by username or providerId
        String email = info.getEmail();
        String providerId = info.getSub();
        // Check for existing user by username (email) or providerId

        Optional<User> existingUser = userRepository.findByUsername(email);
        if (existingUser.isPresent() && AuthenticationProvider.GOOGLE.name().equals(existingUser.get().getProvider())) {
            return existingUser.get();
        }
        Optional<User> byProviderId = userRepository.findByProviderId(providerId);
        if (byProviderId.isPresent()) {
            return byProviderId.get();
        }

        String emailPrefix = email != null && email.contains("@") ? email.substring(0, email.indexOf("@")) : "googleuser";
        RegisterRequest request = RegisterRequest.builder()
            .email(email)
            .companyName(emailPrefix + " (Google)")
            .city("UNKNOWN")
            .address("UNKNOWN")
            .country("UNKNOWN")
            .phoneNumber("")
            .password("") // Not used for Google, but required by DTO
            .build();
        kafkaProducer.publishRegisterEvent(request);
        return userRepository.save(
            User.builder()
                .username(email)
                .provider(AuthenticationProvider.GOOGLE.name())
                .providerId(providerId)
                .isVerified(true)
                .build());
    }
    
    public void markProfileCompleted(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        user.setHasPublicProfile(true);
        userRepository.save(user);
    }

}
