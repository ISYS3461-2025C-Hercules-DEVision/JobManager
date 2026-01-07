package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Education information for applicant detail
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationDTO {
    private String degree;
    private String fieldOfStudy;
    private String institution;
    private Integer graduationYear;
}
