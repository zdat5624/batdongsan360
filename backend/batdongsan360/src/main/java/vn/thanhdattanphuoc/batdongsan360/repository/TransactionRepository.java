package vn.thanhdattanphuoc.batdongsan360.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.status = 'FAILED', t.description = 'Giao dịch hết hạn' WHERE t.status = 'PENDING' AND t.createdAt <= :expiryTime")
    int updateExpiredTransactions(Instant expiryTime);

    Optional<Transaction> findByTxnId(String txnId);
}
