package vn.thanhdattanphuoc.batdongsan360.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.repository.PostRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.TransactionRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.response.AdminStatisticsDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.MonthlyRevenueDTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminStatisticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    public AdminStatisticsDTO getStatistics() {
        // Lấy năm và tháng hiện tại
        LocalDate now = LocalDate.now();
        int targetYear = now.getYear();
        int targetMonth = now.getMonthValue();

        AdminStatisticsDTO dto = new AdminStatisticsDTO();

        // 1. Doanh thu năm: Tổng amount của các giao dịch SUCCESS trong năm hiện tại
        Long totalRevenueYear = transactionRepository.sumAmountByYearAndStatus(
                targetYear, TransStatusEnum.SUCCESS);
        dto.setTotalRevenueYear(totalRevenueYear != null ? totalRevenueYear : 0L);

        // 2. Doanh thu tháng: Tổng amount của các giao dịch SUCCESS trong tháng hiện tại
        Long totalRevenueMonth = transactionRepository.sumAmountByYearMonthAndStatus(
                targetYear, targetMonth, TransStatusEnum.SUCCESS);
        dto.setTotalRevenueMonth(totalRevenueMonth != null ? totalRevenueMonth : 0L);

        // 3. Tổng số người dùng
        Long totalUsers = userRepository.count();
        dto.setTotalUsers(totalUsers);

        // 4. Số bài đăng chờ duyệt (PENDING hoặc REVIEW_LATER)
        Long pendingPosts = postRepository.countByStatusIn(
                PostStatusEnum.PENDING, PostStatusEnum.REVIEW_LATER);
        dto.setPendingPosts(pendingPosts);

        return dto;
    }
    
    public List<MonthlyRevenueDTO> getMonthlyRevenue(Integer year) {
        List<MonthlyRevenueDTO> monthlyRevenues = new ArrayList<>();

        // Lặp qua 12 tháng
        for (int month = 1; month <= 12; month++) {
            // Tính tổng doanh thu cho tháng cụ thể
            Long revenue = transactionRepository.sumAmountByYearMonthAndStatus(
                    year, month, TransStatusEnum.SUCCESS);
            monthlyRevenues.add(new MonthlyRevenueDTO(month, revenue != null ? revenue : 0L));
        }

        return monthlyRevenues;
    }
}