package vn.thanhdattanphuoc.batdongsan360.service;

import vn.thanhdattanphuoc.batdongsan360.repository.NotificationRepository;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Page<Notification> getUserNotifications(Long userId, Boolean isRead, NotificationType type,
            Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserAndFilters(userId, isRead, type, pageable);

        // Đánh dấu
        for (Notification notification : notifications.getContent()) {
            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications.getContent());

        return notifications;
    }
}
