import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageReturns = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [pendingReturns, setPendingReturns] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Processing Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [actualReturnDatetime, setActualReturnDatetime] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState('GOOD');
  const [odometerReading, setOdometerReading] = useState(15000);
  const [damageNotes, setDamageNotes] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [depositRefundStatus, setDepositRefundStatus] = useState('FULLY_REFUNDED');
  const [returnedBy, setReturnedBy] = useState('Branch Staff');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await api.get('/admin/returns/pending');
        setPendingReturns(res.data);
      } else {
        const res = await api.get('/admin/returns');
        setReturnHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load returns data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcessModal = (b) => {
    setSelectedBooking(b);
    const now = new Date();
    setActualReturnDatetime(now.toISOString().slice(0, 16));
    setVehicleCondition('GOOD');
    setOdometerReading(15000);
    setDamageNotes('Clean return, fuel matched.');
    setAdditionalCharges('0');
    setDepositRefundStatus('FULLY_REFUNDED');
    setReturnedBy('Admin Staff');
    setErrorMsg('');
    setShowModal(true);
  };

  const calculateLatePreview = () => {
    if (!selectedBooking || !actualReturnDatetime) return { lateHours: 0, estimatedLateFee: 0 };
    const expected = new Date(selectedBooking.expectedReturnDatetime);
    const actual = new Date(actualReturnDatetime);
    const diffMinutes = Math.floor((actual - expected) / (1000 * 60));
    if (diffMinutes > 30) {
      const lateHours = Math.ceil(diffMinutes / 60);
      // Hourly rate * 1.5
      // Selected booking price per hour can be derived or default ~150
      const approxLateFee = lateHours * 150;
      return { lateHours, estimatedLateFee: approxLateFee };
    }
    return { lateHours: 0, estimatedLateFee: 0 };
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        actualReturnDatetime,
        vehicleCondition,
        odometerReading: parseInt(odometerReading, 10),
        damageNotes,
        additionalCharges: parseFloat(additionalCharges) || 0,
        depositRefundStatus,
        returnedBy,
      };

      const res = await api.post(`/admin/returns/${selectedBooking.id}`, payload);
      setAlertMsg({
        text: `Vehicle return for booking ${res.data.bookingReference} processed successfully! Status: COMPLETED. Vehicle is now available.`,
        type: 'success',
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process return. Check inputs.');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const latePreview = calculateLatePreview();
  const extraChargesTotal = (parseFloat(additionalCharges) || 0) + latePreview.estimatedLateFee;
  const depositAmt = selectedBooking ? selectedBooking.securityDeposit : 0;
  const netRefundPreview = depositAmt - extraChargesTotal;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Vehicle Return Management</h2>
          <p className="text-muted small mb-0">
            Inspect vehicle condition upon return, log odometer readings, compute late fees, and settle security deposit refunds.
          </p>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm d-inline-flex border">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'pending' ? 'active btn-navy text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="bi bi-clock-history me-1"></i> Pending Returns ({pendingReturns.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'history' ? 'active btn-navy text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="bi bi-journal-check me-1"></i> Return Settlement History
          </button>
        </li>
      </ul>

      {/* Tab 1: Pending Returns */}
      {activeTab === 'pending' && (
        <div>
          {loading ? (
            <LoadingSpinner message="Checking active rentals pending return..." />
          ) : pendingReturns.length === 0 ? (
            <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
              <i className="bi bi-check2-circle text-success fs-1 mb-2"></i>
              <h5 className="fw-bold text-dark">No Pending Returns</h5>
              <p className="text-muted mb-0">All active rentals have been processed and closed.</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Reference</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Pickup Date</th>
                      <th>Expected Return</th>
                      <th>Security Deposit</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {pendingReturns.map((b) => (
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
                        <td>
                          <span className="fw-bold text-dark">{formatDate(b.expectedReturnDatetime)}</span>
                          {new Date() > new Date(b.expectedReturnDatetime) && (
                            <span className="badge bg-danger ms-2">OVERDUE</span>
                          )}
                        </td>
                        <td className="fw-bold text-success">{formatCurrency(b.securityDeposit)}</td>
                        <td>
                          <span className="badge bg-primary px-3 py-2 rounded-pill">
                            Active Rental
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-accent btn-sm fw-semibold"
                            onClick={() => handleOpenProcessModal(b)}
                          >
                            <i className="bi bi-box-arrow-in-down-left me-1"></i> Process Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Return Settlement History */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <LoadingSpinner message="Loading return settlement history..." />
          ) : returnHistory.length === 0 ? (
            <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
              <i className="bi bi-inbox text-muted fs-1 mb-2"></i>
              <h5 className="fw-bold text-dark">No Return History Found</h5>
              <p className="text-muted mb-0">Completed vehicle returns will appear here.</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Booking Ref</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Actual Return Time</th>
                      <th>Condition</th>
                      <th>Odometer</th>
                      <th>Late Fee</th>
                      <th>Deposit Status</th>
                      <th>Inspector</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {returnHistory.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-4 fw-bold text-primary">{r.bookingReference}</td>
                        <td className="fw-semibold text-dark">{r.customerName}</td>
                        <td>{r.vehicleName}</td>
                        <td>{formatDate(r.actualReturnDatetime)}</td>
                        <td>
                          <span
                            className={`badge ${
                              r.vehicleCondition === 'EXCELLENT'
                                ? 'bg-success'
                                : r.vehicleCondition === 'GOOD'
                                ? 'bg-info'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {r.vehicleCondition}
                          </span>
                        </td>
                        <td>{r.odometerReading} km</td>
                        <td className={r.lateFee > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                          {formatCurrency(r.lateFee)}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.depositRefundStatus === 'FULLY_REFUNDED'
                                ? 'bg-success'
                                : r.depositRefundStatus === 'PARTIALLY_REFUNDED'
                                ? 'bg-warning text-dark'
                                : 'bg-danger'
                            }`}
                          >
                            {r.depositRefundStatus}
                          </span>
                        </td>
                        <td className="text-muted">{r.returnedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Return Processing Modal */}
      {showModal && selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-navy text-white p-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <i className="bi bi-box-arrow-in-down-left text-warning"></i>
                  Process Vehicle Check-in: {selectedBooking.bookingReference}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleProcessSubmit}>
                <div className="modal-body p-4">
                  {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

                  {/* Summary Banner */}
                  <div className="row g-3 p-3 bg-light rounded-3 border mb-4">
                    <div className="col-md-6">
                      <div className="text-muted small">Customer Name</div>
                      <div className="fw-bold text-dark">{selectedBooking.customerName} ({selectedBooking.customerMobile})</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Vehicle Details</div>
                      <div className="fw-bold text-dark">{selectedBooking.vehicleName} ({selectedBooking.vehicleRegistration})</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Expected Return Schedule</div>
                      <div className="fw-semibold text-secondary">{formatDate(selectedBooking.expectedReturnDatetime)}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Security Deposit Held</div>
                      <div className="fw-bold text-success">{formatCurrency(selectedBooking.securityDeposit)}</div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Actual Return Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        required
                        value={actualReturnDatetime}
                        onChange={(e) => setActualReturnDatetime(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Vehicle Condition</label>
                      <select
                        className="form-select"
                        value={vehicleCondition}
                        onChange={(e) => setVehicleCondition(e.target.value)}
                      >
                        <option value="EXCELLENT">EXCELLENT (Spotless, Full Fuel)</option>
                        <option value="GOOD">GOOD (Normal road dust)</option>
                        <option value="MINOR_SCRATCH">MINOR_SCRATCH (Small scuffs)</option>
                        <option value="DAMAGED">DAMAGED (Requires repair)</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Odometer Reading (km)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        required
                        value={odometerReading}
                        onChange={(e) => setOdometerReading(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Additional / Damage Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={additionalCharges}
                        onChange={(e) => setAdditionalCharges(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Deposit Refund Settlement</label>
                      <select
                        className="form-select"
                        value={depositRefundStatus}
                        onChange={(e) => setDepositRefundStatus(e.target.value)}
                      >
                        <option value="FULLY_REFUNDED">FULLY_REFUNDED</option>
                        <option value="PARTIALLY_REFUNDED">PARTIALLY_REFUNDED</option>
                        <option value="FORFEITED">FORFEITED (Damage)</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Inspector Notes / Damage Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Fuel tank full, no scratches observed."
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Inspecting Staff Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={returnedBy}
                        onChange={(e) => setReturnedBy(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Return Settlement Live Summary */}
                  <div className="card mt-4 border bg-white p-3 shadow-sm">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-2">Settlement Summary</h6>
                    <div className="row g-2 small">
                      <div className="col-6 text-muted">Original Rental Amount:</div>
                      <div className="col-6 text-end fw-semibold">{formatCurrency(selectedBooking.rentalAmount)}</div>

                      <div className="col-6 text-muted">Late Return Fee ({latePreview.lateHours}h late):</div>
                      <div className="col-6 text-end fw-semibold text-danger">{formatCurrency(latePreview.estimatedLateFee)}</div>

                      <div className="col-6 text-muted">Damage / Extra Charges:</div>
                      <div className="col-6 text-end fw-semibold text-danger">{formatCurrency(additionalCharges)}</div>

                      <div className="col-6 text-muted">Security Deposit:</div>
                      <div className="col-6 text-end fw-semibold text-success">{formatCurrency(depositAmt)}</div>

                      <div className="col-12"><hr className="my-1" /></div>

                      <div className="col-6 fw-bold text-dark fs-6">
                        {netRefundPreview >= 0 ? 'Net Deposit Refund to Customer:' : 'Outstanding Payable by Customer:'}
                      </div>
                      <div className={`col-6 text-end fw-bold fs-6 ${netRefundPreview >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(Math.abs(netRefundPreview))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer p-3">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                    {isSubmitting ? 'Finalizing Return...' : 'Confirm Return & Free Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReturns;
