package vn.thanhdattanphuoc.batdongsan360.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.status = 'FAILED', t.description = 'Giao dịch hết hạn' WHERE t.status = 'PENDING' AND t.createdAt <= :expiryTime")
    int updateExpiredTransactions(Instant expiryTime);

    Optional<Transaction> findByTxnId(String txnId);

    Page<Transaction> findAll(Pageable pageable);

    Page<Transaction> findByUserId(Long userId, Pageable pageable);
}
