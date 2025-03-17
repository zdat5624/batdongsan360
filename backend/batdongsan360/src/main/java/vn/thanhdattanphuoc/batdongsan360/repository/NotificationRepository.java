package vn.thanhdattanphuoc.batdongsan360.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
