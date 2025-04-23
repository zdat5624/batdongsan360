package vn.thanhdattanphuoc.batdongsan360.service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.repository.TransactionRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransactionFilterType;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Page<Transaction> getTransactions(Pageable pageable, Long userId, TransStatusEnum status, Instant startDate,
            Instant endDate) {
        return transactionRepository.findTransactionsWithFilters(userId, status, startDate, endDate, pageable);
    }

    public Page<Transaction> getUserTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable);
    }

    public Page<Transaction> getCurrentUserTransactions(Pageable pageable, TransactionFilterType type) {
        Optional<String> currentUserLogin = SecurityUtil.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            throw new IllegalStateException("User not authenticated");
        }

        Optional<User> user = userRepository.findByEmail(currentUserLogin.get());
        if (user.isEmpty()) {
            throw new IllegalStateException("User not found");
        }

        switch (type) {
            case DEPOSIT:
                return transactionRepository.findByUserIdAndAmountGreaterThan(user.get().getId(), 0, pageable);
            case PAYMENT:
                return transactionRepository.findByUserIdAndAmountLessThan(user.get().getId(), 0, pageable);
            case ALL:
            default:
                return transactionRepository.findByUserId(user.get().getId(), pageable);
        }
    }
}
