package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.DashboardSummaryDto;
import com.driveease.vehiclerental.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(adminDashboardService.getDashboardSummary());
    }

    @GetMapping("/booking-statistics")
    public ResponseEntity<Map<String, Long>> getBookingStatistics() {
        DashboardSummaryDto summary = adminDashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary.getMonthlyBookings());
    }

    @GetMapping("/revenue-statistics")
    public ResponseEntity<Map<String, BigDecimal>> getRevenueStatistics() {
        DashboardSummaryDto summary = adminDashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary.getMonthlyRevenue());
    }
}
