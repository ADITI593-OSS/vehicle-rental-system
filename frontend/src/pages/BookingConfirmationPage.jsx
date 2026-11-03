import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingConfirmationPage = () => {
  const { bookingRef } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking && bookingRef) {
      fetchBookingDetails();
    }
  }, [bookingRef]);

  const fetchBookingDetails = async () => {
    try {
      // Find booking from customer's list matching reference
      const res = await api.get('/bookings/my-bookings');
      const found = res.data.find((b) => b.bookingReference === bookingRef);
      if (found) {
        setBooking(found);
      } else {
        setError('Booking not found or you are not authorized to view it.');
      }
    } catch (err) {
      setError('Failed to fetch booking details.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) return <LoadingSpinner message="Retrieving your booking confirmation..." />;

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger py-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h5>{error || 'Booking Not Found'}</h5>
          <Link to="/" className="btn btn-outline-danger mt-3">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Success Header */}
        <div className="text-center mb-4">
          <div
            className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
            style={{ width: '72px', height: '72px', fontSize: '2rem' }}
          >
            <i className="bi bi-check-lg"></i>
          </div>
          <h2 className="fw-bold text-dark mb-1">Booking Confirmed!</h2>
          <p className="text-muted">
            Thank you, {booking.customerName}! Your vehicle reservation has been successfully booked.
          </p>
          <span className="badge bg-navy px-3 py-2 fs-6 rounded-pill text-white" style={{ backgroundColor: 'var(--navy-dark)' }}>
            Reference: <span className="text-warning fw-bold">{booking.bookingReference}</span>
          </span>
        </div>

        {/* Voucher Card */}
        <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="card-header bg-navy text-white p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--navy-dark)' }}>
            <div>
              <h5 className="mb-0 fw-bold text-white">Rental Confirmation Voucher</h5>
              <small className="text-secondary">DriveEase Rentals Self-Drive Fleet</small>
            </div>
            <span className="badge bg-success px-3 py-2 rounded-pill">
              {booking.bookingStatus}
            </span>
          </div>

          <div className="card-body p-4 p-md-5">
            {/* Vehicle Card Row */}
            <div className="d-flex flex-column flex-sm-row gap-4 align-items-center p-3 bg-light rounded-3 mb-4 border">
              <img
                src={booking.vehicleImageUrl}
                alt={booking.vehicleName}
                className="rounded-3 object-fit-cover"
                style={{ width: '130px', height: '90px' }}
              />
              <div className="flex-grow-1 text-center text-sm-start">
                <h4 className="fw-bold text-dark mb-1">{booking.vehicleName}</h4>
                <div className="text-muted small">
                  Category: <span className="text-dark fw-semibold">{booking.vehicleCategory}</span> •
                  Reg: <span className="text-dark fw-semibold">{booking.vehicleRegistration}</span>
                </div>
                <div className="text-primary fw-semibold mt-1">
                  Booked for {booking.rentalDurationHours} Hours Total
                </div>
              </div>
            </div>

            {/* Schedule & Location */}
            <div className="row g-4 mb-4">
              <div className="col-md-6 border-end-md">
                <div className="p-3 bg-white border rounded-3 h-100">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-primary"></i> Rental Schedule
                  </h6>
                  <div className="mb-2 small">
                    <span className="text-muted d-block">Pickup Date & Time:</span>
                    <strong className="text-dark">{formatDate(booking.pickupDatetime)}</strong>
                  </div>
                  <div className="small">
                    <span className="text-muted d-block">Expected Return:</span>
                    <strong className="text-dark">{formatDate(booking.expectedReturnDatetime)}</strong>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-white border rounded-3 h-100">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-danger"></i> Locations
                  </h6>
                  <div className="mb-2 small">
                    <span className="text-muted d-block">Pickup Location:</span>
                    <strong className="text-dark">{booking.pickupLocation}</strong>
                  </div>
                  <div className="small">
                    <span className="text-muted d-block">Drop Location:</span>
                    <strong className="text-dark">{booking.dropLocation}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <h6 className="fw-bold text-dark mb-3">Transparent Price Breakdown</h6>
            <div className="table-responsive border rounded-3 mb-4">
              <table className="table mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Base Rental Amount ({booking.rentalDurationHours} hrs):</td>
                    <td className="text-end fw-semibold text-dark">{formatCurrency(booking.rentalAmount)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">GST & Platform Fees (5%):</td>
                    <td className="text-end fw-semibold text-dark">{formatCurrency(booking.taxAmount)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">
                      Refundable Security Deposit:
                      <small className="d-block text-secondary" style={{ fontSize: '0.72rem' }}>
                        Returned upon on-time return after condition check
                      </small>
                    </td>
                    <td className="text-end fw-semibold text-success">{formatCurrency(booking.securityDeposit)}</td>
                  </tr>
                  <tr className="table-light">
                    <td className="fw-bold text-dark fs-5">Estimated Total Amount:</td>
                    <td className="text-end fw-bold text-primary fs-5">{formatCurrency(booking.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Transaction Details Banner */}
            <div className="card bg-light border p-3 rounded-3 mb-4">
              <div className="row align-items-center g-2">
                <div className="col-sm-4 border-end-sm">
                  <span className="text-muted small d-block">Payment Method:</span>
                  <span className="fw-bold text-dark">
                    <i className="bi bi-wallet2 text-primary me-1"></i>
                    {booking.paymentMethod?.replace('_', ' ') || 'UPI'}
                  </span>
                </div>
                <div className="col-sm-4 border-end-sm">
                  <span className="text-muted small d-block">Payment Status:</span>
                  <span className={`badge ${booking.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {booking.paymentStatus === 'SUCCESS' ? 'PAID & VERIFIED' : (booking.paymentStatus || 'PENDING')}
                  </span>
                </div>
                <div className="col-sm-4">
                  <span className="text-muted small d-block">Transaction / Reference ID:</span>
                  <code className="text-dark fw-bold">{booking.transactionReference || booking.bookingReference}</code>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="alert alert-secondary py-3 px-4 small mb-4" style={{ borderRadius: '12px' }}>
              <h6 className="fw-bold text-dark mb-2">Important Rental Instructions:</h6>
              <ul className="mb-0 ps-3">
                <li>Please carry your original <strong>Driving License</strong> and <strong>Aadhaar / Passport</strong> at pickup.</li>
                <li>Fuel is checked on a same-to-same policy. Please return at equivalent fuel level.</li>
                <li>A 30-minute grace period applies to returns. Subsequent hours incur standard late fees.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i> Print Voucher
              </button>

              <div className="d-flex gap-2">
                <Link to="/my-bookings" className="btn btn-navy">
                  <i className="bi bi-journal-check me-2"></i> View My Bookings
                </Link>
                <Link to="/" className="btn btn-accent">
                  <i className="bi bi-car-front me-2"></i> Back to Fleet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
