package com.driveease.vehiclerental.repository;

import com.driveease.vehiclerental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByBookingStatusOrderByCreatedAtDesc(String status);

    long countByBookingStatus(String bookingStatus);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.bookingStatus IN ('CONFIRMED', 'PENDING') " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId) " +
           "AND b.pickupDatetime < :returnTime AND b.expectedReturnDatetime > :pickupTime")
    long countOverlappingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("pickupTime") LocalDateTime pickupTime,
            @Param("returnTime") LocalDateTime returnTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.rentalAmount), 0) FROM Booking b WHERE b.bookingStatus IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumRentalRevenue();

    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'CONFIRMED' AND b.actualReturnDatetime IS NULL ORDER BY b.expectedReturnDatetime ASC")
    List<Booking> findPendingReturns();

    List<Booking> findTop10ByOrderByCreatedAtDesc();
}
