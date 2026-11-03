package com.driveease.vehiclerental.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalVehicles;
    private long availableVehicles;
    private long rentedVehicles;
    private long maintenanceVehicles;
    private long totalCustomers;
    private long totalBookings;
    private long activeRentals;
    private long pendingReturns;
    private BigDecimal totalRevenue;
    private BigDecimal rentalRevenue;

    // Chart data
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> bookingStatusDistribution;
    private Map<String, Long> monthlyBookings;
    private Map<String, BigDecimal> monthlyRevenue;

    private List<BookingResponse> recentBookings;

    public DashboardSummaryDto() {
    }

    // Getters and Setters
    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public long getAvailableVehicles() {
        return availableVehicles;
    }

    public void setAvailableVehicles(long availableVehicles) {
        this.availableVehicles = availableVehicles;
    }

    public long getRentedVehicles() {
        return rentedVehicles;
    }

    public void setRentedVehicles(long rentedVehicles) {
        this.rentedVehicles = rentedVehicles;
    }

    public long getMaintenanceVehicles() {
        return maintenanceVehicles;
    }

    public void setMaintenanceVehicles(long maintenanceVehicles) {
        this.maintenanceVehicles = maintenanceVehicles;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(long activeRentals) {
        this.activeRentals = activeRentals;
    }

    public long getPendingReturns() {
        return pendingReturns;
    }

    public void setPendingReturns(long pendingReturns) {
        this.pendingReturns = pendingReturns;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getRentalRevenue() {
        return rentalRevenue;
    }

    public void setRentalRevenue(BigDecimal rentalRevenue) {
        this.rentalRevenue = rentalRevenue;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public Map<String, Long> getBookingStatusDistribution() {
        return bookingStatusDistribution;
    }

    public void setBookingStatusDistribution(Map<String, Long> bookingStatusDistribution) {
        this.bookingStatusDistribution = bookingStatusDistribution;
    }

    public Map<String, Long> getMonthlyBookings() {
        return monthlyBookings;
    }

    public void setMonthlyBookings(Map<String, Long> monthlyBookings) {
        this.monthlyBookings = monthlyBookings;
    }

    public Map<String, BigDecimal> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(Map<String, BigDecimal> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public List<BookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }
}
