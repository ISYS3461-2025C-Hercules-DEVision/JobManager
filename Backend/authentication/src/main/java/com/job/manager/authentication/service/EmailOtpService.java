package com.job.manager.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final StringRedisTemplate redisTemplate;

    private static final Duration TTL = Duration.ofMinutes(10);

    public void store(String userId, String code) {
        redisTemplate.opsForValue()
                .set(key(userId), code, TTL);
    }

    public boolean verify(String userId, String code) {
        String key = key(userId);
        String stored = redisTemplate.opsForValue().get(key);

        boolean matched = stored.equals(code);
        if (matched) {
            redisTemplate.delete(key); // one-time use
        }
        return matched;
    }

    public void delete(String userId) {
        redisTemplate.delete(key(userId));
    }

    private String key(String userId) {
        return "email:otp:" + userId;
    }
}
