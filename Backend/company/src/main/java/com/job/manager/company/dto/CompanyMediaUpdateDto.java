package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMediaUpdateDto {

    private String title;

    private String description;

    private Integer orderIndex;

    private Boolean isActive;
}
