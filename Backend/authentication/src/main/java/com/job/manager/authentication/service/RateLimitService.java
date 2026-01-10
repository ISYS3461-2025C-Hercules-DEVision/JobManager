package com.job.manager.authentication.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String LOGIN_ATTEMPT_PREFIX = "login_attempt:";
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    public RateLimitService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void recordLoginAttempt(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        Long attempts = redisTemplate.opsForValue().increment(key);
        
        if (attempts == 1) {
            // First attempt, set expiry
            redisTemplate.expire(key, LOCKOUT_DURATION_MINUTES, TimeUnit.MINUTES);
        }
    }

    public boolean isAccountLocked(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            return false;
        }
        
        int attempts = Integer.parseInt(value);
        return attempts >= MAX_ATTEMPTS;
    }

    public void resetLoginAttempts(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        redisTemplate.delete(key);
    }

    public int getRemainingAttempts(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            return MAX_ATTEMPTS;
        }
        
        int attempts = Integer.parseInt(value);
        return Math.max(0, MAX_ATTEMPTS - attempts);
    }

    public Long getLockoutTimeRemaining(String username) {
        String key = LOGIN_ATTEMPT_PREFIX + username;
        return redisTemplate.getExpire(key, TimeUnit.MINUTES);
    }
}
