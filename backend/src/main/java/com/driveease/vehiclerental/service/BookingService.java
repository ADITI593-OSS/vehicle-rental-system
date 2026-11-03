package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.BookingRequest;
import com.driveease.vehiclerental.dto.BookingResponse;
import com.driveease.vehiclerental.dto.PriceCalculationRequest;
import com.driveease.vehiclerental.dto.PriceCalculationResponse;
import com.driveease.vehiclerental.entity.Booking;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.exception.BadRequestException;
import com.driveease.vehiclerental.exception.ResourceNotFoundException;
import com.driveease.vehiclerental.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private PricingService pricingService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User customer) {
        LocalDateTime pickup = request.getPickupDatetime();
        LocalDateTime returnTime = request.getExpectedReturnDatetime();

        if (pickup == null || returnTime == null) {
            throw new BadRequestException("Pickup and return dates are required");
        }

        if (!returnTime.isAfter(pickup)) {
            throw new BadRequestException("Return date and time must be after pickup date and time");
        }

        if (pickup.isBefore(LocalDateTime.now().minusMinutes(15))) {
            throw new BadRequestException("Pickup time cannot be in the past");
        }

        Vehicle vehicle = vehicleService.getVehicleEntity(request.getVehicleId());

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getVehicleStatus())) {
            throw new BadRequestException("This vehicle is currently " + vehicle.getVehicleStatus() + " and cannot be booked.");
        }

        // Availability overlap check
        boolean isAvailable = vehicleService.isVehicleAvailableForDates(vehicle.getId(), pickup, returnTime, null);
        if (!isAvailable) {
            throw new BadRequestException("Vehicle is already booked by another customer for the requested time range. Please choose different dates.");
        }

        // Calculate pricing
        PriceCalculationRequest priceReq = new PriceCalculationRequest(vehicle.getId(), pickup, returnTime);
        PriceCalculationResponse priceRes = pricingService.calculatePrice(priceReq);

        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setPickupDatetime(pickup);
        booking.setExpectedReturnDatetime(returnTime);
        booking.setRentalDurationHours(priceRes.getRentalDurationHours());
        booking.setRentalAmount(priceRes.getBaseRentalAmount());
        booking.setSecurityDeposit(priceRes.getSecurityDeposit());
        booking.setTaxAmount(priceRes.getTaxAmount());
        booking.setTotalAmount(priceRes.getTotalEstimatedAmount());
        booking.setBookingStatus("CONFIRMED");
        booking.setPickupLocation(request.getPickupLocation() != null ? request.getPickupLocation() : vehicle.getLocation());
        booking.setDropLocation(request.getDropLocation() != null ? request.getDropLocation() : vehicle.getLocation());
        booking.setNotes(request.getNotes());
        booking.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI_GPAY");
        booking.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "SUCCESS");
        booking.setTransactionReference(request.getTransactionReference() != null ? request.getTransactionReference() : ("TXN" + System.currentTimeMillis()));

        Booking saved = bookingRepository.save(booking);

        return mapToDto(saved);
    }

    public List<BookingResponse> getMyBookings(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id, User currentUser, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this booking");
        }

        return mapToDto(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, User currentUser, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && !booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to cancel this booking");
        }

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new BadRequestException("Completed rentals cannot be cancelled");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setBookingStatus("CANCELLED");
        Booking updated = bookingRepository.save(booking);

        return mapToDto(updated);
    }

    public List<BookingResponse> getAllBookings(String status) {
        List<Booking> list;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            list = bookingRepository.findByBookingStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            list = bookingRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    public BookingResponse mapToDto(Booking b) {
        BookingResponse dto = new BookingResponse();
        dto.setId(b.getId());
        dto.setBookingReference(b.getBookingReference());
        dto.setCustomerId(b.getCustomer().getId());
        dto.setCustomerName(b.getCustomer().getFullName());
        dto.setCustomerEmail(b.getCustomer().getEmail());
        dto.setCustomerMobile(b.getCustomer().getMobileNumber());

        dto.setVehicleId(b.getVehicle().getId());
        dto.setVehicleName(b.getVehicle().getBrand() + " " + b.getVehicle().getModel());
        dto.setVehicleCategory(b.getVehicle().getCategory());
        dto.setVehicleRegistration(b.getVehicle().getRegistrationNumber());
        dto.setVehicleImageUrl(b.getVehicle().getImageUrl());

        dto.setPickupDatetime(b.getPickupDatetime());
        dto.setExpectedReturnDatetime(b.getExpectedReturnDatetime());
        dto.setActualReturnDatetime(b.getActualReturnDatetime());
        dto.setRentalDurationHours(b.getRentalDurationHours());
        dto.setRentalAmount(b.getRentalAmount());
        dto.setAdditionalCharges(b.getAdditionalCharges());
        dto.setLateFee(b.getLateFee());
        dto.setSecurityDeposit(b.getSecurityDeposit());
        dto.setTaxAmount(b.getTaxAmount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setBookingStatus(b.getBookingStatus());
        dto.setPickupLocation(b.getPickupLocation());
        dto.setDropLocation(b.getDropLocation());
        dto.setNotes(b.getNotes());
        dto.setPaymentStatus(b.getPaymentStatus() != null ? b.getPaymentStatus() : "SUCCESS");
        dto.setPaymentMethod(b.getPaymentMethod() != null ? b.getPaymentMethod() : "UPI");
        dto.setTransactionReference(b.getTransactionReference());
        dto.setCreatedAt(b.getCreatedAt());

        // Eligible for cancellation if not already cancelled or completed
        boolean eligible = "CONFIRMED".equalsIgnoreCase(b.getBookingStatus()) ||
                           "PENDING".equalsIgnoreCase(b.getBookingStatus());
        dto.setEligibleForCancellation(eligible);

        return dto;
    }

    private String generateBookingReference() {
        int randomCode = 1000 + (int)(Math.random() * 9000);
        return "DER-" + LocalDateTime.now().getYear() + "-" + randomCode;
    }
}
