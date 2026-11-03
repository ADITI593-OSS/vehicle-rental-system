import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="admin-sidebar p-0 flex-shrink-0">
        <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between">
          <Link to="/" className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center gap-2">
            <i className="bi bi-speedometer2 text-warning fs-4"></i>
            <span>Drive<span className="text-warning">Ease</span> Admin</span>
          </Link>
        </div>

        <div className="py-3 flex-grow-1">
          <small className="text-uppercase text-secondary px-4 fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>
            Main Navigation
          </small>
          <NavLink to="/admin" end className="admin-nav-item">
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard Overview</span>
          </NavLink>
          <NavLink to="/admin/vehicles" className="admin-nav-item">
            <i className="bi bi-truck-front-fill"></i>
            <span>Manage Vehicles</span>
          </NavLink>
          <NavLink to="/admin/customers" className="admin-nav-item">
            <i className="bi bi-people-fill"></i>
            <span>Manage Customers</span>
          </NavLink>
          <NavLink to="/admin/rentals" className="admin-nav-item">
            <i className="bi bi-calendar2-range-fill"></i>
            <span>Manage Rentals</span>
          </NavLink>
          <NavLink to="/admin/returns" className="admin-nav-item">
            <i className="bi bi-box-arrow-in-down-left"></i>
            <span>Return Management</span>
          </NavLink>
          <NavLink to="/admin/payments" className="admin-nav-item">
            <i className="bi bi-credit-card-2-back-fill"></i>
            <span>Payment Audit</span>
          </NavLink>
        </div>

        <div className="p-3 border-top border-secondary">
          <div className="d-flex align-items-center gap-3 p-2 bg-dark rounded-3 mb-2">
            <div
              className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '38px', height: '38px' }}
            >
              A
            </div>
            <div className="text-truncate">
              <div className="fw-semibold text-white small">{user?.fullName || 'Administrator'}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Master Staff</div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-outline-light btn-sm flex-grow-1">
              <i className="bi bi-arrow-left me-1"></i> Public Site
            </Link>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout} title="Logout">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto p-4 p-lg-5">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
