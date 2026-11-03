package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.VehicleDto;
import com.driveease.vehiclerental.dto.VehicleRequest;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.exception.BadRequestException;
import com.driveease.vehiclerental.exception.ResourceNotFoundException;
import com.driveease.vehiclerental.repository.BookingRepository;
import com.driveease.vehiclerental.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public VehicleDto mapToDto(Vehicle v, boolean isAdmin) {
        VehicleDto dto = new VehicleDto();
        dto.setId(v.getId());
        dto.setBrand(v.getBrand());
        dto.setModel(v.getModel());

        // Mask registration number for general public, show full for Admin
        if (isAdmin) {
            dto.setRegistrationNumber(v.getRegistrationNumber());
        } else {
            String reg = v.getRegistrationNumber();
            if (reg != null && reg.length() > 6) {
                dto.setRegistrationNumber(reg.substring(0, 4) + "-XX-XXXX");
            } else {
                dto.setRegistrationNumber("MH-XX-XXXX");
            }
        }

        dto.setCategory(v.getCategory());
        dto.setSubCategory(v.getSubCategory());
        dto.setFuelType(v.getFuelType());
        dto.setTransmission(v.getTransmission());
        dto.setSeatingCapacity(v.getSeatingCapacity());
        dto.setPricePerHour(v.getPricePerHour());

        // Configured / Calculated tiers for 6 hours (10% discount) and 12 hours (15% discount)
        BigDecimal price6h = v.getPricePerHour().multiply(BigDecimal.valueOf(6))
                .multiply(BigDecimal.valueOf(0.90)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal price12h = v.getPricePerHour().multiply(BigDecimal.valueOf(12))
                .multiply(BigDecimal.valueOf(0.85)).setScale(2, RoundingMode.HALF_UP);

        dto.setPriceFor6Hours(price6h);
        dto.setPriceFor12Hours(price12h);
        dto.setPricePerDay(v.getPricePerDay());
        dto.setSecurityDeposit(v.getSecurityDeposit());
        dto.setLocation(v.getLocation());
        dto.setImageUrl(v.getImageUrl());
        dto.setVehicleStatus(v.getVehicleStatus());
        dto.setDescription(v.getDescription());
        dto.setFeatures(v.getFeatures());
        dto.setCreatedAt(v.getCreatedAt());

        return dto;
    }

    public List<VehicleDto> getAllVehicles(boolean isAdmin) {
        return vehicleRepository.findAll().stream()
                .map(v -> mapToDto(v, isAdmin))
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getAvailableVehicles(boolean isAdmin) {
        return vehicleRepository.findByVehicleStatus("AVAILABLE").stream()
                .map(v -> mapToDto(v, isAdmin))
                .collect(Collectors.toList());
    }

    private boolean matchesCategory(Vehicle v, String cat) {
        if (cat == null || cat.trim().isEmpty() || "ALL".equalsIgnoreCase(cat)) {
            return true;
        }
        String c = cat.trim().toUpperCase();
        if ("SCOOTER".equals(c) || "SCOOTERS".equals(c)) {
            return "SCOOTER".equalsIgnoreCase(v.getCategory()) || 
                   ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && "SCOOTER".equalsIgnoreCase(v.getSubCategory()));
        }
        if ("BIKE".equals(c) || "BIKES".equals(c) || "MOTORCYCLE".equals(c) || "MOTORCYCLES".equals(c)) {
            return "BIKE".equalsIgnoreCase(v.getCategory()) || "MOTORCYCLE".equalsIgnoreCase(v.getCategory()) ||
                   ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && ("MOTORCYCLE".equalsIgnoreCase(v.getSubCategory()) || "BIKE".equalsIgnoreCase(v.getSubCategory())));
        }
        if ("MOPED".equals(c) || "MOPEDS".equals(c)) {
            return "MOPED".equalsIgnoreCase(v.getCategory()) ||
                   ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && "MOPED".equalsIgnoreCase(v.getSubCategory()));
        }
        if ("CAR".equals(c) || "CARS".equals(c)) {
            return "CAR".equalsIgnoreCase(v.getCategory());
        }
        if ("TWO_WHEELER".equals(c) || "TWO_WHEELERS".equals(c) || "TWO-WHEELER".equals(c)) {
            return !"CAR".equalsIgnoreCase(v.getCategory());
        }
        return c.equalsIgnoreCase(v.getCategory());
    }

    public List<VehicleDto> getVehiclesByCategory(String category, boolean isAdmin) {
        return vehicleRepository.findAll().stream()
                .filter(v -> matchesCategory(v, category))
                .map(v -> mapToDto(v, isAdmin))
                .collect(Collectors.toList());
    }

    public List<VehicleDto> filterVehicles(String category, String subCategory, String fuelType,
                                          String transmission, BigDecimal maxPrice, String status,
                                          String sortBy, boolean isAdmin) {
        List<Vehicle> list = vehicleRepository.findAll().stream()
                .filter(v -> matchesCategory(v, category))
                .filter(v -> subCategory == null || subCategory.trim().isEmpty() || "ALL".equalsIgnoreCase(subCategory) || v.getSubCategory().equalsIgnoreCase(subCategory.trim()))
                .filter(v -> fuelType == null || fuelType.trim().isEmpty() || "ALL".equalsIgnoreCase(fuelType) || v.getFuelType().equalsIgnoreCase(fuelType.trim()))
                .filter(v -> transmission == null || transmission.trim().isEmpty() || "ALL".equalsIgnoreCase(transmission) || v.getTransmission().equalsIgnoreCase(transmission.trim()))
                .filter(v -> maxPrice == null || v.getPricePerHour().compareTo(maxPrice) <= 0)
                .filter(v -> status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status) || v.getVehicleStatus().equalsIgnoreCase(status.trim()))
                .collect(Collectors.toList());

        if ("price_asc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Vehicle::getPricePerHour));
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Vehicle::getPricePerHour).reversed());
        }

        return list.stream().map(v -> mapToDto(v, isAdmin)).collect(Collectors.toList());
    }

    public List<VehicleDto> searchAvailableVehicles(String category, LocalDateTime pickup, LocalDateTime returnTime,
                                                   String location, boolean isAdmin) {
        if (pickup == null || returnTime == null) {
            throw new BadRequestException("Pickup and return dates are required for search");
        }
        if (!returnTime.isAfter(pickup)) {
            throw new BadRequestException("Return datetime must be after pickup datetime");
        }

        List<Vehicle> availableVehicles = vehicleRepository.findAvailableVehiclesForDates(pickup, returnTime);

        return availableVehicles.stream()
                .filter(v -> matchesCategory(v, category))
                .filter(v -> location == null || location.trim().isEmpty() ||
                             v.getLocation().toLowerCase().contains(location.toLowerCase().trim()))
                .map(v -> mapToDto(v, isAdmin))
                .collect(Collectors.toList());
    }

    public Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    public VehicleDto getVehicleById(Long id, boolean isAdmin) {
        Vehicle v = getVehicleEntity(id);
        return mapToDto(v, isAdmin);
    }

    public boolean isVehicleAvailableForDates(Long vehicleId, LocalDateTime pickup, LocalDateTime returnTime, Long excludeBookingId) {
        Vehicle v = getVehicleEntity(vehicleId);
        if (!"AVAILABLE".equalsIgnoreCase(v.getVehicleStatus())) {
            return false;
        }
        long conflicts = bookingRepository.countOverlappingBookings(vehicleId, pickup, returnTime, excludeBookingId);
        return conflicts == 0;
    }

    @Transactional
    public VehicleDto createVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        Vehicle v = new Vehicle();
        copyProperties(request, v);
        Vehicle saved = vehicleRepository.save(v);
        return mapToDto(saved, true);
    }

    @Transactional
    public VehicleDto updateVehicle(Long id, VehicleRequest request) {
        Vehicle v = getVehicleEntity(id);

        if (!v.getRegistrationNumber().equalsIgnoreCase(request.getRegistrationNumber()) &&
                vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        copyProperties(request, v);
        Vehicle updated = vehicleRepository.save(v);
        return mapToDto(updated, true);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle v = getVehicleEntity(id);
        // Soft delete / set to INACTIVE if bookings exist, or delete
        v.setVehicleStatus("INACTIVE");
        vehicleRepository.save(v);
    }

    @Transactional
    public VehicleDto updateVehicleStatus(Long id, String status) {
        Vehicle v = getVehicleEntity(id);
        v.setVehicleStatus(status.toUpperCase());
        return mapToDto(vehicleRepository.save(v), true);
    }

    private void copyProperties(VehicleRequest req, Vehicle v) {
        v.setBrand(req.getBrand().trim());
        v.setModel(req.getModel().trim());
        v.setRegistrationNumber(req.getRegistrationNumber().trim().toUpperCase());
        v.setCategory(req.getCategory().trim().toUpperCase());
        v.setSubCategory(req.getSubCategory().trim().toUpperCase());
        v.setFuelType(req.getFuelType().trim());
        v.setTransmission(req.getTransmission().trim());
        v.setSeatingCapacity(req.getSeatingCapacity());
        v.setPricePerHour(req.getPricePerHour());
        v.setPricePerDay(req.getPricePerDay());
        v.setSecurityDeposit(req.getSecurityDeposit());
        v.setLocation(req.getLocation().trim());
        v.setImageUrl(req.getImageUrl().trim());
        if (req.getVehicleStatus() != null) {
            v.setVehicleStatus(req.getVehicleStatus().toUpperCase());
        }
        v.setDescription(req.getDescription());
        v.setFeatures(req.getFeatures());
    }
}
