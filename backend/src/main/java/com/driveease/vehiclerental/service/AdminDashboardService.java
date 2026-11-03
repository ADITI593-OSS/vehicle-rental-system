package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.DashboardSummaryDto;
import com.driveease.vehiclerental.entity.Booking;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.repository.BookingRepository;
import com.driveease.vehiclerental.repository.UserRepository;
import com.driveease.vehiclerental.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        // 1. Vehicle counts
        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByVehicleStatus("AVAILABLE");
        long rentedVehicles = vehicleRepository.countByVehicleStatus("RENTED");
        long maintenanceVehicles = vehicleRepository.countByVehicleStatus("MAINTENANCE");

        summary.setTotalVehicles(totalVehicles);
        summary.setAvailableVehicles(availableVehicles);
        summary.setRentedVehicles(rentedVehicles);
        summary.setMaintenanceVehicles(maintenanceVehicles);

        // 2. Customer counts
        long totalCustomers = userRepository.countByRole("ROLE_CUSTOMER");
        summary.setTotalCustomers(totalCustomers);

        // 3. Booking counts
        long totalBookings = bookingRepository.count();
        long activeRentals = bookingRepository.countByBookingStatus("CONFIRMED");
        long pendingReturns = bookingRepository.findPendingReturns().size();

        summary.setTotalBookings(totalBookings);
        summary.setActiveRentals(activeRentals);
        summary.setPendingReturns(pendingReturns);

        // 4. Revenue
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
        BigDecimal rentalRevenue = bookingRepository.sumRentalRevenue();
        summary.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        summary.setRentalRevenue(rentalRevenue != null ? rentalRevenue : BigDecimal.ZERO);

        // 5. Category Distribution Breakdown
        List<Vehicle> allVehiclesList = vehicleRepository.findAll();
        long scooterCount = allVehiclesList.stream().filter(v -> "SCOOTER".equalsIgnoreCase(v.getCategory()) || ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && "SCOOTER".equalsIgnoreCase(v.getSubCategory()))).count();
        long bikeCount = allVehiclesList.stream().filter(v -> "BIKE".equalsIgnoreCase(v.getCategory()) || "MOTORCYCLE".equalsIgnoreCase(v.getCategory()) || ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && "MOTORCYCLE".equalsIgnoreCase(v.getSubCategory()))).count();
        long mopedCount = allVehiclesList.stream().filter(v -> "MOPED".equalsIgnoreCase(v.getCategory()) || ("TWO_WHEELER".equalsIgnoreCase(v.getCategory()) && "MOPED".equalsIgnoreCase(v.getSubCategory()))).count();
        long carCount = allVehiclesList.stream().filter(v -> "CAR".equalsIgnoreCase(v.getCategory())).count();

        Map<String, Long> categoryMap = new LinkedHashMap<>();
        categoryMap.put("Scooters", scooterCount);
        categoryMap.put("Bikes", bikeCount);
        categoryMap.put("Mopeds", mopedCount);
        categoryMap.put("Cars", carCount);
        summary.setCategoryDistribution(categoryMap);

        // 6. Booking Status Distribution
        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("CONFIRMED", bookingRepository.countByBookingStatus("CONFIRMED"));
        statusMap.put("COMPLETED", bookingRepository.countByBookingStatus("COMPLETED"));
        statusMap.put("CANCELLED", bookingRepository.countByBookingStatus("CANCELLED"));
        statusMap.put("PENDING", bookingRepository.countByBookingStatus("PENDING"));
        summary.setBookingStatusDistribution(statusMap);

        // 7. Monthly Bookings & Monthly Revenue (Group recent bookings by month-year)
        List<Booking> allBookings = bookingRepository.findAll();
        DateTimeFormatter monthYearFormat = DateTimeFormatter.ofPattern("MMM yyyy");

        Map<String, Long> monthlyBookings = new LinkedHashMap<>();
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();

        // Group by month
        for (Booking b : allBookings) {
            String month = b.getCreatedAt() != null ? b.getCreatedAt().format(monthYearFormat) : "Current";
            monthlyBookings.put(month, monthlyBookings.getOrDefault(month, 0L) + 1);

            if ("CONFIRMED".equalsIgnoreCase(b.getBookingStatus()) || "COMPLETED".equalsIgnoreCase(b.getBookingStatus())) {
                BigDecimal currentRev = monthlyRevenue.getOrDefault(month, BigDecimal.ZERO);
                monthlyRevenue.put(month, currentRev.add(b.getRentalAmount()));
            }
        }
        summary.setMonthlyBookings(monthlyBookings);
        summary.setMonthlyRevenue(monthlyRevenue);

        // 8. Recent 10 bookings
        summary.setRecentBookings(bookingRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList()));

        return summary;
    }
}
