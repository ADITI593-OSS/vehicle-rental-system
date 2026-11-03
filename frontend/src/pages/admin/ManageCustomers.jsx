import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', {
        params: { search: searchQuery || undefined },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    try {
      const res = await api.patch(`/admin/customers/${id}/toggle-status`);
      setAlertMsg({
        text: `Customer ${name} account status is now ${res.data.accountStatus}`,
        type: 'info',
      });
      fetchCustomers(search);
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to update customer status.',
        type: 'danger',
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Customer Accounts Management</h2>
          <p className="text-muted small mb-0">
            View registered customers, monitor booking counts, and toggle account activation status.
          </p>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '14px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search customer by full name or email address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-navy w-100 btn-sm py-2">
                Search
              </button>
            </div>
            <div className="col-md-4 text-md-end text-muted small">
              Total Customers: <strong>{customers.length}</strong>
            </div>
          </div>
        </form>
      </div>

      {/* Customers Table */}
      {loading ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : (
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-4">Customer Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Joined Date</th>
                  <th>Total Bookings</th>
                  <th>Account Status</th>
                  <th className="text-end pe-4">Access Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No customer accounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '36px', height: '36px' }}
                          >
                            {c.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{c.fullName}</div>
                            <small className="text-muted">ID: #{c.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{c.email}</td>
                      <td className="fw-semibold text-dark">{c.mobileNumber}</td>
                      <td className="text-muted">{formatDate(c.createdAt)}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-1">
                          {c.totalBookings} rentals
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            c.accountStatus === 'ACTIVE' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {c.accountStatus}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm ${
                            c.accountStatus === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleToggleStatus(c.id, c.accountStatus, c.fullName)}
                        >
                          {c.accountStatus === 'ACTIVE' ? (
                            <>
                              <i className="bi bi-slash-circle me-1"></i> Suspend
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-1"></i> Activate
                            </>
                          )}
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
    </div>
  );
};

export default ManageCustomers;
