import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.successMsg || '');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '';

  const isValidGmail = (val) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val.trim());
  };

  const isDemoEmail = (val) => {
    const lower = val.toLowerCase().trim();
    return (
      lower.includes('demo') ||
      lower.includes('test') ||
      lower.includes('fake') ||
      lower.includes('dummy') ||
      lower.includes('temp')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidGmail(cleanEmail)) {
      setErrorMsg('Access Restricted: Only valid Gmail accounts (@gmail.com) are permitted to sign in.');
      return;
    }

    if (isDemoEmail(cleanEmail)) {
      setErrorMsg('Demo and test accounts are not permitted. Please sign in with your authentic personal Gmail address.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(cleanEmail, password);
      const fromPath = location.state?.from?.pathname;
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (fromPath) {
        navigate(fromPath);
      } else if (redirectPath === 'booking') {
        navigate(-1);
      } else {
        navigate('/my-bookings');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '20px' }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="bg-navy text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: '64px', height: '64px', backgroundColor: 'var(--navy-dark)' }}
            >
              <i className="bi bi-shield-lock-fill text-warning fs-3"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Sign In</h3>
            <p className="text-muted small">Access your DriveEase Rentals account</p>
            <span className="badge bg-light text-primary border px-3 py-1 small">
              <i className="bi bi-google me-1"></i> Valid Gmail (@gmail.com) Required
            </span>
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-check-circle-fill fs-5 text-success"></i>
              <div>{successMsg}</div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
              <i className="bi bi-exclamation-circle-fill fs-5"></i>
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">
                <i className="bi bi-envelope me-1"></i> Gmail Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-google text-danger"></i>
                </span>
                <input
                  type="email"
                  className={`form-control border-start-0 ${
                    email && !isValidGmail(email) ? 'is-invalid' : ''
                  }`}
                  placeholder="yourname@gmail.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {email && !isValidGmail(email) && (
                <small className="text-danger mt-1 d-block" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-exclamation-triangle me-1"></i> Email must end with <strong>@gmail.com</strong>
                </small>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">
                <i className="bi bi-lock me-1"></i> Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg fs-6"
                placeholder="Enter password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-accent w-100 btn-lg fs-6 fw-bold mb-4 shadow"
              disabled={loading || (email && !isValidGmail(email))}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-center small text-muted pt-2 border-top">
            Don't have an account yet?{' '}
            <Link to="/register" className="fw-bold text-primary text-decoration-none">
              Register with Gmail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
