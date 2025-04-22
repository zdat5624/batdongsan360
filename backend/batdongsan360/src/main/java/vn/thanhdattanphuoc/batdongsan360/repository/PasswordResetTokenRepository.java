package vn.thanhdattanphuoc.batdongsan360.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.thanhdattanphuoc.batdongsan360.domain.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUserEmail(String token, String email);
}
