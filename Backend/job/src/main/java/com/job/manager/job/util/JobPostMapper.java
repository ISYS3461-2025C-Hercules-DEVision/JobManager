package com.job.manager.job.util;

import com.job.manager.job.dto.CreateJobPostRequest;
import com.job.manager.job.dto.JobPostResponse;
import com.job.manager.job.entity.JobPost;

/**
 * Utility class for converting between JobPost entities and DTOs
 */
public class JobPostMapper {

    /**
     * Convert CreateJobPostRequest DTO to JobPost entity
     */
    public static JobPost toEntity(CreateJobPostRequest request, String companyId) {
        JobPost jobPost = new JobPost();
        jobPost.setCompanyId(companyId);
        jobPost.setTitle(request.getTitle());
        jobPost.setDepartment(request.getDepartment());
        jobPost.setDescription(request.getDescription());
        jobPost.setEmploymentTypes(request.getEmploymentTypes());
        jobPost.setExpiryDate(request.getExpiryDate());
        jobPost.setSalaryType(request.getSalaryType());
        jobPost.setSalaryMin(request.getSalaryMin());
        jobPost.setSalaryMax(request.getSalaryMax());
        jobPost.setSalaryCurrency(request.getSalaryCurrency());
        jobPost.setLocation(request.getLocation());
        jobPost.setPublished(request.isPublished());
        jobPost.setSkills(request.getSkills());
        jobPost.setRequirements(request.getRequirements());
        jobPost.setResponsibilities(request.getResponsibilities());
        jobPost.setBenefits(request.getBenefits());
        jobPost.setExperienceLevel(request.getExperienceLevel());
        return jobPost;
    }

    /**
     * Convert JobPost entity to JobPostResponse DTO
     */
    public static JobPostResponse toResponse(JobPost jobPost) {
        JobPostResponse response = new JobPostResponse();
        response.setId(jobPost.getId());
        response.setCompanyId(jobPost.getCompanyId());
        response.setTitle(jobPost.getTitle());
        response.setDepartment(jobPost.getDepartment());
        response.setDescription(jobPost.getDescription());
        response.setEmploymentTypes(jobPost.getEmploymentTypes());
        response.setPostedDate(jobPost.getPostedDate());
        response.setExpiryDate(jobPost.getExpiryDate());
        response.setSalaryType(jobPost.getSalaryType());
        response.setSalaryMin(jobPost.getSalaryMin());
        response.setSalaryMax(jobPost.getSalaryMax());
        response.setSalaryCurrency(jobPost.getSalaryCurrency());
        response.setSalaryDisplay(JobPostResponse.generateSalaryDisplay(
                jobPost.getSalaryType(),
                jobPost.getSalaryMin(),
                jobPost.getSalaryMax(),
                jobPost.getSalaryCurrency()
        ));
        response.setLocation(jobPost.getLocation());
        response.setPublished(jobPost.isPublished());
        response.setSkills(jobPost.getSkills());
        response.setRequirements(jobPost.getRequirements());
        response.setResponsibilities(jobPost.getResponsibilities());
        response.setBenefits(jobPost.getBenefits());
        response.setExperienceLevel(jobPost.getExperienceLevel());
        return response;
    }

    /**
     * Update JobPost entity from CreateJobPostRequest DTO
     */
    public static void updateEntity(JobPost jobPost, CreateJobPostRequest request) {
        jobPost.setTitle(request.getTitle());
        jobPost.setDepartment(request.getDepartment());
        jobPost.setDescription(request.getDescription());
        jobPost.setEmploymentTypes(request.getEmploymentTypes());
        jobPost.setExpiryDate(request.getExpiryDate());
        jobPost.setSalaryType(request.getSalaryType());
        jobPost.setSalaryMin(request.getSalaryMin());
        jobPost.setSalaryMax(request.getSalaryMax());
        jobPost.setSalaryCurrency(request.getSalaryCurrency());
        jobPost.setLocation(request.getLocation());
        jobPost.setPublished(request.isPublished());
        jobPost.setSkills(request.getSkills());
        jobPost.setRequirements(request.getRequirements());
        jobPost.setResponsibilities(request.getResponsibilities());
        jobPost.setBenefits(request.getBenefits());
        jobPost.setExperienceLevel(request.getExperienceLevel());
    }
}
