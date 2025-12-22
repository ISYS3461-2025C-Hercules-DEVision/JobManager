package com.job.manager.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ApplicantMatchResponse {

    private List<String> matchedCompanyIds;
}