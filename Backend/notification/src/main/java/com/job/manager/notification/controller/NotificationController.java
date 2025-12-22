package com.job.manager.notification.controller;

import com.job.manager.notification.model.Notification;
import com.job.manager.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // TEMP: companyId in path; later derive from JWT
    @GetMapping("/{companyId}/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String companyId) {
        List<Notification> notifications =
                notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        return ResponseEntity.ok(notifications);
    }
}