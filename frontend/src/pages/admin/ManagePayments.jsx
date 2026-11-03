import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
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

  const filtered = payments
    .filter((p) => (!filterMethod ? true : p.paymentMethod?.toLowerCase().includes(filterMethod.toLowerCase())))
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.paymentReference?.toLowerCase().includes(q) ||
        p.bookingReference?.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.transactionReference?.toLowerCase().includes(q)
      );
    });

  const totalCollected = payments
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment Transactions & Audit</h2>
          <p className="text-muted small mb-0">
            Real-time tracking of UPI, Card, Net Banking, Razorpay sandbox orders, and Pay-at-Pickup records.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchPayments}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Payments
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '14px' }}>
            <span className="text-muted small">Total Transactions</span>
            <h3 className="fw-bold text-dark my-1">{payments.length}</h3>
            <small className="text-success"><i className="bi bi-shield-check"></i> All recorded logs</small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '14px' }}>
            <span className="text-muted small">Successful Revenue</span>
            <h3 className="fw-bold text-primary my-1">{formatCurrency(totalCollected)}</h3>
            <small className="text-muted">Online & Verified</small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '14px' }}>
            <span className="text-muted small">UPI Transactions</span>
            <h3 className="fw-bold text-success my-1">
              {payments.filter((p) => p.paymentMethod?.includes('UPI')).length}
            </h3>
            <small className="text-success">GPay / PhonePe / QR</small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '14px' }}>
            <span className="text-muted small">Pay at Pickup (Due)</span>
            <h3 className="fw-bold text-warning my-1">
              {payments.filter((p) => p.paymentMethod === 'PAY_AT_PICKUP').length}
            </h3>
            <small className="text-warning">Hub Settlement</small>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '14px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search payment reference, booking, customer name, transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="">All Payment Methods</option>
              <option value="UPI">UPI (Google Pay, PhonePe, QR)</option>
              <option value="CARD">Debit & Credit Cards</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="RAZORPAY">Razorpay Checkout</option>
              <option value="PAY_AT_PICKUP">Pay at Pickup</option>
            </select>
          </div>
          <div className="col-md-2 text-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch('');
                setFilterMethod('');
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Fetching payment records..." />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '14px' }}>
          <i className="bi bi-credit-card text-muted fs-1 mb-2"></i>
          <h5 className="fw-bold text-dark">No Payment Transactions Recorded</h5>
          <p className="text-muted small mb-0">Payments will automatically appear here once customers book rides.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '14px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Payment Ref</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="small">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="fw-bold text-dark">{p.paymentReference}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{p.bookingReference}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{p.customerName}</div>
                      <small className="text-muted">{p.customerEmail}</small>
                    </td>
                    <td>{p.vehicleName}</td>
                    <td className="fw-bold text-primary">{formatCurrency(p.amount)}</td>
                    <td>
                      <span className="badge bg-secondary">
                        <i className="bi bi-wallet2 me-1"></i> {p.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <code className="text-dark small">{p.transactionReference || '-'}</code>
                    </td>
                    <td className="text-muted">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
