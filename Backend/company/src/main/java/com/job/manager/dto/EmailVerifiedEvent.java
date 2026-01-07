package com.job.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EmailVerifiedEvent {
    private String userId;
    private String email;
    private Boolean isVerified;
}
