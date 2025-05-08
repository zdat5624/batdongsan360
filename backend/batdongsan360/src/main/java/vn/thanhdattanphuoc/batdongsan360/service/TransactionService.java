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
import vn.thanhdattanphuoc.batdongsan360.util.error.NotFoundException;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch id: " + id));
    }
    
    public Page<Transaction> getTransactions(
            Pageable pageable, String email, Long transactionId, String txnId,
            TransStatusEnum status, TransactionFilterType type, Instant startDate, Instant endDate) {
        String typeStr = type != null ? type.name() : null;
        return transactionRepository.findTransactionsWithFilters(
                email, transactionId, txnId, status, typeStr, startDate, endDate, pageable);
    }

    public Page<Transaction> getUserTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable);
    }

    public Page<Transaction> getCurrentUserTransactions(Pageable pageable, TransactionFilterType type, TransStatusEnum status) {
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
                return transactionRepository.findByUserIdAndAmountGreaterThanAndStatus(user.get().getId(), 0, status, pageable);
            case PAYMENT:
                return transactionRepository.findByUserIdAndAmountLessThanAndStatus(user.get().getId(), 0, status, pageable);
            case ALL:
            default:
                return transactionRepository.findByUserIdAndStatus(user.get().getId(), status, pageable);
        }
    }
}
