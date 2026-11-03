package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.PriceCalculationRequest;
import com.driveease.vehiclerental.dto.PriceCalculationResponse;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PricingService {

    @Autowired
    private VehicleService vehicleService;

    @Value("${app.rental.tax-rate:0.05}")
    private BigDecimal taxRate;

    public PriceCalculationResponse calculatePrice(PriceCalculationRequest request) {
        LocalDateTime pickup = request.getPickupDatetime();
        LocalDateTime returnTime = request.getExpectedReturnDatetime();

        if (pickup == null || returnTime == null) {
            throw new BadRequestException("Pickup and return dates are required");
        }

        if (!returnTime.isAfter(pickup)) {
            throw new BadRequestException("Expected return time must be strictly after pickup time");
        }

        Vehicle vehicle = vehicleService.getVehicleEntity(request.getVehicleId());

        long minutes = Duration.between(pickup, returnTime).toMinutes();
        int totalHours = (int) Math.ceil((double) minutes / 60.0);
        if (totalHours <= 0) {
            totalHours = 1;
        }

        int days = totalHours / 24;
        int remainingHours = totalHours % 24;

        BigDecimal baseRentalAmount;
        if (days == 0) {
            // Less than 24 hours: hourly rate, capped at daily rate if total hourly > daily
            BigDecimal hourlyTotal = vehicle.getPricePerHour().multiply(BigDecimal.valueOf(totalHours));
            if (hourlyTotal.compareTo(vehicle.getPricePerDay()) > 0) {
                baseRentalAmount = vehicle.getPricePerDay();
            } else {
                baseRentalAmount = hourlyTotal;
            }
        } else {
            // Multiple days: days * pricePerDay + remainingHours * pricePerHour (capped at 1 day)
            BigDecimal daysAmount = vehicle.getPricePerDay().multiply(BigDecimal.valueOf(days));
            BigDecimal extraHoursAmount = vehicle.getPricePerHour().multiply(BigDecimal.valueOf(remainingHours));
            if (extraHoursAmount.compareTo(vehicle.getPricePerDay()) > 0) {
                extraHoursAmount = vehicle.getPricePerDay();
            }
            baseRentalAmount = daysAmount.add(extraHoursAmount);
        }

        baseRentalAmount = baseRentalAmount.setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxAmount = baseRentalAmount.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal securityDeposit = vehicle.getSecurityDeposit();
        BigDecimal totalEstimatedAmount = baseRentalAmount.add(taxAmount).add(securityDeposit);

        boolean available = vehicleService.isVehicleAvailableForDates(vehicle.getId(), pickup, returnTime, null);

        PriceCalculationResponse response = new PriceCalculationResponse();
        response.setVehicleId(vehicle.getId());
        response.setVehicleName(vehicle.getBrand() + " " + vehicle.getModel());
        response.setRentalDurationHours(totalHours);
        response.setRentalDays(days);
        response.setRemainingHours(remainingHours);
        response.setPricePerHour(vehicle.getPricePerHour());
        response.setPricePerDay(vehicle.getPricePerDay());
        response.setBaseRentalAmount(baseRentalAmount);
        response.setSecurityDeposit(securityDeposit);
        response.setTaxAmount(taxAmount);
        response.setTotalEstimatedAmount(totalEstimatedAmount);
        response.setAvailable(available);

        if (!available) {
            response.setMessage("This vehicle is already booked or unavailable for the selected time range. Please choose another slot or vehicle.");
        } else {
            response.setMessage("Vehicle is available for your selected dates!");
        }

        return response;
    }
}
