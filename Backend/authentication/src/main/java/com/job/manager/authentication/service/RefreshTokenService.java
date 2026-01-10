package com.job.manager.authentication.service;

import com.job.manager.authentication.exception.BusinessException;
import com.job.manager.authentication.model.RefreshToken;
import com.job.manager.authentication.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration-days:30}")
    private int refreshTokenExpirationDays;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Generate and save refresh token for user
     */
    public String createRefreshToken(String userId) {
        // Generate random token
        String rawToken = UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
        String hashedToken = hashToken(rawToken);

        // Save to database
        RefreshToken refreshToken = RefreshToken.builder()
                .token(hashedToken)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays))
                .isRevoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken; // Return raw token to client
    }

    /**
     * Validate and consume refresh token (returns userId if valid)
     */
    public String validateRefreshToken(String rawToken) {
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = refreshTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new BusinessException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new BusinessException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Refresh token has expired");
        }

        return refreshToken.getUserId();
    }

    /**
     * Revoke specific refresh token
     */
    public void revokeRefreshToken(String rawToken) {
        String hashedToken = hashToken(rawToken);
        
        refreshTokenRepository.findByToken(hashedToken).ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    /**
     * Revoke all refresh tokens for a user (e.g., on logout from all devices)
     */
    public void revokeAllUserTokens(String userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        tokens.forEach(token -> {
            token.setRevoked(true);
            token.setRevokedAt(LocalDateTime.now());
        });
        refreshTokenRepository.saveAll(tokens);
    }

    /**
     * Delete expired tokens (cleanup job)
     */
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    /**
     * Hash token using SHA-256
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
