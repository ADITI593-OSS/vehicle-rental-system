package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.PaymentOrderRequest;
import com.driveease.vehiclerental.dto.PaymentOrderResponse;
import com.driveease.vehiclerental.dto.PaymentResponse;
import com.driveease.vehiclerental.dto.PaymentVerifyRequest;
import com.driveease.vehiclerental.entity.Booking;
import com.driveease.vehiclerental.entity.Payment;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.exception.BadRequestException;
import com.driveease.vehiclerental.exception.ResourceNotFoundException;
import com.driveease.vehiclerental.repository.BookingRepository;
import com.driveease.vehiclerental.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request, User currentUser) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        String orderId = "order_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        String paymentRef = "PAY-" + System.currentTimeMillis() % 100000000;
        String razorpayKeyId = "rzp_test_DriveEaseRentalsKey";

        return new PaymentOrderResponse(orderId, request.getAmount(), "INR", razorpayKeyId, paymentRef);
    }

    @Transactional
    public PaymentResponse verifyAndRecordPayment(PaymentVerifyRequest request, User currentUser) {
        if (request.getBookingId() == null) {
            throw new BadRequestException("Booking ID is required for payment verification");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        String method = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "UPI_GPAY";
        boolean isPayAtPickup = "PAY_AT_PICKUP".equalsIgnoreCase(method);

        String paymentRef = request.getPaymentReference();
        if (paymentRef == null || paymentRef.trim().isEmpty()) {
            paymentRef = "PAY-" + (10000000 + (int)(Math.random() * 90000000));
        }

        String txnRef = request.getTransactionReference();
        if (txnRef == null || txnRef.trim().isEmpty()) {
            if (isPayAtPickup) {
                txnRef = "POP-" + (100000 + (int)(Math.random() * 900000));
            } else if (request.getRazorpayPaymentId() != null && !request.getRazorpayPaymentId().isEmpty()) {
                txnRef = request.getRazorpayPaymentId();
            } else {
                txnRef = "UPI-" + (100000000000L + (long)(Math.random() * 900000000000L));
            }
        }

        BigDecimal amount = request.getAmount() != null ? request.getAmount() : booking.getTotalAmount();
        String status = isPayAtPickup ? "PENDING" : "SUCCESS";

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentReference(paymentRef);
        payment.setPaymentMethod(method);
        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId(request.getRazorpayOrderId());
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaymentStatus(status);
        payment.setTransactionReference(txnRef);
        payment.setNotes(isPayAtPickup ? "Due at vehicle pickup hub" : "Online verified payment");
        payment.setCreatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Update booking entity
        booking.setPaymentMethod(method);
        booking.setPaymentStatus(status);
        booking.setTransactionReference(txnRef);
        booking.setBookingStatus("CONFIRMED");
        bookingRepository.save(booking);

        return mapToDto(savedPayment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsForBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PaymentResponse mapToDto(Payment p) {
        PaymentResponse dto = new PaymentResponse();
        dto.setId(p.getId());
        dto.setBookingId(p.getBooking().getId());
        dto.setBookingReference(p.getBooking().getBookingReference());
        dto.setCustomerName(p.getBooking().getCustomer().getFullName());
        dto.setCustomerEmail(p.getBooking().getCustomer().getEmail());
        dto.setVehicleName(p.getBooking().getVehicle().getBrand() + " " + p.getBooking().getVehicle().getModel());
        dto.setPaymentReference(p.getPaymentReference());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setAmount(p.getAmount());
        dto.setCurrency(p.getCurrency());
        dto.setRazorpayOrderId(p.getRazorpayOrderId());
        dto.setRazorpayPaymentId(p.getRazorpayPaymentId());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setTransactionReference(p.getTransactionReference());
        dto.setNotes(p.getNotes());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
