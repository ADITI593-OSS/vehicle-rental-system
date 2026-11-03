package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.PaymentOrderRequest;
import com.driveease.vehiclerental.dto.PaymentOrderResponse;
import com.driveease.vehiclerental.dto.PaymentResponse;
import com.driveease.vehiclerental.dto.PaymentVerifyRequest;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.service.PaymentService;
import com.driveease.vehiclerental.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(@Valid @RequestBody PaymentOrderRequest request,
                                                           Authentication authentication) {
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getUserByEmail(authentication.getName());
        }
        return ResponseEntity.ok(paymentService.createPaymentOrder(request, currentUser));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request,
                                                         Authentication authentication) {
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getUserByEmail(authentication.getName());
        }
        return ResponseEntity.ok(paymentService.verifyAndRecordPayment(request, currentUser));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsForBooking(bookingId));
    }
}
