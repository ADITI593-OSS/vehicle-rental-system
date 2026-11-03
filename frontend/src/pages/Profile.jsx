import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/users/profile', { fullName, mobileNumber });
      updateProfile({ fullName: res.data.fullName, mobileNumber: res.data.mobileNumber });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card border-0 shadow-sm p-4 p-md-5 bg-white" style={{ borderRadius: '20px' }}>
          <div className="text-center mb-4">
            <div
              className="bg-navy text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: '64px', height: '64px', backgroundColor: 'var(--navy-dark)' }}
            >
              <i className="bi bi-person-circle fs-2 text-warning"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">My Profile</h3>
            <p className="text-muted small">Manage your account information and contact numbers</p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type} py-2 px-3 small d-flex align-items-center gap-2 mb-4`}>
              <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill`}></i>
              <div>{message.text}</div>
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control bg-light text-muted"
                value={user?.email || ''}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Account Role</label>
              <input
                type="text"
                className="form-control bg-light text-muted"
                value={user?.role === 'ROLE_ADMIN' ? 'System Administrator' : 'Customer'}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                required
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                value={mobileNumber}
                pattern="[6-9][0-9]{9}"
                required
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-navy w-100 fw-bold py-2 shadow"
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
