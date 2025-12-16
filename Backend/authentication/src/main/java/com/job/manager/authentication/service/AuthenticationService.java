package com.job.manager.authentication.service;

import com.job.manager.authentication.constants.AuthenticationProvider;
import com.job.manager.authentication.constants.CountryCode;
import com.job.manager.authentication.dto.GoogleTokenResponse;
import com.job.manager.authentication.dto.GoogleUserInfo;
import com.job.manager.authentication.dto.LoginRequest;
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

    public AuthenticationService(PasswordEncoder passwordEncoder, EmailOtpService tokenService, EmailService emailService, JwtUtil jwtUtil,
                                 KafkaProducer kafkaProducer, EmailOtpService emailOtpService, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.otpService = tokenService;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.kafkaProducer = kafkaProducer;
        this.emailOtpService = emailOtpService;
        this.userRepository = userRepository;
    }

    public String login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BusinessException("User not found"));
        if(AuthenticationProvider.GOOGLE.equals(AuthenticationProvider.valueOf(user.getProvider()))) {
            throw new BusinessException("This account is registered via Google. Please use Google login.");
        }
        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return jwtUtil.generateToken(user);
        }

        throw new BusinessException("Invalid credentials");
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

        // 3. Store in Redis
        otpService.store(user.getId(), otp);

        // 4. Send email
        emailService.sendVerificationEmail(user.getUsername(), otp);

        registerRequest.setCompanyId(newUser.getId());

        // Publish registration event to Kafka
        kafkaProducer.publishRegisterEvent(registerRequest);
    }

    private void validateCountry(String country) {
        try {
            if(country != null && !country.isEmpty()) CountryCode.valueOf(country.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Invalid country");
        }
    }

    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() -> new BusinessException("User not found"));
        boolean verified = emailOtpService.verify(
                user.getId(),
                request.getCode()
        );
        if (!verified) {
            throw new BusinessException("Invalid or expired code");
        }
        markEmailVerified(user.getId());
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

    public String loginWithGoogle(String code) {
        GoogleTokenResponse token = exchangeCodeForToken(code);
        GoogleUserInfo userInfo = fetchUserInfo(token.getAccessToken());

        Optional<User> user = userRepository.findByUsername(userInfo.getEmail());
        if(user.isPresent()) {
            if(AuthenticationProvider.LOCAL.equals(AuthenticationProvider.valueOf(user.get().getProvider()))) {
                throw new BusinessException("Email already registered with local account. Please use local login.");
            }
            return jwtUtil.generateToken(user.get());
        }
        User newUser = registerUser(userInfo);
        return jwtUtil.generateToken(newUser);
    }

    private GoogleTokenResponse exchangeCodeForToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<?> entity = new HttpEntity<>(form, headers);

        return restTemplate.postForObject(tokenUri, entity, GoogleTokenResponse.class);
    }

    private GoogleUserInfo fetchUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<GoogleUserInfo> response =
                restTemplate.exchange(
                        userInfoUri,
                        HttpMethod.GET,
                        entity,
                        GoogleUserInfo.class
                );

        return response.getBody();
    }

    private User registerUser(GoogleUserInfo info) {
        RegisterRequest request = RegisterRequest.builder()
                .email(info.getEmail()).build();
        kafkaProducer.publishRegisterEvent(request);
        return userRepository.save(
                User.builder()
                        .username(info.getEmail())
                        .provider(AuthenticationProvider.GOOGLE.name())
                        .providerId(info.getSub())
                        .isVerified(true)
                        .build()
        );
    }

}
