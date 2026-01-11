package com.job.manager.applicant.service;

import com.job.manager.applicant.dto.ApplicantCreatedEvent;
import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.entity.Applicant;
import com.job.manager.applicant.exception.EmailAlreadyExistsException;
import com.job.manager.applicant.kafka.ApplicantKafkaProducer;
import com.job.manager.applicant.repository.ApplicantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantService {

    private final ApplicantKafkaProducer producer;
    private final ApplicantRepository applicantRepository;

    public String createApplicant(ApplicantCreateRequest request) {
        // Check if email already exists
        if (applicantRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }
        
        // Generate UUID for new applicant
        String applicantId = UUID.randomUUID().toString();
        
        // Build and save Applicant entity to MongoDB
        Applicant applicant = Applicant.builder()
                .applicantId(applicantId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .city(request.getCity())
                .country(request.getCountry())
                .objectiveSummary(request.getObjectiveSummary())
                .education(request.getEducation())
                .highestEducationDegree(request.getHighestEducationDegree())
                .workExperience(request.getWorkExperience())
                .technicalTags(request.getTechnicalTags())
                .employmentTypes(request.getEmploymentTypes())
                .expectedSalaryMin(request.getExpectedSalaryMin())
                .expectedSalaryMax(request.getExpectedSalaryMax())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isActive(true)
                .build();
        
        applicantRepository.save(applicant);
        log.info("Saved applicant to MongoDB: {}", applicantId);
        
        // Publish event to Kafka for matching/notification services
        ApplicantCreatedEvent event = new ApplicantCreatedEvent();
        event.setApplicantId(applicantId);
        event.setFirstName(request.getFirstName());
        event.setLastName(request.getLastName());
        event.setEmail(request.getEmail());
        event.setCity(request.getCity());
        event.setCountry(request.getCountry());
        event.setTechnicalTags(request.getTechnicalTags());
        event.setEmploymentTypes(request.getEmploymentTypes());
        event.setExpectedSalaryMin(request.getExpectedSalaryMin());
        event.setExpectedSalaryMax(request.getExpectedSalaryMax());
        event.setHighestEducationDegree(request.getHighestEducationDegree());

        producer.publish(event);
        log.info("Published ApplicantCreatedEvent to Kafka: {}", applicantId);
        
        return applicantId;
    }
}