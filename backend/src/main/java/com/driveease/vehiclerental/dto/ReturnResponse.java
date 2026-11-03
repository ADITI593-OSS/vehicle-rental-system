package com.driveease.vehiclerental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReturnResponse {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private String customerName;
    private String vehicleName;
    private LocalDateTime expectedReturnDatetime;
    private LocalDateTime actualReturnDatetime;
    private long lateHours;
    private String vehicleCondition;
    private Integer odometerReading;
    private String damageNotes;
    private BigDecimal originalRentalAmount;
    private BigDecimal additionalCharges;
    private BigDecimal lateFee;
    private BigDecimal securityDeposit;
    private String depositRefundStatus;
    private BigDecimal finalAmount;
    private BigDecimal refundOrOutstandingAmount;
    private String returnedBy;
    private LocalDateTime createdAt;

    public ReturnResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public LocalDateTime getExpectedReturnDatetime() {
        return expectedReturnDatetime;
    }

    public void setExpectedReturnDatetime(LocalDateTime expectedReturnDatetime) {
        this.expectedReturnDatetime = expectedReturnDatetime;
    }

    public LocalDateTime getActualReturnDatetime() {
        return actualReturnDatetime;
    }

    public void setActualReturnDatetime(LocalDateTime actualReturnDatetime) {
        this.actualReturnDatetime = actualReturnDatetime;
    }

    public long getLateHours() {
        return lateHours;
    }

    public void setLateHours(long lateHours) {
        this.lateHours = lateHours;
    }

    public String getVehicleCondition() {
        return vehicleCondition;
    }

    public void setVehicleCondition(String vehicleCondition) {
        this.vehicleCondition = vehicleCondition;
    }

    public Integer getOdometerReading() {
        return odometerReading;
    }

    public void setOdometerReading(Integer odometerReading) {
        this.odometerReading = odometerReading;
    }

    public String getDamageNotes() {
        return damageNotes;
    }

    public void setDamageNotes(String damageNotes) {
        this.damageNotes = damageNotes;
    }

    public BigDecimal getOriginalRentalAmount() {
        return originalRentalAmount;
    }

    public void setOriginalRentalAmount(BigDecimal originalRentalAmount) {
        this.originalRentalAmount = originalRentalAmount;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getLateFee() {
        return lateFee;
    }

    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public String getDepositRefundStatus() {
        return depositRefundStatus;
    }

    public void setDepositRefundStatus(String depositRefundStatus) {
        this.depositRefundStatus = depositRefundStatus;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public BigDecimal getRefundOrOutstandingAmount() {
        return refundOrOutstandingAmount;
    }

    public void setRefundOrOutstandingAmount(BigDecimal refundOrOutstandingAmount) {
        this.refundOrOutstandingAmount = refundOrOutstandingAmount;
    }

    public String getReturnedBy() {
        return returnedBy;
    }

    public void setReturnedBy(String returnedBy) {
        this.returnedBy = returnedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
