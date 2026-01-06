package com.job.manager.authentication.service;

import com.job.manager.authentication.model.User;
import com.job.manager.authentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
