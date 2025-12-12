package com.job.manager.authentication.service;

import com.job.manager.authentication.model.User;
import com.job.manager.authentication.repository.UserRepository;
import com.job.manager.authentication.kafka.KafkaProducer;
import com.job.manager.authentication.util.JwtUtil;
import com.job.manager.authentication.dto.LoginRequest;
import com.job.manager.dto.RegisterRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final KafkaProducer kafkaProducer;
    private final UserRepository userRepository;

    public AuthenticationService(PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                                 KafkaProducer kafkaProducer, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.kafkaProducer = kafkaProducer;
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
        // Check if user already exists
        if (userRepository.findByUsername(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        // Save user in MongoDB
        User newUser = User.builder()
                .username(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role("COMPANY")
                .build();

        userRepository.save(newUser);
        registerRequest.setCompanyId(newUser.getId());

        // Publish registration event to Kafka
        kafkaProducer.publishRegisterEvent(registerRequest);
    }
}
