package vn.thanhdattanphuoc.batdongsan360.util.constant;

public enum TransactionFilterType {
    DEPOSIT, // Nạp tiền (amount > 0)
    PAYMENT, // Thanh toán (amount < 0)
    ALL // Tất cả giao dịch
}