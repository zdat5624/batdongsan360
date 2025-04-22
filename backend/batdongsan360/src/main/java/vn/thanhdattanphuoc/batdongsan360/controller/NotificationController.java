package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.service.NotificationService;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;
import vn.thanhdattanphuoc.batdongsan360.util.error.PermissionException;

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
            @RequestParam Long userId,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationType type,
            Pageable pageable) {

        Page<Notification> notifications = notificationService.getUserNotifications(userId, isRead, type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount() throws PermissionException {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (email.isEmpty()) {
            throw new PermissionException("Bạn chưa đăng nhập.");
        }

        // Lấy thông tin User
        User user = userService.handleGetUserByUserName(email);
        if (user == null || user.getRole() == null) {
            throw new PermissionException("Bạn không có quyền truy cập.");
        }
        long unreadCount = notificationService.getUnreadNotificationCount(user.getId());
        return ResponseEntity.ok(unreadCount);
    }

    @PostMapping("/api/notifications/create")
    public ResponseEntity<Notification> createNotification(
            @RequestBody CreateNotificationRequest request) throws PermissionException {

        // Tạo Notification
        Notification notification = new Notification();
        User user = new User();
        user.setId(request.userId);
        notification.setUser(user);
        notification.setMessage(request.message);
        notification.setType(request.type);
        notification.setRead(false);

        // Lưu và gửi thông báo qua WebSocket
        Notification savedNotification = notificationService.createNotification(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public static class CreateNotificationRequest {
        public Long userId;
        private String message;
        public NotificationType type;
    }
}
