package com.job.manager.authentication.controller;

import com.job.manager.authentication.dto.*;
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
    private final com.job.manager.authentication.util.JwtUtil jwtUtil;

    public AuthenticationController(AuthenticationService authenticationService, 
                                   EmailOtpService emailOtpService,
                                   com.job.manager.authentication.util.JwtUtil jwtUtil) {
        this.authenticationService = authenticationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<com.job.manager.authentication.dto.LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        com.job.manager.authentication.dto.LoginResponse response = authenticationService.login(loginRequest);
        return ResponseEntity.ok(response);
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
    public ResponseEntity<com.job.manager.authentication.dto.LoginResponse> oauthRegister(@RequestBody OAuthCodeRequest request) {
        com.job.manager.authentication.dto.LoginResponse response = authenticationService.loginWithGoogle(request.getCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset code sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<com.job.manager.authentication.dto.LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        com.job.manager.authentication.dto.LoginResponse response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authenticationService.changePassword(token, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authenticationService.logout(token);
        return ResponseEntity.ok("Logged out successfully");
    }
    
    @PostMapping("/profile-completed")
    public ResponseEntity<String> markProfileCompleted(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtUtil.extractUserId(token);
        authenticationService.markProfileCompleted(userId);
        return ResponseEntity.ok("Profile marked as completed");
    }
}
