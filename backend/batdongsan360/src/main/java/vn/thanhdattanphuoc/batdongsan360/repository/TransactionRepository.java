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
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
        @Modifying
        @Transactional
        @Query("UPDATE Transaction t SET t.status = 'FAILED', t.description = 'Giao dịch hết hạn' WHERE t.status = 'PENDING' AND t.createdAt <= :expiryTime")
        int updateExpiredTransactions(Instant expiryTime);

        Optional<Transaction> findByTxnId(String txnId);

        @Query("SELECT t FROM Transaction t WHERE "
                        + "(:userId IS NULL OR t.user.id = :userId) AND "
                        + "(:status IS NULL OR t.status = :status) AND "
                        + "(:startDate IS NULL OR t.createdAt >= :startDate) AND "
                        + "(:endDate IS NULL OR t.createdAt <= :endDate)")
        Page<Transaction> findTransactionsWithFilters(
                        Long userId,
                        TransStatusEnum status,
                        Instant startDate,
                        Instant endDate,
                        Pageable pageable);

        Page<Transaction> findByUserId(Long userId, Pageable pageable);
}
