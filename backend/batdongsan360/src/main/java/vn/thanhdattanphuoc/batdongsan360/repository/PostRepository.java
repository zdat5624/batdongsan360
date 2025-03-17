package vn.thanhdattanphuoc.batdongsan360.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.thanhdattanphuoc.batdongsan360.domain.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
}
