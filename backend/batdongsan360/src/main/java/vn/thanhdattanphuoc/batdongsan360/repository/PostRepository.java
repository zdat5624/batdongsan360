package vn.thanhdattanphuoc.batdongsan360.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

        @Modifying
        @Transactional
        @Query("UPDATE Post p SET p.status = :newStatus WHERE p.expireDate < :now")
        int updateExpiredPosts(@Param("newStatus") PostStatusEnum newStatus, @Param("now") Instant now);

        List<Post> findByUser(User user);

        @Query("SELECT p FROM Post p WHERE p.user.email = :userEmail " +
                        "AND (:status IS NULL OR p.status = :status) " +
                        "AND (:type IS NULL OR p.type = :type) " +
                        "AND ( p.deletedByUser = false) " +
                        "AND (:provinceCode IS NULL OR p.province.code = :provinceCode) ")
        Page<Post> findMyPosts(@Param("userEmail") String userEmail,
                        @Param("status") PostStatusEnum status,
                        @Param("type") PostTypeEnum type,
                        @Param("provinceCode") Long provinceCode,
                        Pageable pageable);
}
