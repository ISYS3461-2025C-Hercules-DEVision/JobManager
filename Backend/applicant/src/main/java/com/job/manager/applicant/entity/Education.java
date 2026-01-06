package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private String degree;        // Bachelor, Master, Doctorate
    private String fieldOfStudy;
    private String institution;
    private Integer graduationYear;
}
