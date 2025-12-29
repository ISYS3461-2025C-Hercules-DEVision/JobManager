package com.job.manager.matching.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicantMatchedEvent {

    private String companyId;
    private String applicantId;
    private String applicantName;
}