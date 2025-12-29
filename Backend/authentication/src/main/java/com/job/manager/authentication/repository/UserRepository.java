package com.job.manager.authentication.repository;

import com.job.manager.authentication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByProviderId(String providerId);
}
