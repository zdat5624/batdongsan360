package vn.thanhdattanphuoc.batdongsan360.controller;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import vn.thanhdattanphuoc.batdongsan360.service.TransactionService;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;

@RestController
public class TransactionController {
    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/api/admin/payment/transactions")
    public ResponseEntity<Page<Transaction>> getTransactions(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) TransStatusEnum status, // Vẫn nhận String từ request
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        // TransStatusEnum transStatus = (status != null) ?
        // TransStatusEnum.valueOf(status) : null;
        Page<Transaction> transactions = transactionService.getTransactions(pageable, userId, status, startDate,
                endDate);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/api/payment/my-transactions")
    public ResponseEntity<Page<Transaction>> getMyTransactions(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Transaction> transactions = transactionService.getCurrentUserTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }
}
