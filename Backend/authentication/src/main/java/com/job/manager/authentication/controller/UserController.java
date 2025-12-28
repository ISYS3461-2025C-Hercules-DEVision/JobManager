package com.job.manager.authentication.controller;

import com.job.manager.authentication.model.User;
import com.job.manager.authentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(
                        new UserResponse(user.getId(), user.getUsername())
                ))
                .orElse(ResponseEntity.notFound().build());
    }

    public record UserResponse(String id, String username) {}
}