package vn.thanhdattanphuoc.batdongsan360.repository;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.status = :newStatus WHERE p.expireDate < :now")
    int updateExpiredPosts(@Param("newStatus") PostStatusEnum newStatus, @Param("now") Instant now);

}
