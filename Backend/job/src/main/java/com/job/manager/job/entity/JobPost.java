package com.job.manager.job.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Document(collection = "job-posts")
@Getter
@Setter
public class JobPost {

    @Id
    private UUID id;

    private String companyId; 

    private String title;

    private String description;

    private Set<String> employmentTypes; // Full-time, Part-time, Internship, Contract

    private LocalDate postedDate;

    private LocalDate expiryDate;

    private Salary salary; // Structured salary with type, range, etc.

    private String location;

    private boolean published;

    private List<String> skills; // Technical Skills tags

}