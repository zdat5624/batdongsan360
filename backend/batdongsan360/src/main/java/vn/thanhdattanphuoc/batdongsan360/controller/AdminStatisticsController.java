package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.Min;
import vn.thanhdattanphuoc.batdongsan360.service.AdminStatisticsService;
import vn.thanhdattanphuoc.batdongsan360.util.response.AdminStatisticsDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.MonthlyRevenueDTO;


import java.util.List;

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    @Autowired
    private AdminStatisticsService adminStatisticsService;

    @GetMapping
    public ResponseEntity<AdminStatisticsDTO> getStatistics() {
        AdminStatisticsDTO statistics = adminStatisticsService.getStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyRevenue(
            @RequestParam("year") @Min(value = 2000, message = "Year must be greater than or equal to 2000") Integer year) {
        List<MonthlyRevenueDTO> monthlyRevenues = adminStatisticsService.getMonthlyRevenue(year);
        return ResponseEntity.ok(monthlyRevenues);
    }
}