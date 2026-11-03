package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.BookingResponse;
import com.driveease.vehiclerental.dto.ReturnRequest;
import com.driveease.vehiclerental.dto.ReturnResponse;
import com.driveease.vehiclerental.entity.Booking;
import com.driveease.vehiclerental.entity.ReturnRecord;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.exception.BadRequestException;
import com.driveease.vehiclerental.exception.ResourceNotFoundException;
import com.driveease.vehiclerental.repository.BookingRepository;
import com.driveease.vehiclerental.repository.ReturnRecordRepository;
import com.driveease.vehiclerental.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReturnService {

    @Autowired
    private ReturnRecordRepository returnRecordRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingService bookingService;

    @Value("${app.rental.default-late-fee-per-hour:150.00}")
    private BigDecimal defaultLateFeePerHour;

    @Transactional
    public ReturnResponse processReturn(Long bookingId, ReturnRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new BadRequestException("This booking has already been returned and marked as completed");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new BadRequestException("Cancelled bookings cannot be processed for return");
        }

        if (returnRecordRepository.existsByBookingId(bookingId)) {
            throw new BadRequestException("A return record already exists for this booking");
        }

        LocalDateTime actualReturn = request.getActualReturnDatetime() != null ?
                request.getActualReturnDatetime() : LocalDateTime.now();

        // Calculate late hours and late fee
        long lateHours = 0;
        BigDecimal lateFee = BigDecimal.ZERO;
        if (actualReturn.isAfter(booking.getExpectedReturnDatetime())) {
            long minutesLate = Duration.between(booking.getExpectedReturnDatetime(), actualReturn).toMinutes();
            // 30-minute grace period
            if (minutesLate > 30) {
                lateHours = (long) Math.ceil((double) minutesLate / 60.0);
                // Late fee is hourly price * 1.5 or configured fee
                BigDecimal hourlyRate = booking.getVehicle().getPricePerHour().multiply(BigDecimal.valueOf(1.5));
                lateFee = hourlyRate.multiply(BigDecimal.valueOf(lateHours)).setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal additionalCharges = request.getAdditionalCharges() != null ?
                request.getAdditionalCharges() : BigDecimal.ZERO;

        BigDecimal totalExtraCharges = lateFee.add(additionalCharges);
        BigDecimal securityDeposit = booking.getSecurityDeposit();

        // Refund or outstanding amount calculation
        BigDecimal refundOrOutstanding = securityDeposit.subtract(totalExtraCharges);

        // Update booking
        booking.setActualReturnDatetime(actualReturn);
        booking.setLateFee(lateFee);
        booking.setAdditionalCharges(additionalCharges);
        booking.setBookingStatus("COMPLETED");
        booking.setTotalAmount(booking.getRentalAmount().add(booking.getTaxAmount()).add(totalExtraCharges));
        bookingRepository.save(booking);

        // Free up vehicle
        Vehicle vehicle = booking.getVehicle();
        vehicle.setVehicleStatus("AVAILABLE");
        vehicleRepository.save(vehicle);

        // Create return record
        ReturnRecord returnRecord = new ReturnRecord();
        returnRecord.setBooking(booking);
        returnRecord.setActualReturnDatetime(actualReturn);
        returnRecord.setVehicleCondition(request.getVehicleCondition());
        returnRecord.setOdometerReading(request.getOdometerReading());
        returnRecord.setDamageNotes(request.getDamageNotes());
        returnRecord.setAdditionalCharges(additionalCharges);
        returnRecord.setLateFee(lateFee);
        returnRecord.setDepositRefundStatus(request.getDepositRefundStatus());
        returnRecord.setFinalAmount(booking.getTotalAmount());
        returnRecord.setReturnedBy(request.getReturnedBy() != null ? request.getReturnedBy() : "Admin Staff");

        ReturnRecord savedRecord = returnRecordRepository.save(returnRecord);

        return mapToReturnResponse(savedRecord, lateHours, refundOrOutstanding);
    }

    public List<BookingResponse> getPendingReturns() {
        return bookingRepository.findPendingReturns().stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());
    }

    public ReturnResponse getReturnByBookingId(Long bookingId) {
        ReturnRecord record = returnRecordRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No return record found for booking ID: " + bookingId));

        long lateHours = 0;
        if (record.getActualReturnDatetime().isAfter(record.getBooking().getExpectedReturnDatetime())) {
            long minutesLate = Duration.between(record.getBooking().getExpectedReturnDatetime(), record.getActualReturnDatetime()).toMinutes();
            if (minutesLate > 30) {
                lateHours = (long) Math.ceil((double) minutesLate / 60.0);
            }
        }
        BigDecimal extra = record.getLateFee().add(record.getAdditionalCharges());
        BigDecimal refund = record.getBooking().getSecurityDeposit().subtract(extra);

        return mapToReturnResponse(record, lateHours, refund);
    }

    public List<ReturnResponse> getAllReturns() {
        return returnRecordRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> {
                    long lateHours = 0;
                    if (r.getActualReturnDatetime().isAfter(r.getBooking().getExpectedReturnDatetime())) {
                        long minutesLate = Duration.between(r.getBooking().getExpectedReturnDatetime(), r.getActualReturnDatetime()).toMinutes();
                        if (minutesLate > 30) {
                            lateHours = (long) Math.ceil((double) minutesLate / 60.0);
                        }
                    }
                    BigDecimal extra = r.getLateFee().add(r.getAdditionalCharges());
                    BigDecimal refund = r.getBooking().getSecurityDeposit().subtract(extra);
                    return mapToReturnResponse(r, lateHours, refund);
                })
                .collect(Collectors.toList());
    }

    private ReturnResponse mapToReturnResponse(ReturnRecord r, long lateHours, BigDecimal refundOrOutstanding) {
        ReturnResponse dto = new ReturnResponse();
        dto.setId(r.getId());
        dto.setBookingId(r.getBooking().getId());
        dto.setBookingReference(r.getBooking().getBookingReference());
        dto.setCustomerName(r.getBooking().getCustomer().getFullName());
        dto.setVehicleName(r.getBooking().getVehicle().getBrand() + " " + r.getBooking().getVehicle().getModel());
        dto.setExpectedReturnDatetime(r.getBooking().getExpectedReturnDatetime());
        dto.setActualReturnDatetime(r.getActualReturnDatetime());
        dto.setLateHours(lateHours);
        dto.setVehicleCondition(r.getVehicleCondition());
        dto.setOdometerReading(r.getOdometerReading());
        dto.setDamageNotes(r.getDamageNotes());
        dto.setOriginalRentalAmount(r.getBooking().getRentalAmount());
        dto.setAdditionalCharges(r.getAdditionalCharges());
        dto.setLateFee(r.getLateFee());
        dto.setSecurityDeposit(r.getBooking().getSecurityDeposit());
        dto.setDepositRefundStatus(r.getDepositRefundStatus());
        dto.setFinalAmount(r.getFinalAmount());
        dto.setRefundOrOutstandingAmount(refundOrOutstanding);
        dto.setReturnedBy(r.getReturnedBy());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
