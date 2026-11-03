package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.*;
import com.driveease.vehiclerental.service.BookingService;
import com.driveease.vehiclerental.service.ReturnService;
import com.driveease.vehiclerental.service.UserService;
import com.driveease.vehiclerental.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private UserService userService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReturnService returnService;

    // --- Vehicle Management ---
    @PostMapping("/vehicles")
    public ResponseEntity<VehicleDto> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return new ResponseEntity<>(vehicleService.createVehicle(request), HttpStatus.CREATED);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Map<String, String>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(Map.of("message", "Vehicle set to INACTIVE successfully"));
    }

    @PatchMapping("/vehicles/{id}/status")
    public ResponseEntity<VehicleDto> updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(id, status));
    }

    // --- Customer Management ---
    @GetMapping("/customers")
    public ResponseEntity<List<UserDto>> getAllCustomers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getAllCustomers(search));
    }

    @PatchMapping("/customers/{id}/toggle-status")
    public ResponseEntity<UserDto> toggleCustomerStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleCustomerStatus(id));
    }

    // --- Rental / Booking Management ---
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    // --- Return Management ---
    @GetMapping("/returns/pending")
    public ResponseEntity<List<BookingResponse>> getPendingReturns() {
        return ResponseEntity.ok(returnService.getPendingReturns());
    }

    @PostMapping("/returns/{bookingId}")
    public ResponseEntity<ReturnResponse> processReturn(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReturnRequest request) {
        return ResponseEntity.ok(returnService.processReturn(bookingId, request));
    }

    @GetMapping("/returns")
    public ResponseEntity<List<ReturnResponse>> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturns());
    }
}
