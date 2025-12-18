package com.job.manager.company.dto;

import com.job.manager.company.entity.CompanyMedia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMediaCreateDto {

    @NotBlank(message = "URL is required")
    private String url;

    @NotNull(message = "Media type is required")
    private CompanyMedia.MediaType mediaType;

    private String title;

    private String description;

    private Integer orderIndex;
}
