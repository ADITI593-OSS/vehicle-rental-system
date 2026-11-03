package com.driveease.vehiclerental.dto;

import java.math.BigDecimal;

public class PriceCalculationResponse {
    private Long vehicleId;
    private String vehicleName;
    private Integer rentalDurationHours;
    private Integer rentalDays;
    private Integer remainingHours;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private BigDecimal baseRentalAmount;
    private BigDecimal securityDeposit;
    private BigDecimal taxAmount;
    private BigDecimal totalEstimatedAmount;
    private boolean available;
    private String message;

    public PriceCalculationResponse() {
    }

    // Getters and Setters
    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public Integer getRentalDurationHours() {
        return rentalDurationHours;
    }

    public void setRentalDurationHours(Integer rentalDurationHours) {
        this.rentalDurationHours = rentalDurationHours;
    }

    public Integer getRentalDays() {
        return rentalDays;
    }

    public void setRentalDays(Integer rentalDays) {
        this.rentalDays = rentalDays;
    }

    public Integer getRemainingHours() {
        return remainingHours;
    }

    public void setRemainingHours(Integer remainingHours) {
        this.remainingHours = remainingHours;
    }

    public BigDecimal getPricePerHour() {
        return pricePerHour;
    }

    public void setPricePerHour(BigDecimal pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public BigDecimal getBaseRentalAmount() {
        return baseRentalAmount;
    }

    public void setBaseRentalAmount(BigDecimal baseRentalAmount) {
        this.baseRentalAmount = baseRentalAmount;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalEstimatedAmount() {
        return totalEstimatedAmount;
    }

    public void setTotalEstimatedAmount(BigDecimal totalEstimatedAmount) {
        this.totalEstimatedAmount = totalEstimatedAmount;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
