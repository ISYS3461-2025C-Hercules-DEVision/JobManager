package com.job.manager.company.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "companies")
@Getter
@Setter
public class Company {

    @Id
    private String id;
    private String name;
    private String address;
    private String email;
}