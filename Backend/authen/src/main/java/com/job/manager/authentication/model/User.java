package com.job.manager.authentication.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username; // or email
    private String password; // hashed
    private String role;
}
