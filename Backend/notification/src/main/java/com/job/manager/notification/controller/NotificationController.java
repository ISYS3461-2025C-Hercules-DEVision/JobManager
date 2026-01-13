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
@CrossOrigin(origins = "*") // Allow CORS for notifications
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // Get notifications by company
    @GetMapping("/{companyId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String companyId) {
        return ResponseEntity.ok(notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId));
    }

    // Mark notification as read
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setRead(true);
                    Notification updated = notificationRepository.save(notification);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationRepository.deleteById(notificationId);
        return ResponseEntity.noContent().build();
    }
}