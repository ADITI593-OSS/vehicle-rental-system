import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageRentals = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: { status: statusFilter === 'ALL' ? undefined : statusFilter },
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
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

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.vehicleName.toLowerCase().includes(q) ||
      b.customerMobile.includes(q)
    );
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Rental Bookings Log</h2>
          <p className="text-muted small mb-0">
            Audit customer reservations, monitor active vehicle rentals, and view complete pricing details.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '14px' }}>
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search reference, customer name, vehicle, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-navy' : 'btn-outline-navy'}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'CONFIRMED' ? 'btn-navy' : 'btn-outline-navy'}`}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                Active
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-navy' : 'btn-outline-navy'}`}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'CANCELLED' ? 'btn-navy' : 'btn-outline-navy'}`}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                Cancelled
              </button>
            </div>
          </div>
          <div className="col-md-3 text-md-end text-muted small">
            Showing <strong>{filteredBookings.length}</strong> bookings
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      {loading ? (
        <LoadingSpinner message="Loading customer rentals..." />
      ) : (
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-4">Reference</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Pickup</th>
                  <th>Expected Return</th>
                  <th>Duration</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Details</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No rental bookings found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="ps-4 fw-bold text-primary">{b.bookingReference}</td>
                      <td>
                        <div className="fw-semibold text-dark">{b.customerName}</div>
                        <small className="text-muted">{b.customerMobile}</small>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{b.vehicleName}</div>
                        <small className="text-muted">{b.vehicleRegistration}</small>
                      </td>
                      <td>{formatDate(b.pickupDatetime)}</td>
                      <td>{formatDate(b.expectedReturnDatetime)}</td>
                      <td>{b.rentalDurationHours} hrs</td>
                      <td className="fw-bold text-dark">{formatCurrency(b.totalAmount)}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-primary'
                              : b.bookingStatus === 'COMPLETED'
                              ? 'bg-success'
                              : b.bookingStatus === 'CANCELLED'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <i className="bi bi-eye me-1"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-navy text-white p-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
                <h5 className="modal-title fw-bold text-white">
                  Rental Record: {selectedBooking.bookingReference}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-6 p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-2">Customer Profile</h6>
                    <div><strong>Name:</strong> {selectedBooking.customerName}</div>
                    <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
                    <div><strong>Mobile:</strong> {selectedBooking.customerMobile}</div>
                  </div>
                  <div className="col-md-6 p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-2">Assigned Vehicle</h6>
                    <div><strong>Vehicle:</strong> {selectedBooking.vehicleName}</div>
                    <div><strong>Registration:</strong> {selectedBooking.vehicleRegistration}</div>
                    <div><strong>Category:</strong> {selectedBooking.vehicleCategory}</div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6 p-3 bg-light rounded border">
                    <small className="text-muted d-block">Pickup Schedule</small>
                    <strong>{formatDate(selectedBooking.pickupDatetime)}</strong>
                    <div className="text-muted small">{selectedBooking.pickupLocation}</div>
                  </div>
                  <div className="col-md-6 p-3 bg-light rounded border">
                    <small className="text-muted d-block">Expected Return Schedule</small>
                    <strong>{formatDate(selectedBooking.expectedReturnDatetime)}</strong>
                    <div className="text-muted small">{selectedBooking.dropLocation}</div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">Financial Breakdown</h6>
                <div className="table-responsive border rounded mb-3">
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td>Base Rental ({selectedBooking.rentalDurationHours} hrs):</td>
                        <td className="text-end fw-bold">{formatCurrency(selectedBooking.rentalAmount)}</td>
                      </tr>
                      <tr>
                        <td>Taxes (5% GST):</td>
                        <td className="text-end fw-bold">{formatCurrency(selectedBooking.taxAmount)}</td>
                      </tr>
                      <tr>
                        <td>Security Deposit:</td>
                        <td className="text-end fw-bold text-success">{formatCurrency(selectedBooking.securityDeposit)}</td>
                      </tr>
                      {selectedBooking.lateFee > 0 && (
                        <tr className="text-danger">
                          <td>Late Fee Charged:</td>
                          <td className="text-end fw-bold">{formatCurrency(selectedBooking.lateFee)}</td>
                        </tr>
                      )}
                      {selectedBooking.additionalCharges > 0 && (
                        <tr className="text-danger">
                          <td>Additional Charges / Damage:</td>
                          <td className="text-end fw-bold">{formatCurrency(selectedBooking.additionalCharges)}</td>
                        </tr>
                      )}
                      <tr className="table-light fw-bold">
                        <td>Total Amount:</td>
                        <td className="text-end text-primary fs-6">{formatCurrency(selectedBooking.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {selectedBooking.notes && (
                  <div className="p-2 bg-light rounded border small text-muted">
                    <strong>Customer Notes:</strong> {selectedBooking.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer p-3">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRentals;
