package vn.thanhdattanphuoc.batdongsan360.service;

import vn.thanhdattanphuoc.batdongsan360.repository.NotificationRepository;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Page<Notification> getUserNotifications(Long userId, Boolean isRead, NotificationType type,
            Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserAndFilters(userId, isRead, type, pageable);

        // Đánh dấu
        // for (Notification notification : notifications.getContent()) {
        // if (!notification.isRead()) {
        // notification.setRead(true);
        // }
        // }
        // notificationRepository.saveAll(notifications.getContent());

        return notifications;
    }

    public Notification createNotification(Notification notification) {
        Notification savedNotification = notificationRepository.save(notification);
        // Gửi thông báo qua WebSocket đến user cụ thể
        Long userId = notification.getUser().getId();
        long unreadCount = getUnreadNotificationCount(userId);
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/topic/notifications",
                unreadCount);
        return savedNotification;
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
