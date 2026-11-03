package com.driveease.vehiclerental.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PaymentOrderRequest {

    private Long bookingId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String paymentMethod = "UPI";

    public PaymentOrderRequest() {
    }

    public PaymentOrderRequest(Long bookingId, BigDecimal amount, String paymentMethod) {
        this.bookingId = bookingId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
