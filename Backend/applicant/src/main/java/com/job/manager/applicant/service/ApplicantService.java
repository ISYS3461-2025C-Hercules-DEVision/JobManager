package com.job.manager.applicant.service;

import com.job.manager.applicant.dto.ApplicantCreatedEvent;   // <-- add this
import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.dto.ApplicantResponse;
import com.job.manager.applicant.entity.Applicant;
import com.job.manager.applicant.kafka.ApplicantKafkaProducer;
import com.job.manager.applicant.repository.ApplicantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
        applicant.setName(request.getName());
        applicant.setTechnicalTags(request.getTechnicalTags());
        applicant.setEmploymentStatus(request.getEmploymentStatus());
        applicant.setCountry(request.getCountry());
        applicant.setExpectedSalaryMin(request.getExpectedSalaryMin());
        applicant.setExpectedSalaryMax(request.getExpectedSalaryMax());
        applicant.setHighestEducationDegree(request.getHighestEducationDegree());
        applicant.setCreatedAt(LocalDateTime.now());
        applicant.setUpdatedAt(LocalDateTime.now());

        repository.save(applicant);

        // Publish Kafka event
        ApplicantCreatedEvent event = new ApplicantCreatedEvent();
        event.setApplicantId(id);
        event.setName(request.getName());
        event.setTechnicalTags(request.getTechnicalTags());
        event.setEmploymentStatus(request.getEmploymentStatus());
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
        response.setName(applicant.getName());
        response.setTechnicalTags(applicant.getTechnicalTags());
        response.setEmploymentStatus(applicant.getEmploymentStatus());
        response.setCountry(applicant.getCountry());
        response.setExpectedSalaryMin(applicant.getExpectedSalaryMin());
        response.setExpectedSalaryMax(applicant.getExpectedSalaryMax());
        response.setHighestEducationDegree(applicant.getHighestEducationDegree());
        response.setCreatedAt(applicant.getCreatedAt());
        response.setUpdatedAt(applicant.getUpdatedAt());
        return response;
    }
}