import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const res = await api.get('/admin/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
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

  if (loading) return <LoadingSpinner message="Loading Admin Intelligence Dashboard..." />;

  if (!summary) {
    return <div className="alert alert-danger">Failed to load admin summary analytics.</div>;
  }

  // Monthly Bookings Bar Chart Config
  const monthlyLabels = summary.monthlyBookings ? Object.keys(summary.monthlyBookings) : [];
  const monthlyData = summary.monthlyBookings ? Object.values(summary.monthlyBookings) : [];

  const barChartData = {
    labels: monthlyLabels.length > 0 ? monthlyLabels : ['Current Month'],
    datasets: [
      {
        label: 'Bookings Count',
        data: monthlyData.length > 0 ? monthlyData : [summary.totalBookings || 0],
        backgroundColor: '#FF6500',
        borderRadius: 8,
      },
    ],
  };

  // Category Distribution Doughnut Config (Scooters, Bikes, Mopeds, Cars)
  const categoryLabels = summary.categoryDistribution ? Object.keys(summary.categoryDistribution) : ['Scooters', 'Bikes', 'Mopeds', 'Cars'];
  const categoryValues = summary.categoryDistribution ? Object.values(summary.categoryDistribution) : [8, 10, 2, 13];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: ['#10B981', '#0066FF', '#F59E0B', '#0B192C'],
        borderWidth: 2,
      },
    ],
  };

  // Booking Status Pie Config
  const statusLabels = summary.bookingStatusDistribution ? Object.keys(summary.bookingStatusDistribution) : [];
  const statusValues = summary.bookingStatusDistribution ? Object.values(summary.bookingStatusDistribution) : [];

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: ['#0066FF', '#10B981', '#EF4444', '#F59E0B'],
      },
    ],
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Administrative Dashboard</h2>
          <p className="text-muted small mb-0">
            Real-time fleet occupancy, rental revenue metrics, and booking throughput from MySQL.
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/admin/vehicles" className="btn btn-navy btn-sm">
            <i className="bi bi-plus-circle me-1"></i> Add Vehicle
          </Link>
          <Link to="/admin/returns" className="btn btn-accent btn-sm">
            <i className="bi bi-box-arrow-in-down-left me-1"></i> Process Returns ({summary.pendingReturns})
          </Link>
        </div>
      </div>

      {/* KPI Cards (8 Summary Counters) */}
      <div className="row g-3 mb-4">
        {/* Total Vehicles */}
        <div className="col-xl-3 col-md-6">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-bold text-uppercase">Total Fleet</div>
              <div className="fs-3 fw-bold text-dark mt-1">{summary.totalVehicles}</div>
              <small className="text-success fw-semibold">
                <i className="bi bi-check2"></i> {summary.availableVehicles} Available
              </small>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-car-front-fill"></i>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col-xl-3 col-md-6">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-bold text-uppercase">Registered Users</div>
              <div className="fs-3 fw-bold text-dark mt-1">{summary.totalCustomers}</div>
              <small className="text-muted">Verified accounts</small>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="col-xl-3 col-md-6">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-bold text-uppercase">Active Bookings</div>
              <div className="fs-3 fw-bold text-primary mt-1">{summary.activeRentals}</div>
              <small className="text-muted">On the road or confirmed</small>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-calendar2-check-fill"></i>
            </div>
          </div>
        </div>

        {/* Rental Revenue */}
        <div className="col-xl-3 col-md-6">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-bold text-uppercase">Rental Revenue</div>
              <div className="fs-3 fw-bold text-success mt-1">
                {formatCurrency(summary.rentalRevenue)}
              </div>
              <small className="text-muted">
                Gross: {formatCurrency(summary.totalRevenue)}
              </small>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-currency-rupee"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Monthly Bookings Chart */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-1">Monthly Booking Velocity</h5>
            <small className="text-muted mb-4 d-block">Number of reservations created per calendar month</small>
            <div style={{ maxHeight: '270px' }}>
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Category Share & Status Distribution */}
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-1">Fleet Category Share</h5>
            <small className="text-muted mb-3 d-block">Two-Wheelers vs Cars</small>
            <div style={{ maxHeight: '220px' }}>
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-1">Booking Statuses</h5>
            <small className="text-muted mb-3 d-block">Lifecycle distribution</small>
            <div style={{ maxHeight: '220px' }}>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Recent Rental Activity</h5>
            <small className="text-muted">Latest bookings placed by customers</small>
          </div>
          <Link to="/admin/rentals" className="btn btn-outline-navy btn-sm">
            View All Bookings
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th className="ps-4">Reference</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Pickup Date</th>
                <th>Duration</th>
                <th>Total (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="small">
              {summary.recentBookings && summary.recentBookings.length > 0 ? (
                summary.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4 fw-bold text-primary">{b.bookingReference}</td>
                    <td>
                      <div className="fw-semibold text-dark">{b.customerName}</div>
                      <small className="text-muted">{b.customerMobile}</small>
                    </td>
                    <td>{b.vehicleName}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {b.vehicleCategory}
                      </span>
                    </td>
                    <td>{new Date(b.pickupDatetime).toLocaleDateString('en-IN')}</td>
                    <td>{b.rentalDurationHours} hrs</td>
                    <td className="fw-bold text-dark">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge px-2 py-1 ${
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No recent booking records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
