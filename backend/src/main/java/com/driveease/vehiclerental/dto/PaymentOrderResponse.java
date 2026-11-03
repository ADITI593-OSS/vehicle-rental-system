package com.driveease.vehiclerental.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
    private String paymentReference;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(String orderId, BigDecimal amount, String currency, String keyId, String paymentReference) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.keyId = keyId;
        this.paymentReference = paymentReference;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}
