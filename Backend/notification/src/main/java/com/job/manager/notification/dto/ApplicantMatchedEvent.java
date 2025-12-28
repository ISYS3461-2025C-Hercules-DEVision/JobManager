package com.job.manager.notification.dto;

import lombok.Data;

@Data
public class ApplicantMatchedEvent {

    private String companyId;
    private String applicantId;
    private String applicantName;
}