package com.example.team_manager.repository;

import com.example.team_manager.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}