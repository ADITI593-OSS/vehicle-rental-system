package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.PriceCalculationRequest;
import com.driveease.vehiclerental.dto.PriceCalculationResponse;
import com.driveease.vehiclerental.dto.VehicleDto;
import com.driveease.vehiclerental.service.PricingService;
import com.driveease.vehiclerental.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private PricingService pricingService;

    private boolean isUserAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAllVehicles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            Authentication authentication) {

        boolean isAdmin = isUserAdmin(authentication);

        if (category != null || subCategory != null || fuelType != null ||
                transmission != null || maxPrice != null || status != null || sortBy != null) {
            return ResponseEntity.ok(vehicleService.filterVehicles(
                    category, subCategory, fuelType, transmission, maxPrice, status, sortBy, isAdmin));
        }

        return ResponseEntity.ok(vehicleService.getAllVehicles(isAdmin));
    }

    @GetMapping("/available")
    public ResponseEntity<List<VehicleDto>> getAvailableVehicles(Authentication authentication) {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles(isUserAdmin(authentication)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByCategory(
            @PathVariable String category,
            Authentication authentication) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCategory(category.toUpperCase(), isUserAdmin(authentication)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleDto>> searchVehicles(
            @RequestParam(required = false) String category,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickup,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnTime,
            @RequestParam(required = false) String location,
            Authentication authentication) {
        return ResponseEntity.ok(vehicleService.searchAvailableVehicles(
                category, pickup, returnTime, location, isUserAdmin(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id, isUserAdmin(authentication)));
    }

    @PostMapping("/calculate-price")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(@Valid @RequestBody PriceCalculationRequest request) {
        return ResponseEntity.ok(pricingService.calculatePrice(request));
    }
}
