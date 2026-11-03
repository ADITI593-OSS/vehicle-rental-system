package com.driveease.vehiclerental.repository;

import com.driveease.vehiclerental.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumber(String registrationNumber);

    List<Vehicle> findByCategory(String category);

    List<Vehicle> findByVehicleStatus(String status);

    List<Vehicle> findByCategoryAndVehicleStatus(String category, String status);

    long countByVehicleStatus(String status);

    long countByCategory(String category);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:category IS NULL OR v.category = :category) AND " +
           "(:subCategory IS NULL OR v.subCategory = :subCategory) AND " +
           "(:fuelType IS NULL OR v.fuelType = :fuelType) AND " +
           "(:transmission IS NULL OR v.transmission = :transmission) AND " +
           "(:maxPrice IS NULL OR v.pricePerHour <= :maxPrice) AND " +
           "(:status IS NULL OR v.vehicleStatus = :status)")
    List<Vehicle> filterVehicles(
            @Param("category") String category,
            @Param("subCategory") String subCategory,
            @Param("fuelType") String fuelType,
            @Param("transmission") String transmission,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("status") String status
    );

    @Query("SELECT v FROM Vehicle v WHERE v.vehicleStatus = 'AVAILABLE' AND v.id NOT IN (" +
           "SELECT b.vehicle.id FROM Booking b WHERE b.bookingStatus IN ('CONFIRMED', 'PENDING') " +
           "AND b.pickupDatetime < :returnTime AND b.expectedReturnDatetime > :pickupTime)")
    List<Vehicle> findAvailableVehiclesForDates(
            @Param("pickupTime") LocalDateTime pickupTime,
            @Param("returnTime") LocalDateTime returnTime
    );
}
