package com.job.manager.applicant.service;

import com.job.manager.applicant.dto.ApplicantCreatedEvent;
import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.dto.ApplicantResponse;
import com.job.manager.applicant.dto.ApplicantSearchRequest;
import com.job.manager.applicant.dto.ApplicantSearchResponse;
import com.job.manager.applicant.entity.Applicant;
import com.job.manager.applicant.entity.WorkExperience;
import com.job.manager.applicant.kafka.ApplicantKafkaProducer;
import com.job.manager.applicant.repository.ApplicantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantKafkaProducer producer;
    private final ApplicantRepository repository;

    public String createApplicant(ApplicantCreateRequest request) {
        String id = request.getApplicantId() != null && !request.getApplicantId().isBlank()
                ? request.getApplicantId()
                : UUID.randomUUID().toString();

        // Save to MongoDB
        Applicant applicant = new Applicant();
        applicant.setApplicantId(id);
        applicant.setFirstName(request.getFirstName());
        applicant.setLastName(request.getLastName());
        applicant.setEmail(request.getEmail());
        applicant.setCity(request.getCity());
        applicant.setCountry(request.getCountry());
        applicant.setObjectiveSummary(request.getObjectiveSummary());
        applicant.setEducation(request.getEducation());
        applicant.setWorkExperience(request.getWorkExperience());
        applicant.setHighestEducationDegree(request.getHighestEducationDegree());
        applicant.setTechnicalTags(request.getTechnicalTags());
        applicant.setEmploymentTypes(request.getEmploymentTypes());
        applicant.setExpectedSalaryMin(request.getExpectedSalaryMin());
        applicant.setExpectedSalaryMax(request.getExpectedSalaryMax());
        applicant.setCreatedAt(LocalDateTime.now());
        applicant.setUpdatedAt(LocalDateTime.now());

        repository.save(applicant);

        // Publish Kafka event (keeping backward compatibility)
        ApplicantCreatedEvent event = new ApplicantCreatedEvent();
        event.setApplicantId(id);
        event.setName(request.getFirstName() + " " + request.getLastName());
        event.setTechnicalTags(request.getTechnicalTags());
        event.setEmploymentStatus(request.getEmploymentTypes());
        event.setCountry(request.getCountry());
        event.setExpectedSalaryMin(request.getExpectedSalaryMin());
        event.setExpectedSalaryMax(request.getExpectedSalaryMax());
        event.setHighestEducationDegree(request.getHighestEducationDegree());

        producer.publish(event);
        return id;
    }

    public List<ApplicantResponse> getAllApplicants() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ApplicantResponse toResponse(Applicant applicant) {
        ApplicantResponse response = new ApplicantResponse();
        response.setApplicantId(applicant.getApplicantId());
        response.setFirstName(applicant.getFirstName());
        response.setLastName(applicant.getLastName());
        response.setEmail(applicant.getEmail());
        response.setCity(applicant.getCity());
        response.setCountry(applicant.getCountry());
        response.setObjectiveSummary(applicant.getObjectiveSummary());
        response.setEducation(applicant.getEducation());
        response.setWorkExperience(applicant.getWorkExperience());
        response.setHighestEducationDegree(applicant.getHighestEducationDegree());
        response.setTechnicalTags(applicant.getTechnicalTags());
        response.setEmploymentTypes(applicant.getEmploymentTypes());
        response.setExpectedSalaryMin(applicant.getExpectedSalaryMin());
        response.setExpectedSalaryMax(applicant.getExpectedSalaryMax());
        response.setCreatedAt(applicant.getCreatedAt());
        response.setUpdatedAt(applicant.getUpdatedAt());
        return response;
    }

    // Get applicant by ID for detail view (Requirement 5.1.4)
    public Optional<ApplicantResponse> getApplicantById(String applicantId) {
        return repository.findByApplicantId(applicantId)
                .map(this::toResponse);
    }

    /**
     * Search applicants with filters (Requirements 5.1.1, 5.1.2, 5.1.3, 5.2.1, 5.2.2)
     * - Full-Text Search: workExperience, objectiveSummary, technicalTags (5.2.1)
     * - Technical Tags: OR logic filtering (5.2.2)
     * - Location: City OR Country (only one value)
     * - Education: Bachelor, Master, Doctorate
     * - Work Experience: Case-insensitive keyword search
     * - Employment Types: Multiple selection
     */
    public List<ApplicantSearchResponse> searchApplicants(ApplicantSearchRequest request) {
        List<Applicant> applicants;

        // Requirement 5.2.1: Full-Text Search across Work Experience, Objective Summary, and Technical Skills
        if (request.getFullTextSearch() != null && !request.getFullTextSearch().isBlank()) {
            try {
                applicants = repository.searchByText(request.getFullTextSearch());
            } catch (Exception e) {
                // If text index not created yet, fallback to manual search
                applicants = repository.findAll();
                String searchLower = request.getFullTextSearch().toLowerCase();
                applicants = applicants.stream()
                        .filter(a -> matchesFullTextSearch(a, searchLower))
                        .collect(Collectors.toList());
            }
        } else {
            applicants = repository.findAll();
        }

        // Requirement 5.2.2: Technical Tags Filter with OR logic
        // Applicants with ANY of the specified tags are included
        if (request.getTechnicalTags() != null && !request.getTechnicalTags().isEmpty()) {
            applicants = applicants.stream()
                    .filter(a -> a.getTechnicalTags() != null &&
                           a.getTechnicalTags().stream()
                                   .anyMatch(tag -> request.getTechnicalTags().stream()
                                           .anyMatch(searchTag -> searchTag.equalsIgnoreCase(tag))))
                    .collect(Collectors.toList());
        }

        // Filter by location (city OR country, not both - Requirement 5.1.3)
        if (request.getCity() != null && !request.getCity().isBlank()) {
            applicants = applicants.stream()
                    .filter(a -> a.getCity() != null && 
                           a.getCity().equalsIgnoreCase(request.getCity()))
                    .collect(Collectors.toList());
        } else if (request.getCountry() != null && !request.getCountry().isBlank()) {
            applicants = applicants.stream()
                    .filter(a -> a.getCountry() != null && 
                           a.getCountry().equalsIgnoreCase(request.getCountry()))
                    .collect(Collectors.toList());
        }

        // Filter by education
        if (request.getEducation() != null && !request.getEducation().isBlank()) {
            applicants = applicants.stream()
                    .filter(a -> a.getHighestEducationDegree() != null &&
                           a.getHighestEducationDegree().equalsIgnoreCase(request.getEducation()))
                    .collect(Collectors.toList());
        }

        // Filter by work experience (Requirement 5.1.2 - case-insensitive)
        if (request.getHasWorkExperience() != null) {
            if ("None".equalsIgnoreCase(request.getHasWorkExperience())) {
                applicants = applicants.stream()
                        .filter(a -> a.getWorkExperience() == null || a.getWorkExperience().isEmpty())
                        .collect(Collectors.toList());
            } else if ("Any".equalsIgnoreCase(request.getHasWorkExperience())) {
                applicants = applicants.stream()
                        .filter(a -> a.getWorkExperience() != null && !a.getWorkExperience().isEmpty())
                        .collect(Collectors.toList());
            }
        }

        // Filter by work experience keyword (case-insensitive - Requirement 5.1.2)
        if (request.getWorkExperienceKeyword() != null && !request.getWorkExperienceKeyword().isBlank()) {
            String keyword = request.getWorkExperienceKeyword().toLowerCase();
            applicants = applicants.stream()
                    .filter(a -> a.getWorkExperience() != null && 
                           a.getWorkExperience().stream()
                                   .anyMatch(we -> containsKeyword(we, keyword)))
                    .collect(Collectors.toList());
        }

        // Filter by employment types (Requirement 5.1.1 - multiple selection)
        if (request.getEmploymentTypes() != null && !request.getEmploymentTypes().isEmpty()) {
            applicants = applicants.stream()
                    .filter(a -> a.getEmploymentTypes() != null &&
                           a.getEmploymentTypes().stream()
                                   .anyMatch(request.getEmploymentTypes()::contains))
                    .collect(Collectors.toList());
        }

        // Return search results with required fields (Requirement 5.1.4)
        return applicants.stream()
                .map(this::toSearchResponse)
                .collect(Collectors.toList());
    }

    // Case-insensitive keyword search in work experience (Requirement 5.1.2)
    private boolean containsKeyword(WorkExperience we, String keyword) {
        return (we.getJobTitle() != null && we.getJobTitle().toLowerCase().contains(keyword)) ||
               (we.getCompany() != null && we.getCompany().toLowerCase().contains(keyword)) ||
               (we.getDescription() != null && we.getDescription().toLowerCase().contains(keyword));
    }

    // Full-text search helper (Requirement 5.2.1)
    // Searches across Work Experience, Objective Summary, and Technical Skills
    private boolean matchesFullTextSearch(Applicant applicant, String searchLower) {
        // Search in objective summary
        if (applicant.getObjectiveSummary() != null && 
            applicant.getObjectiveSummary().toLowerCase().contains(searchLower)) {
            return true;
        }
        
        // Search in technical tags
        if (applicant.getTechnicalTags() != null && 
            applicant.getTechnicalTags().stream()
                    .anyMatch(tag -> tag.toLowerCase().contains(searchLower))) {
            return true;
        }
        
        // Search in work experience
        if (applicant.getWorkExperience() != null) {
            for (WorkExperience we : applicant.getWorkExperience()) {
                if ((we.getJobTitle() != null && we.getJobTitle().toLowerCase().contains(searchLower)) ||
                    (we.getCompany() != null && we.getCompany().toLowerCase().contains(searchLower)) ||
                    (we.getDescription() != null && we.getDescription().toLowerCase().contains(searchLower))) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Map to search response (Requirement 5.1.4, 5.2.5 - display specified fields including skill tags)
    private ApplicantSearchResponse toSearchResponse(Applicant applicant) {
        return ApplicantSearchResponse.builder()
                .applicantId(applicant.getApplicantId())
                .firstName(applicant.getFirstName())
                .lastName(applicant.getLastName())
                .email(applicant.getEmail())
                .city(applicant.getCity())
                .country(applicant.getCountry())
                .highestEducationDegree(applicant.getHighestEducationDegree())
                .technicalTags(applicant.getTechnicalTags())  // Requirement 5.2.5
                .build();
    }
}