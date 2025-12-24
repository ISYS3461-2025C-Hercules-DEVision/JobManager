package com.job.manager.notification.controller;

import com.job.manager.notification.model.Notification;
import com.job.manager.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // For debugging: list notifications by company
    @GetMapping("/{companyId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String companyId) {
        return ResponseEntity.ok(notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId));
    }
}