package com.driveease.vehiclerental.dto;

public class OtpResponse {

    private boolean success;
    private String message;
    private String otp; // Provided for testing & demonstration convenience
    private String email;

    public OtpResponse() {
    }

    public OtpResponse(boolean success, String message, String otp, String email) {
        this.success = success;
        this.message = message;
        this.otp = otp;
        this.email = email;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
