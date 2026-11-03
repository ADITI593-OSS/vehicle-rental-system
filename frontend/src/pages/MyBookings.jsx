import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${cancelModalBooking.id}/cancel`);
      setActionMsg({
        text: `Booking ${cancelModalBooking.bookingReference} has been cancelled successfully.`,
        type: 'success',
      });
      setCancelModalBooking(null);
      fetchMyBookings();
    } catch (err) {
      setActionMsg({
        text: err.response?.data?.message || 'Failed to cancel booking.',
        type: 'danger',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Metrics
  const totalCount = bookings.length;
  const activeCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.bookingStatus === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge bg-primary px-3 py-2 rounded-pill">Confirmed / Active</span>;
      case 'COMPLETED':
        return <span className="badge bg-success px-3 py-2 rounded-pill">Completed</span>;
      case 'CANCELLED':
        return <span className="badge bg-danger px-3 py-2 rounded-pill">Cancelled</span>;
      case 'PENDING':
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Pending</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Welcome Banner */}
        <div className="card bg-navy text-white p-4 p-md-5 border-0 shadow mb-5" style={{ backgroundColor: 'var(--navy-dark)', borderRadius: '20px' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                Customer Dashboard
              </span>
              <h2 className="fw-bold text-white mb-2">
                Welcome back, {user?.fullName || 'Valued Customer'}!
              </h2>
              <p className="text-secondary mb-0">
                Track your active rentals, access rental vouchers, view completed trips, and manage bookings.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/cars" className="btn btn-accent px-4 py-2 fw-semibold me-2 mb-2">
                <i className="bi bi-plus-circle me-1"></i> Rent a Car
              </Link>
              <Link to="/two-wheelers" className="btn btn-outline-light px-4 py-2 fw-semibold mb-2">
                <i className="bi bi-bicycle me-1"></i> Rent a Bike
              </Link>
            </div>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMsg.text && (
          <div
            className={`alert alert-${actionMsg.type} alert-dismissible fade show d-flex align-items-center mb-4`}
            role="alert"
          >
            <i className={`bi bi-${actionMsg.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill fs-5 me-2`}></i>
            <div>{actionMsg.text}</div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setActionMsg({ text: '', type: '' })}
            ></button>
          </div>
        )}

        {/* Counter Cards */}
        <div className="row g-3 mb-5">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="text-muted small fw-bold text-uppercase">Total Bookings</div>
              <div className="fs-3 fw-bold text-dark mt-1">{totalCount}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="text-muted small fw-bold text-uppercase">Active / Upcoming</div>
              <div className="fs-3 fw-bold text-primary mt-1">{activeCount}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="text-muted small fw-bold text-uppercase">Completed</div>
              <div className="fs-3 fw-bold text-success mt-1">{completedCount}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="text-muted small fw-bold text-uppercase">Cancelled</div>
              <div className="fs-3 fw-bold text-danger mt-1">{cancelledCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark mb-0">My Rental Bookings</h4>
          <div className="btn-group shadow-sm" role="group">
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-navy' : 'btn-outline-navy'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'CONFIRMED' ? 'btn-navy' : 'btn-outline-navy'}`}
              onClick={() => setStatusFilter('CONFIRMED')}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-navy' : 'btn-outline-navy'}`}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'CANCELLED' ? 'btn-navy' : 'btn-outline-navy'}`}
              onClick={() => setStatusFilter('CANCELLED')}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : filteredBookings.length === 0 ? (
          <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <i className="bi bi-calendar-x text-muted fs-1 mb-2"></i>
            <h5 className="fw-bold text-dark">No Bookings Found</h5>
            <p className="text-muted mb-3">You don't have any bookings matching this status filter.</p>
            <Link to="/cars" className="btn btn-navy mx-auto px-4">
              Explore Available Vehicles
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBookings.map((b) => (
              <div key={b.id} className="col-12">
                <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <div className="row align-items-center g-3">
                      {/* Vehicle Thumbnail */}
                      <div className="col-md-2 col-sm-3 text-center text-sm-start">
                        <img
                          src={b.vehicleImageUrl}
                          alt={b.vehicleName}
                          className="rounded-3 object-fit-contain bg-light border p-1 shadow-sm w-100"
                          style={{ maxHeight: '100px', height: '80px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/vehicles/maruti-swift.png';
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="col-md-4 col-sm-9">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-light text-dark border fw-semibold">
                            {b.bookingReference}
                          </span>
                          {getStatusBadge(b.bookingStatus)}
                        </div>
                        <h5 className="fw-bold text-dark mb-1">{b.vehicleName}</h5>
                        <div className="text-muted small">
                          <i className="bi bi-geo-alt text-danger me-1"></i> {b.pickupLocation}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span className="badge bg-light text-primary border">
                            {b.rentalDurationHours} Hours
                          </span>
                          <span className={`badge ${b.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            <i className="bi bi-wallet2 me-1"></i> {b.paymentMethod?.replace('_', ' ') || 'UPI'}
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="col-md-3 col-sm-6 small border-start-md">
                        <div className="mb-2">
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>PICKUP</span>
                          <strong className="text-dark">{formatDate(b.pickupDatetime)}</strong>
                        </div>
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>EXPECTED RETURN</span>
                          <strong className="text-dark">{formatDate(b.expectedReturnDatetime)}</strong>
                        </div>
                      </div>

                      {/* Total & Actions */}
                      <div className="col-md-3 col-sm-6 text-sm-end border-start-md">
                        <div className="text-muted small">Total Estimated</div>
                        <div className="fs-4 fw-bold text-primary mb-2">
                          {formatCurrency(b.totalAmount)}
                        </div>
                        <div className="d-flex gap-2 justify-content-sm-end">
                          <button
                            className="btn btn-outline-navy btn-sm"
                            onClick={() => setSelectedBooking(b)}
                          >
                            <i className="bi bi-file-earmark-text me-1"></i> View
                          </button>
                          {b.eligibleForCancellation && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setCancelModalBooking(b)}
                            >
                              <i className="bi bi-x-circle me-1"></i> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-navy text-white p-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
                <h5 className="modal-title fw-bold text-white">
                  Booking Voucher: {selectedBooking.bookingReference}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedBooking(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{selectedBooking.vehicleName}</h5>
                    <small className="text-muted">Reg: {selectedBooking.vehicleRegistration}</small>
                  </div>
                  {getStatusBadge(selectedBooking.bookingStatus)}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6 p-3 bg-light rounded border">
                    <small className="text-muted d-block">Pickup Time & Hub</small>
                    <strong className="text-dark">{formatDate(selectedBooking.pickupDatetime)}</strong>
                    <div className="text-muted small">{selectedBooking.pickupLocation}</div>
                  </div>
                  <div className="col-6 p-3 bg-light rounded border">
                    <small className="text-muted d-block">Expected Return</small>
                    <strong className="text-dark">{formatDate(selectedBooking.expectedReturnDatetime)}</strong>
                    <div className="text-muted small">{selectedBooking.dropLocation}</div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">Cost Breakdown:</h6>
                <ul className="list-group list-group-flush border rounded mb-3 small">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Base Rental ({selectedBooking.rentalDurationHours} hrs):</span>
                    <span className="fw-bold">{formatCurrency(selectedBooking.rentalAmount)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Taxes & GST (5%):</span>
                    <span className="fw-bold">{formatCurrency(selectedBooking.taxAmount)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Security Deposit (Refundable):</span>
                    <span className="fw-bold text-success">{formatCurrency(selectedBooking.securityDeposit)}</span>
                  </li>
                  {selectedBooking.lateFee > 0 && (
                    <li className="list-group-item d-flex justify-content-between text-danger">
                      <span>Late Return Fee:</span>
                      <span className="fw-bold">{formatCurrency(selectedBooking.lateFee)}</span>
                    </li>
                  )}
                  {selectedBooking.additionalCharges > 0 && (
                    <li className="list-group-item d-flex justify-content-between text-danger">
                      <span>Additional Charges:</span>
                      <span className="fw-bold">{formatCurrency(selectedBooking.additionalCharges)}</span>
                    </li>
                  )}
                  <li className="list-group-item d-flex justify-content-between bg-light fw-bold fs-6 text-primary">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                  </li>
                </ul>

                {selectedBooking.notes && (
                  <div className="p-2 bg-light rounded border small text-muted">
                    <strong>Notes:</strong> {selectedBooking.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer p-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  Cancel Rental Booking
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCancelModalBooking(null)}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-dark mb-2">
                  Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> for <strong>{cancelModalBooking.vehicleName}</strong>?
                </p>
                <small className="text-muted d-block">
                  Per our cancellation policy, 100% of your advance and security deposit is freed immediately.
                </small>
              </div>
              <div className="modal-footer p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCancelModalBooking(null)}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
