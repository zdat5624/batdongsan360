package vn.thanhdattanphuoc.batdongsan360.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.Notification;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    boolean existsByMessage(String message);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId "
            + "AND (:isRead IS NULL OR n.isRead = :isRead) "
            + "AND (:type IS NULL OR n.type = :type)")
    Page<Notification> findByUserAndFilters(
            @Param("userId") Long userId,
            @Param("isRead") Boolean isRead,
            @Param("type") NotificationType type,
            Pageable pageable);
}
