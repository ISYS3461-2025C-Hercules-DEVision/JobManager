package com.job.manager.company.dto;

import com.job.manager.company.entity.CompanyMedia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMediaResponseDto {

    private String mediaId;

    private String companyId;

    private String url;

    private CompanyMedia.MediaType mediaType;

    private String title;

    private String description;

    private Integer orderIndex;

    private Boolean isActive;

    private LocalDateTime uploadedAt;
}
