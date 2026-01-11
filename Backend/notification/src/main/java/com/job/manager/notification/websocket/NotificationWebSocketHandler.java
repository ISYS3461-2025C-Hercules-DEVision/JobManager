package com.job.manager.notification.websocket;

import com.job.manager.notification.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific company via WebSocket
     * @param companyId The company ID to send notification to
     * @param notification The notification object
     */
    public void sendNotificationToCompany(String companyId, Notification notification) {
        try {
            // Send to specific company topic: /topic/notifications/{companyId}
            String destination = "/topic/notifications/" + companyId;
            messagingTemplate.convertAndSend(destination, notification);
            System.out.println("WebSocket notification sent to company: " + companyId);
        } catch (Exception e) {
            System.out.println("Failed to send WebSocket notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast notification to all connected companies (if needed)
     * @param notification The notification object
     */
    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications/all", notification);
            System.out.println("WebSocket notification broadcasted to all companies");
        } catch (Exception e) {
            System.out.println("Failed to broadcast WebSocket notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
