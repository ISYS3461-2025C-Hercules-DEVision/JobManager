package com.job.manager.authentication.service;

import com.job.manager.authentication.constants.CountryCode;
import com.job.manager.authentication.dto.LoginRequest;
import com.job.manager.authentication.exception.BusinessException;
import com.job.manager.authentication.kafka.KafkaProducer;
import com.job.manager.authentication.model.User;
import com.job.manager.authentication.repository.UserRepository;
import com.job.manager.authentication.util.JwtUtil;
import com.job.manager.authentication.util.OtpGenerator;
import com.job.manager.dto.RegisterRequest;
import com.job.manager.dto.VerifyEmailRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;

@Service
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final KafkaProducer kafkaProducer;
    private final EmailOtpService emailOtpService;
    private final UserRepository userRepository;

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return jwtUtil.generateToken(user.getUsername());
        }

        throw new RuntimeException("Invalid credentials");
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

}
