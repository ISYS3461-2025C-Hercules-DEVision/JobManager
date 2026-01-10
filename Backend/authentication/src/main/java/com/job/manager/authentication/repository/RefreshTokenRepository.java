package com.job.manager.authentication.repository;

import com.job.manager.authentication.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUserId(String userId);
    
    void deleteByExpiresAtBefore(LocalDateTime date);
    
    void deleteByUserId(String userId);
}
