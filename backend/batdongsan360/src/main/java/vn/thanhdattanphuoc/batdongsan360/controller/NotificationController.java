package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.service.NotificationService;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;
import vn.thanhdattanphuoc.batdongsan360.util.error.InputInvalidException;
import vn.thanhdattanphuoc.batdongsan360.util.error.PermissionException;

import java.util.List;
import java.util.Map;

@RestController
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/api/notifications")
    public ResponseEntity<Page<Notification>> getUserNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationType type,
            Pageable pageable) throws Exception {
        Page<Notification> notifications = notificationService.getUserNotifications(isRead, type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount() throws PermissionException {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (email.isEmpty()) {
            throw new PermissionException("Bạn chưa đăng nhập.");
        }
        User user = userService.handleGetUserByUserName(email);
        if (user == null || user.getRole() == null) {
            throw new PermissionException("Bạn không có quyền truy cập.");
        }
        long unreadCount = notificationService.getUnreadNotificationCount(user.getId());
        return ResponseEntity.ok(unreadCount);
    }

    @GetMapping("/api/notifications/unread-count-by-type")
    public ResponseEntity<Map<NotificationType, Long>> getUnreadCountByType() throws PermissionException, InputInvalidException {
        Map<NotificationType, Long> unreadCounts = notificationService.getUnreadCountByType();
        return ResponseEntity.ok(unreadCounts);
    }

    @PostMapping("/api/notifications/create")
    public ResponseEntity<Notification> createNotification(
            @RequestBody CreateNotificationRequest request) throws PermissionException {
        Notification notification = new Notification();
        User user = new User();
        user.setId(request.userId);
        notification.setUser(user);
        notification.setMessage(request.message);
        notification.setType(request.type);
        notification.setRead(false);
        Notification savedNotification = notificationService.createNotification(notification);
        return ResponseEntity.ok(savedNotification);
    }

    @DeleteMapping("/api/notifications")
    public ResponseEntity<Integer> deleteNotifications(
            @RequestBody List<Long> ids) throws PermissionException, InputInvalidException {
        int deletedCount = notificationService.deleteNotifications(ids);
        return ResponseEntity.ok(deletedCount);
    }

    @PutMapping("/api/notifications/mark-as-read")
    public ResponseEntity<Integer> markNotificationsAsRead(
            @RequestBody List<Long> ids) throws PermissionException, InputInvalidException {
        int updatedCount = notificationService.markNotificationsAsRead(ids);
        return ResponseEntity.ok(updatedCount);
    }

    @PutMapping("/api/notifications/mark-all-as-read")
    public ResponseEntity<Integer> markAllNotificationsAsRead() throws PermissionException, InputInvalidException {
        int updatedCount = notificationService.markAllNotificationsAsRead();
        return ResponseEntity.ok(updatedCount);
    }

    public static class CreateNotificationRequest {
        public Long userId;
        public String message;
        public NotificationType type;
    }
}