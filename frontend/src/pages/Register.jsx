import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidGmail(cleanEmail)) {
      setErrorMsg('Access Restricted: Only valid Gmail accounts (@gmail.com) are permitted to register.');
      return;
    }

    if (isDemoEmail(cleanEmail)) {
      setErrorMsg('Demo and test accounts are not allowed. Please enter your authentic personal Gmail address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: cleanEmail,
        mobileNumber: mobileNumber.trim(),
        password,
        confirmPassword,
      });
      navigate('/login', {
        state: {
          successMsg: 'Account created successfully! Please sign in with your Gmail and password to access your account.',
          email: cleanEmail,
        },
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.errors?.mobileNumber ||
        'Registration failed. Please review your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '20px' }}>
          <div className="text-center mb-4">
            <div
              className="bg-navy text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: '64px', height: '64px', backgroundColor: 'var(--navy-dark)' }}
            >
              <i className="bi bi-person-plus-fill text-warning fs-3"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Create an Account</h3>
            <p className="text-muted small">Join DriveEase Rentals for instant vehicle booking</p>
            <span className="badge bg-light text-primary border px-3 py-1 small">
              <i className="bi bi-google me-1"></i> Valid Gmail (@gmail.com) Required
            </span>
          </div>

          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-circle-fill fs-5"></i>
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">
                <i className="bi bi-person me-1"></i> Full Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aditi Roy"
                value={fullName}
                required
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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
                  <i className="bi bi-exclamation-triangle me-1"></i> Only accounts ending with <strong>@gmail.com</strong> are allowed.
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">
                <i className="bi bi-phone me-1"></i> Mobile Number (10 digits)
              </label>
              <input
                type="tel"
                className="form-control"
                placeholder="9820098200"
                pattern="[6-9][0-9]{9}"
                title="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                value={mobileNumber}
                required
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <div className="row g-2 mb-4">
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-lock me-1"></i> Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-shield-check me-1"></i> Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent w-100 btn-lg fs-6 fw-bold mb-3 shadow"
              disabled={loading || (email && !isValidGmail(email))}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"></i> Register & Continue
                </>
              )}
            </button>
          </form>

          <div className="text-center small text-muted">
            Already have an account?{' '}
            <Link to="/login" className="fw-bold text-primary text-decoration-none">
              Sign in with Gmail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
