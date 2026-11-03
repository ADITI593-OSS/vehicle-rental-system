package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.BookingRequest;
import com.driveease.vehiclerental.dto.BookingResponse;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.security.UserDetailsImpl;
import com.driveease.vehiclerental.service.BookingService;
import com.driveease.vehiclerental.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return userService.getUserById(principal.getId());
    }

    private boolean isUserAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        User customer = getAuthenticatedUser(authentication);
        BookingResponse response = bookingService.createBooking(request, customer);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        User customer = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(bookingService.getMyBookings(customer.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        boolean isAdmin = isUserAdmin(authentication);
        return ResponseEntity.ok(bookingService.getBookingById(id, user, isAdmin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        boolean isAdmin = isUserAdmin(authentication);
        return ResponseEntity.ok(bookingService.cancelBooking(id, user, isAdmin));
    }
}
