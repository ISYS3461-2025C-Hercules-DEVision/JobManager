package com.job.manager.notification.repository;

import com.job.manager.notification.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByCompanyIdOrderByCreatedAtDesc(String companyId);
}