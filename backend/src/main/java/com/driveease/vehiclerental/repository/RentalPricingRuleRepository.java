package com.driveease.vehiclerental.repository;

import com.driveease.vehiclerental.entity.RentalPricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalPricingRuleRepository extends JpaRepository<RentalPricingRule, Long> {
    List<RentalPricingRule> findByVehicleIdAndActiveTrue(Long vehicleId);
    List<RentalPricingRule> findByActiveTrue();
}
