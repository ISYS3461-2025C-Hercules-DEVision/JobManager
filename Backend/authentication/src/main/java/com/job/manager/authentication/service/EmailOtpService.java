package com.job.manager.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import com.job.manager.dto.RegisterRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.job.manager.authentication.exception.BusinessException;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final StringRedisTemplate redisTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private static final Duration TTL = Duration.ofMinutes(10);

    public void store(String userId, String code) {
        redisTemplate.opsForValue()
                .set(key(userId), code, TTL);
    }

    public boolean verify(String userId, String code) {
        String key = key(userId);
        String stored = redisTemplate.opsForValue().get(key);
        if (stored == null)
            return false; // ✅ important

        boolean matched = stored.equals(code);
        if (matched) {
            redisTemplate.delete(key); // one-time use
        }
        return matched;
    }

    public void delete(String userId) {
        redisTemplate.delete(key(userId));
        redisTemplate.delete(registrationKey(userId));
    }

    private String key(String userId) {
        return "email:otp:" + userId;
    }

    private String registrationKey(String userId) {
        return "email:registration:" + userId;
    }

    public void storeRegistrationData(String userId, RegisterRequest request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            redisTemplate.opsForValue().set(registrationKey(userId), json, TTL);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Error storing registration data");
        }
    }

    public RegisterRequest getRegistrationData(String userId) {
        String json = redisTemplate.opsForValue().get(registrationKey(userId));
        if (json == null) {
            return null;
        }
        try {
            return objectMapper.readValue(json, RegisterRequest.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Error reading registration data");
        }
    }
}
