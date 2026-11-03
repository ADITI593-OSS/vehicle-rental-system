package com.driveease.vehiclerental.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReturnRequest {

    private LocalDateTime actualReturnDatetime;

    @NotBlank(message = "Vehicle condition is required (e.g. EXCELLENT, GOOD, MINOR_SCRATCH, DAMAGED)")
    private String vehicleCondition = "GOOD";

    @NotNull(message = "Odometer reading is required")
    @Min(value = 0, message = "Odometer reading must be non-negative")
    private Integer odometerReading;

    private String damageNotes;

    private BigDecimal additionalCharges = BigDecimal.ZERO;

    @NotBlank(message = "Deposit refund status is required (FULLY_REFUNDED, PARTIALLY_REFUNDED, FORFEITED, PENDING)")
    private String depositRefundStatus = "FULLY_REFUNDED";

    private String returnedBy = "Admin Staff";

    public ReturnRequest() {
    }

    public LocalDateTime getActualReturnDatetime() {
        return actualReturnDatetime;
    }

    public void setActualReturnDatetime(LocalDateTime actualReturnDatetime) {
        this.actualReturnDatetime = actualReturnDatetime;
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

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public String getDepositRefundStatus() {
        return depositRefundStatus;
    }

    public void setDepositRefundStatus(String depositRefundStatus) {
        this.depositRefundStatus = depositRefundStatus;
    }

    public String getReturnedBy() {
        return returnedBy;
    }

    public void setReturnedBy(String returnedBy) {
        this.returnedBy = returnedBy;
    }
}
