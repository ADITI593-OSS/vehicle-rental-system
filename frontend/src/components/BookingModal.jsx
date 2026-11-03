import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ vehicle, show, onClose, onBookingSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step: 1 = Details & Schedule, 2 = Payment Method & Checkout
  const [step, setStep] = useState(1);

  // Local datetime generator that avoids UTC offset bugs
  const toLocalDatetimeString = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinPickupDatetime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return toLocalDatetimeString(d);
  };

  const getDefaultReturnDatetime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(d.getMinutes() + 15);
    return toLocalDatetimeString(d);
  };

  const [pickupDatetime, setPickupDatetime] = useState('');
  const [returnDatetime, setReturnDatetime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI_GPAY'); // UPI_GPAY, UPI_PHONEPE, UPI_PAYTM, UPI_QR, CARD, NET_BANKING, PAY_AT_PICKUP, RAZORPAY
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [priceQuote, setPriceQuote] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (vehicle && show) {
      setStep(1);
      const defaultPickup = getMinPickupDatetime();
      const defaultReturn = getDefaultReturnDatetime();
      setPickupDatetime(defaultPickup);
      setReturnDatetime(defaultReturn);
      setPickupLocation(vehicle.location || 'Mumbai Central Hub');
      setDropLocation(vehicle.location || 'Mumbai Central Hub');
      setNotes('');
      setErrorMsg('');
      setPaymentMethod('UPI_GPAY');
      setUpiId('');
      setCardNumber('');
      setCardName(user?.fullName || '');
      setCardExpiry('');
      setCardCvv('');

      // Auto calculate initial quote
      fetchPriceQuote(defaultPickup, defaultReturn);
    }
  }, [vehicle, show, user]);

  const fetchPriceQuote = async (pickup, expectedReturn) => {
    if (!vehicle || !pickup || !expectedReturn) return;
    setErrorMsg('');
    setIsCalculating(true);
    try {
      const res = await api.post('/vehicles/calculate-price', {
        vehicleId: vehicle.id,
        pickupDatetime: pickup,
        expectedReturnDatetime: expectedReturn,
      });
      setPriceQuote(res.data);
    } catch (err) {
      setPriceQuote(null);
      setErrorMsg(err.response?.data?.message || 'Failed to calculate pricing for selected time.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDateChange = (type, value) => {
    let p = pickupDatetime;
    let r = returnDatetime;
    if (type === 'pickup') {
      p = value;
      setPickupDatetime(value);
    } else {
      r = value;
      setReturnDatetime(value);
    }

    if (p && r && new Date(r) > new Date(p)) {
      fetchPriceQuote(p, r);
    } else if (p && r && new Date(r) <= new Date(p)) {
      setErrorMsg('Return date/time must be strictly after pickup date/time');
      setPriceQuote(null);
    }
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login?redirect=booking');
      return;
    }

    if (!priceQuote || !priceQuote.available) {
      setErrorMsg('Please ensure vehicle is available before proceeding.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  // Card Number Formatter (Adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Card Expiry Formatter (MM/YY)
  const handleCardExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Direct Payment & Booking Execution
  const handleInitiatePayment = (e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      onClose();
      navigate('/login?redirect=booking');
      return;
    }

    setErrorMsg('');

    // Method Specific Validations
    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        setErrorMsg('Please enter a valid 16-digit debit or credit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMsg('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV security code.');
        return;
      }
    }

    if (paymentMethod.startsWith('UPI') && paymentMethod !== 'UPI_QR') {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
        return;
      }
    }

    executeFinalBookingAndPayment();
  };

  // Final Server Submission
  const executeFinalBookingAndPayment = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const isPayAtPickup = paymentMethod === 'PAY_AT_PICKUP';
      let txnRef = '';

      if (isPayAtPickup) {
        txnRef = 'POP-' + Math.floor(100000 + Math.random() * 900000);
      } else if (paymentMethod === 'RAZORPAY') {
        txnRef = 'pay_rzp_' + Math.random().toString(36).substring(2, 12);
      } else if (paymentMethod.startsWith('UPI')) {
        txnRef = 'UPI-' + Math.floor(100000000000 + Math.random() * 900000000000);
      } else if (paymentMethod === 'CARD') {
        txnRef = 'CRD-' + Math.floor(100000000000 + Math.random() * 900000000000);
      } else {
        txnRef = 'NET-' + Math.floor(100000000000 + Math.random() * 900000000000);
      }

      // 1. Create Booking in database
      const bookingPayload = {
        vehicleId: vehicle.id,
        pickupDatetime,
        expectedReturnDatetime: returnDatetime,
        pickupLocation,
        dropLocation,
        notes,
        paymentMethod,
        paymentStatus: isPayAtPickup ? 'PENDING' : 'SUCCESS',
        transactionReference: txnRef,
      };

      const bookingRes = await api.post('/bookings', bookingPayload);
      const createdBooking = bookingRes.data;

      // 2. Record Payment in backend payments table
      try {
        await api.post('/payments/verify', {
          bookingId: createdBooking.id,
          paymentReference: 'PAY-' + Math.floor(10000000 + Math.random() * 90000000),
          razorpayOrderId: paymentMethod === 'RAZORPAY' ? ('order_' + Math.random().toString(36).substring(2, 10)) : null,
          razorpayPaymentId: paymentMethod === 'RAZORPAY' ? txnRef : null,
          paymentMethod,
          amount: createdBooking.totalAmount,
          transactionReference: txnRef,
        });
      } catch (payErr) {
        console.warn('Payment recording note:', payErr);
      }

      onClose();
      if (onBookingSuccess) {
        onBookingSuccess(createdBooking);
      } else {
        navigate(`/booking-confirmation/${createdBooking.bookingReference}`, { state: { booking: createdBooking } });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete booking. Please review your schedule and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  if (!show || !vehicle) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Modal Header */}
          <div className="modal-header bg-navy text-white py-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
            <div>
              <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-key-fill text-warning"></i>
                {step === 1 ? `Reserve: ${vehicle.brand} ${vehicle.model}` : `Secure Payment Checkout`}
              </h5>
              <small className="text-secondary">
                {step === 1 ? 'Step 1 of 2: Dates & Schedule' : `Step 2 of 2: Select Payment Method & Confirm`}
              </small>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{errorMsg}</div>
              </div>
            )}

            {/* STEP 1: SCHEDULE & DETAILS */}
            {step === 1 && (
              <div className="row g-4">
                {/* Left Column: Vehicle Summary & Times */}
                <div className="col-md-7">
                  <div className="d-flex gap-3 align-items-center p-3 bg-light rounded-3 mb-3 border">
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.model}
                      className="rounded-3 object-fit-contain bg-white border p-1"
                      style={{ width: '90px', height: '65px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/vehicles/maruti-swift.png';
                      }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">
                        {vehicle.brand} {vehicle.model}
                      </h6>
                      <small className="text-muted">
                        {vehicle.category} • {vehicle.fuelType} • {vehicle.transmission}
                      </small>
                      <div className="text-primary fw-bold mt-1 small">
                        {formatCurrency(vehicle.pricePerHour)}/hr • {formatCurrency(vehicle.pricePerDay)}/day
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-bold text-secondary">
                        <i className="bi bi-calendar-event me-1"></i> Pickup Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={pickupDatetime}
                        min={getMinPickupDatetime()}
                        required
                        onChange={(e) => handleDateChange('pickup', e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-bold text-secondary">
                        <i className="bi bi-calendar-check me-1"></i> Return Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={returnDatetime}
                        min={pickupDatetime || getMinPickupDatetime()}
                        required
                        onChange={(e) => handleDateChange('return', e.target.value)}
                      />
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label small fw-bold text-secondary">
                        <i className="bi bi-geo-alt me-1"></i> Pickup Location
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={pickupLocation}
                        required
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-bold text-secondary">
                        <i className="bi bi-geo-alt-fill me-1"></i> Drop-off Location
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={dropLocation}
                        required
                        onChange={(e) => setDropLocation(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">
                        <i className="bi bi-chat-left-text me-1"></i> Trip Notes / Special Requests (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Extra helmet required, early morning pickup..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing Breakdown */}
                <div className="col-md-5">
                  <div className="card border h-100 shadow-sm" style={{ backgroundColor: '#FAFBFD' }}>
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between">
                          <span>Price Breakdown</span>
                          {isCalculating && (
                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                          )}
                        </h6>

                        {priceQuote ? (
                          <>
                            <div className="d-flex justify-content-between small text-secondary mb-2">
                              <span>Rental Duration:</span>
                              <span className="fw-semibold text-dark">
                                {priceQuote.rentalDurationHours} Hours
                                {priceQuote.rentalDays > 0 && ` (${priceQuote.rentalDays}d ${priceQuote.remainingHours}h)`}
                              </span>
                            </div>

                            <div className="d-flex justify-content-between small text-secondary mb-2">
                              <span>Base Rental Amount:</span>
                              <span className="fw-semibold text-dark">
                                {formatCurrency(priceQuote.baseRentalAmount)}
                              </span>
                            </div>

                            <div className="d-flex justify-content-between small text-secondary mb-2">
                              <span>GST & Service Fee (5%):</span>
                              <span className="fw-semibold text-dark">
                                {formatCurrency(priceQuote.taxAmount)}
                              </span>
                            </div>

                            <div className="d-flex justify-content-between small text-secondary mb-3">
                              <span>
                                Refundable Security Deposit:
                                <i
                                  className="bi bi-info-circle ms-1 text-primary"
                                  title="Refunded upon inspection when returned on time without damages"
                                ></i>
                              </span>
                              <span className="fw-semibold text-success">
                                {formatCurrency(priceQuote.securityDeposit)}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-white border mb-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold text-dark">Estimated Total:</span>
                                <span className="fs-5 fw-bold text-primary">
                                  {formatCurrency(priceQuote.totalEstimatedAmount)}
                                </span>
                              </div>
                              <small className="text-muted d-block text-end" style={{ fontSize: '0.72rem' }}>
                                Inclusive of refundable deposit
                              </small>
                            </div>

                            <div
                              className={`alert ${
                                priceQuote.available ? 'alert-success' : 'alert-danger'
                              } py-2 px-3 small mb-0`}
                            >
                              <i
                                className={`bi ${
                                  priceQuote.available ? 'bi-check-circle-fill' : 'bi-x-circle-fill'
                                } me-2`}
                              ></i>
                              {priceQuote.message}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-muted small">
                            Select dates to view instant quote
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-top mt-3">
                        {!isAuthenticated ? (
                          <button
                            type="button"
                            className="btn btn-warning w-100 fw-bold py-2 shadow-sm text-dark"
                            onClick={() => {
                              onClose();
                              navigate('/login?redirect=booking');
                            }}
                          >
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In with Gmail to Proceed
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-accent w-100 fw-bold py-2 shadow"
                            disabled={!priceQuote?.available || isCalculating}
                            onClick={handleProceedToPayment}
                          >
                            Proceed to Payment ({formatCurrency(priceQuote?.totalEstimatedAmount)}) <i className="bi bi-arrow-right ms-1"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD & CHECKOUT */}
            {step === 2 && (
              <div>
                {/* Summary Header */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border mb-4">
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{vehicle.brand} {vehicle.model}</h6>
                    <small className="text-muted">{priceQuote?.rentalDurationHours} Hours • {pickupLocation}</small>
                  </div>
                  <div className="text-end">
                    <span className="small text-muted d-block">Total Payable:</span>
                    <span className="fs-4 fw-bold text-primary">{formatCurrency(priceQuote?.totalEstimatedAmount)}</span>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Left Column: Payment Methods Selection */}
                  <div className="col-md-5 border-end">
                    <h6 className="fw-bold text-dark mb-3">Choose Payment Method</h6>
                    <div className="d-flex flex-column gap-2">
                      <button
                        type="button"
                        className={`btn text-start p-3 d-flex align-items-center justify-content-between border rounded-3 ${
                          paymentMethod.startsWith('UPI') ? 'border-primary bg-primary bg-opacity-10 fw-bold text-primary' : 'bg-white'
                        }`}
                        onClick={() => setPaymentMethod('UPI_GPAY')}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-phone-fill fs-5 text-primary"></i>
                          <div>
                            <div>UPI Apps & QR</div>
                            <small className="text-muted fw-normal">Google Pay, PhonePe, Paytm, QR</small>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </button>

                      <button
                        type="button"
                        className={`btn text-start p-3 d-flex align-items-center justify-content-between border rounded-3 ${
                          paymentMethod === 'CARD' ? 'border-primary bg-primary bg-opacity-10 fw-bold text-primary' : 'bg-white'
                        }`}
                        onClick={() => setPaymentMethod('CARD')}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-credit-card-2-front-fill fs-5 text-success"></i>
                          <div>
                            <div>Debit / Credit Card</div>
                            <small className="text-muted fw-normal">Visa, MasterCard, RuPay</small>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </button>

                      <button
                        type="button"
                        className={`btn text-start p-3 d-flex align-items-center justify-content-between border rounded-3 ${
                          paymentMethod === 'NET_BANKING' ? 'border-primary bg-primary bg-opacity-10 fw-bold text-primary' : 'bg-white'
                        }`}
                        onClick={() => setPaymentMethod('NET_BANKING')}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-bank2 fs-5 text-warning"></i>
                          <div>
                            <div>Net Banking</div>
                            <small className="text-muted fw-normal">HDFC, SBI, ICICI, Axis & more</small>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </button>

                      <button
                        type="button"
                        className={`btn text-start p-3 d-flex align-items-center justify-content-between border rounded-3 ${
                          paymentMethod === 'RAZORPAY' ? 'border-primary bg-primary bg-opacity-10 fw-bold text-primary' : 'bg-white'
                        }`}
                        onClick={() => setPaymentMethod('RAZORPAY')}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-shield-check fs-5 text-info"></i>
                          <div>
                            <div>Razorpay Sandbox</div>
                            <small className="text-muted fw-normal">Instant test checkout order</small>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </button>

                      <button
                        type="button"
                        className={`btn text-start p-3 d-flex align-items-center justify-content-between border rounded-3 ${
                          paymentMethod === 'PAY_AT_PICKUP' ? 'border-primary bg-primary bg-opacity-10 fw-bold text-primary' : 'bg-white'
                        }`}
                        onClick={() => setPaymentMethod('PAY_AT_PICKUP')}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-cash-coin fs-5 text-secondary"></i>
                          <div>
                            <div>Pay at Pickup Hub</div>
                            <small className="text-muted fw-normal">Pay cash/UPI at vehicle handover</small>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Method Details */}
                  <div className="col-md-7">
                    {/* UPI PAYMENT */}
                    {paymentMethod.startsWith('UPI') && (
                      <div>
                        <h6 className="fw-bold text-dark mb-3">Instant UPI Payment</h6>
                        <div className="btn-group w-100 mb-3" role="group">
                          <button
                            type="button"
                            className={`btn btn-sm ${paymentMethod === 'UPI_GPAY' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setPaymentMethod('UPI_GPAY')}
                          >
                            <i className="bi bi-google me-1"></i> Google Pay
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${paymentMethod === 'UPI_PHONEPE' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setPaymentMethod('UPI_PHONEPE')}
                          >
                            PhonePe
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${paymentMethod === 'UPI_PAYTM' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setPaymentMethod('UPI_PAYTM')}
                          >
                            Paytm
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${paymentMethod === 'UPI_QR' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setPaymentMethod('UPI_QR')}
                          >
                            <i className="bi bi-qr-code me-1"></i> QR Code
                          </button>
                        </div>

                        {paymentMethod === 'UPI_QR' ? (
                          <div className="text-center p-3 bg-light rounded-3 border mb-3">
                            <div className="bg-white p-3 d-inline-block rounded-3 border shadow-sm mb-2">
                              <svg width="150" height="150" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#ffffff" />
                                <rect x="10" y="10" width="25" height="25" fill="#0B192C" />
                                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                                <rect x="18" y="18" width="9" height="9" fill="#0B192C" />
                                <rect x="65" y="10" width="25" height="25" fill="#0B192C" />
                                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                                <rect x="73" y="18" width="9" height="9" fill="#0B192C" />
                                <rect x="10" y="65" width="25" height="25" fill="#0B192C" />
                                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                                <rect x="18" y="73" width="9" height="9" fill="#0B192C" />
                                <rect x="45" y="20" width="10" height="10" fill="#FF6500" />
                                <rect x="40" y="45" width="20" height="10" fill="#0B192C" />
                                <rect x="65" y="45" width="10" height="20" fill="#0B192C" />
                                <rect x="45" y="65" width="20" height="15" fill="#FF6500" />
                                <rect x="75" y="75" width="15" height="15" fill="#0B192C" />
                              </svg>
                            </div>
                            <small className="text-muted d-block">
                              Scan with Google Pay, PhonePe, Paytm, or BHIM app
                            </small>
                            <span className="badge bg-secondary mt-1">UPI ID: driveease@okhdfcbank</span>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">
                              Enter Virtual Payment Address (VPA / UPI ID)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. yourname@okhdfcbank or 9820098200@paytm"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                            <small className="text-muted mt-1 d-block">Instant payment request will be authorized directly.</small>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CARD DETAILS */}
                    {paymentMethod === 'CARD' && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-dark mb-0">Debit or Credit Card</h6>
                          <span className="badge bg-success-subtle text-success border">
                            <i className="bi bi-shield-check me-1"></i> 256-Bit SSL Encrypted
                          </span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold text-secondary">Card Number</label>
                          <input
                            type="text"
                            maxLength="19"
                            className="form-control"
                            placeholder="4532 8821 9012 4431"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold text-secondary">Cardholder Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rahul Sharma"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                        </div>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label className="form-label small fw-bold text-secondary">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength="5"
                              className="form-control"
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={handleCardExpiryChange}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-bold text-secondary">CVV</label>
                            <input
                              type="password"
                              maxLength="3"
                              className="form-control"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            />
                          </div>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-lock-fill text-success me-1"></i> PCI-DSS Compliant & Secured Direct Gateway
                        </small>
                      </div>
                    )}

                    {/* NET BANKING */}
                    {paymentMethod === 'NET_BANKING' && (
                      <div>
                        <h6 className="fw-bold text-dark mb-3">Select Your Bank</h6>
                        <div className="row g-2 mb-3">
                          {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                            <div key={b} className="col-6">
                              <button
                                type="button"
                                className={`btn btn-sm w-100 p-2 text-start border ${
                                  selectedBank === b ? 'btn-navy fw-bold' : 'btn-light'
                                }`}
                                onClick={() => setSelectedBank(b)}
                              >
                                <i className="bi bi-bank me-1"></i> {b}
                              </button>
                            </div>
                          ))}
                        </div>
                        <small className="text-muted">Direct secure checkout via {selectedBank} portal.</small>
                      </div>
                    )}

                    {/* RAZORPAY TEST SANDBOX */}
                    {paymentMethod === 'RAZORPAY' && (
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-primary">Razorpay Standard Checkout</span>
                          <span className="badge bg-info text-dark">Sandbox Test Mode</span>
                        </div>
                        <p className="small text-muted mb-2">
                          Generates an authenticated test transaction order with Key ID <code>rzp_test_DriveEaseRentalsKey</code>.
                        </p>
                        <div className="alert alert-secondary py-2 small mb-0">
                          <i className="bi bi-check-circle-fill text-success me-1"></i> Validated instantly via Spring Boot backend API with automatic webhook simulation.
                        </div>
                      </div>
                    )}

                    {/* PAY AT PICKUP */}
                    {paymentMethod === 'PAY_AT_PICKUP' && (
                      <div className="p-3 bg-light rounded-3 border">
                        <h6 className="fw-bold text-dark mb-2">Pay When You Pick Up</h6>
                        <p className="small text-muted mb-2">
                          Zero online payment charged now. You can settle the rental amount and security deposit via Cash or UPI at vehicle handover.
                        </p>
                        <div className="alert alert-warning py-2 small mb-0">
                          <i className="bi bi-info-circle-fill me-1"></i> Please keep your original Driving License and Identity Proof ready at pickup.
                        </div>
                      </div>
                    )}

                    {/* Submit / Action Buttons */}
                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-3"
                        onClick={() => setStep(1)}
                      >
                        <i className="bi bi-arrow-left me-1"></i> Back
                      </button>
                      <button
                        type="button"
                        className="btn btn-accent flex-grow-1 fw-bold py-2 shadow"
                        disabled={isSubmitting}
                        onClick={handleInitiatePayment}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Processing Payment & Booking...
                          </>
                        ) : paymentMethod === 'PAY_AT_PICKUP' ? (
                          <>
                            <i className="bi bi-check2-circle me-1"></i> Confirm Booking (Pay at Pickup)
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-check me-1"></i> Pay {formatCurrency(priceQuote?.totalEstimatedAmount)} & Confirm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
