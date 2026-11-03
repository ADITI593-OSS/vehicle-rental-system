package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final Duration OTP_VALIDITY = Duration.ofMinutes(5);
    private static final String GMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@gmail\\.com$";

    private final SecureRandom secureRandom = new SecureRandom();

    public static class OtpEntry {
        private final String code;
        private final Instant expiryTime;
        private final String purpose;
        private boolean verified;

        public OtpEntry(String code, Instant expiryTime, String purpose) {
            this.code = code;
            this.expiryTime = expiryTime;
            this.purpose = purpose;
            this.verified = false;
        }

        public String getCode() {
            return code;
        }

        public Instant getExpiryTime() {
            return expiryTime;
        }

        public String getPurpose() {
            return purpose;
        }

        public boolean isVerified() {
            return verified;
        }

        public void setVerified(boolean verified) {
            this.verified = verified;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiryTime);
        }
    }

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public String generateAndSendOtp(String rawEmail, String purpose) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            throw new BadRequestException("Email is required for OTP generation");
        }

        String email = rawEmail.toLowerCase().trim();

        if (!email.matches(GMAIL_REGEX)) {
            throw new BadRequestException("Invalid email domain. Only valid Gmail addresses (@gmail.com) are allowed.");
        }

        // Generate 6-digit numeric OTP (100000 - 999999)
        int num = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(num);

        OtpEntry entry = new OtpEntry(otp, Instant.now().plus(OTP_VALIDITY), purpose != null ? purpose.toUpperCase() : "LOGIN");
        otpStore.put(email, entry);

        logger.info("=================================================");
        logger.info("🔐 DRIVE-EASE OTP SERVICE DISPATCH");
        logger.info("Target Gmail : {}", email);
        logger.info("OTP Code     : {}", otp);
        logger.info("Purpose      : {}", entry.getPurpose());
        logger.info("Valid Until  : {}", entry.getExpiryTime());
        logger.info("=================================================");

        return otp;
    }

    public boolean verifyOtp(String rawEmail, String otp) {
        if (rawEmail == null || otp == null) {
            return false;
        }

        String email = rawEmail.toLowerCase().trim();
        OtpEntry entry = otpStore.get(email);

        if (entry == null) {
            return false;
        }

        if (entry.isExpired()) {
            otpStore.remove(email);
            return false;
        }

        if (entry.getCode().equals(otp.trim())) {
            entry.setVerified(true);
            return true;
        }

        return false;
    }

    public boolean isEmailVerifiedForRegistration(String rawEmail) {
        if (rawEmail == null) return false;
        String email = rawEmail.toLowerCase().trim();
        OtpEntry entry = otpStore.get(email);
        return entry != null && entry.isVerified() && !entry.isExpired();
    }

    public void clearOtp(String rawEmail) {
        if (rawEmail != null) {
            otpStore.remove(rawEmail.toLowerCase().trim());
        }
    }
}
