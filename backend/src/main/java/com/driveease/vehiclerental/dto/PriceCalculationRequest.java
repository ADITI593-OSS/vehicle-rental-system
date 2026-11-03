package com.driveease.vehiclerental.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class PriceCalculationRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Pickup datetime is required")
    private LocalDateTime pickupDatetime;

    @NotNull(message = "Expected return datetime is required")
    private LocalDateTime expectedReturnDatetime;

    public PriceCalculationRequest() {
    }

    public PriceCalculationRequest(Long vehicleId, LocalDateTime pickupDatetime, LocalDateTime expectedReturnDatetime) {
        this.vehicleId = vehicleId;
        this.pickupDatetime = pickupDatetime;
        this.expectedReturnDatetime = expectedReturnDatetime;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public LocalDateTime getPickupDatetime() {
        return pickupDatetime;
    }

    public void setPickupDatetime(LocalDateTime pickupDatetime) {
        this.pickupDatetime = pickupDatetime;
    }

    public LocalDateTime getExpectedReturnDatetime() {
        return expectedReturnDatetime;
    }

    public void setExpectedReturnDatetime(LocalDateTime expectedReturnDatetime) {
        this.expectedReturnDatetime = expectedReturnDatetime;
    }
}
