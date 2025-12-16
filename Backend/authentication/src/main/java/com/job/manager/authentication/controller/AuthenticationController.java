package com.job.manager.authentication.controller;

import com.job.manager.authentication.dto.LoginRequest;
import com.job.manager.authentication.dto.OAuthCodeRequest;
import com.job.manager.authentication.service.EmailOtpService;
import com.job.manager.dto.RegisterRequest;
import com.job.manager.authentication.service.AuthenticationService;
import com.job.manager.dto.VerifyEmailRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService, EmailOtpService emailOtpService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        String token = authenticationService.login(loginRequest);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authenticationService.register(registerRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyEmailRequest request) {
        authenticationService.verifyEmail(request);
        return ResponseEntity.ok("Email verified");
    }

    @PostMapping("/resend-verification")
    public void resend(@RequestParam String email) {
        authenticationService.resendVerification(email);
    }

    @PostMapping("/google")
    public ResponseEntity<String> oauthRegister(@RequestBody OAuthCodeRequest request) {
        String token = authenticationService.loginWithGoogle(request.getCode());
        return ResponseEntity.ok(token);
    }


}
