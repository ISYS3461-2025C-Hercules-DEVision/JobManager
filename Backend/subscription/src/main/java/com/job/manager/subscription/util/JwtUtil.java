package com.job.manager.subscription.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.manager.subscription.dto.AuthenticatedUser;
import com.job.manager.subscription.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class JwtUtil {

    public AuthenticatedUser parseToken(String token) {
        try {
            // Just decode without verification (Kong already validated it)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new BusinessException("Invalid token format");
            }

            // Decode the payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));

            // Parse JSON to extract claims
            ObjectMapper mapper = new ObjectMapper();
            JsonNode claims = mapper.readTree(payload);

            AuthenticatedUser user = new AuthenticatedUser();

            // Safely get userId - use empty string if `id` doesn't exist
            String userId = claims.has("id") && !claims.get("id").isNull()
                    ? claims.get("id").asText()
                    : "";
            user.setUserId(userId);

            // Safely get email - use `sub` as fallback if `email` doesn't exist
            String email = claims.has("email") && !claims.get("email").isNull()
                    ? claims.get("email").asText()
                    : claims.get("sub").asText();
            user.setEmail(email);

            // Handle roles if present
            if (claims.has("roles") && !claims.get("roles").isNull()) {
                List<String> roles = mapper.convertValue(
                        claims.get("roles"),
                        new TypeReference<List<String>>() {}
                );
                user.setRoles(roles);
            } else {
                user.setRoles(new ArrayList<>());
            }

            return user;
        } catch (Exception e) {
            throw new BusinessException("Failed to parse token: " + e.getMessage());
        }
    }

    public void validateToken(String token) {
        // Since Kong already validated the token, we just do basic format check
        if (token == null || token.trim().isEmpty()) {
            throw new BusinessException("Token is required");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BusinessException("Invalid token format");
        }
    }
}