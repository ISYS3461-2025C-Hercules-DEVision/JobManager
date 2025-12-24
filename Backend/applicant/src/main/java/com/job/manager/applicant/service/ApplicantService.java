package com.job.manager.applicant.service;

import com.job.manager.applicant.dto.ApplicantCreatedEvent;   // <-- add this
import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.kafka.ApplicantKafkaProducer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantKafkaProducer producer;

    public String createApplicant(ApplicantCreateRequest request) {
        String id = request.getApplicantId() != null && !request.getApplicantId().isBlank()
                ? request.getApplicantId()
                : UUID.randomUUID().toString();

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
}