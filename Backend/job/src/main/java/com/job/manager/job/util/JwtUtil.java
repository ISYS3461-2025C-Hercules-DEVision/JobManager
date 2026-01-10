package com.job.manager.job.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.manager.job.exception.BusinessException;
import com.job.manager.job.dto.AuthenticatedUser;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
public class JwtUtil {

    public AuthenticatedUser parseToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new BusinessException("Invalid token format");
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode claims = mapper.readTree(payload);

            AuthenticatedUser user = new AuthenticatedUser();
            user.setUserId(claims.path("id").asText());
            user.setEmail(claims.path("sub").asText());

            return user;
        } catch (Exception e) {
            throw new BusinessException("Invalid JWT");
        }
    }
}
