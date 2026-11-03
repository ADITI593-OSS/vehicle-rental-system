package com.driveease.vehiclerental.repository;

import com.driveease.vehiclerental.entity.ReturnRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ReturnRecordRepository extends JpaRepository<ReturnRecord, Long> {
    Optional<ReturnRecord> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
    List<ReturnRecord> findAllByOrderByCreatedAtDesc();
}
