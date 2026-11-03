import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Mopeds = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMopeds();
  }, []);

  const fetchMopeds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/category/MOPED');
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load mopeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = vehicles
    .filter((v) => (!availableOnly ? true : v.vehicleStatus === 'AVAILABLE'))
    .filter((v) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    });

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Page Header Banner */}
        <div
          className="card text-white p-4 p-md-5 border-0 shadow mb-5"
          style={{
            background: 'linear-gradient(135deg, #112D4E 0%, #3F72AF 100%)',
            borderRadius: '20px',
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                <i className="bi bi-box-seam me-1"></i> Dedicated Moped Rentals
              </span>
              <h1 className="fw-bold text-white mb-2">Rugged, Dependable Multi-Utility Mopeds</h1>
              <p className="text-light mb-0" style={{ opacity: 0.95 }}>
                India's authentic heavy-duty utility mopeds. Perfect for local market errands, delivery runs, small business logistics, and ultra-affordable day trips. Rent genuine <strong>TVS XL100 Heavy Duty</strong> and <strong>TVS XL100 Comfort i-Touchstart</strong>.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
              <div className="bg-dark bg-opacity-50 p-3 rounded-4 border border-info d-inline-block text-start">
                <div className="text-light small">Most Affordable Ride</div>
                <div className="fs-2 fw-bold text-warning">₹45<span className="fs-6 text-white fw-normal">/hour</span></div>
                <small className="text-light fw-semibold"><i className="bi bi-fuel-pump"></i> 80+ kmpl Super Economy</small>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights for Mopeds */}
        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="fs-3 text-primary mb-2"><i className="bi bi-box-seam-fill"></i></div>
              <h6 className="fw-bold text-dark mb-1">Heavy-Duty Payload</h6>
              <small className="text-muted">Reinforced chassis and detachable pillion rack for luggage and parcel transport.</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="fs-3 text-success mb-2"><i className="bi bi-lightning-charge-fill"></i></div>
              <h6 className="fw-bold text-dark mb-1">i-Touchstart Technology</h6>
              <small className="text-muted">Silent integrated starter generator with USB mobile charger on the go.</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3 text-center bg-white" style={{ borderRadius: '14px' }}>
              <div className="fs-3 text-warning mb-2"><i className="bi bi-wallet2"></i></div>
              <h6 className="fw-bold text-dark mb-1">Low Cost, High Mileage</h6>
              <small className="text-muted">Rent from just ₹45/hr or ₹350/full day with minimum security deposit of ₹800.</small>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search moped model or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-check form-switch pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availMopedsCheck"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-secondary" htmlFor="availMopedsCheck">
                  Available Only
                </label>
              </div>
            </div>

            <div className="col-md-2 text-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setAvailableOnly(false);
                  setSearchQuery('');
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <LoadingSpinner message="Loading genuine moped fleet..." />
        ) : filteredList.length === 0 ? (
          <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <i className="bi bi-bicycle text-muted fs-1 mb-2"></i>
            <h5 className="fw-bold text-dark">No Mopeds Available</h5>
            <p className="text-muted mb-3">All mopeds are currently reserved or out on rent.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredList.map((vehicle) => (
              <div key={vehicle.id} className="col-lg-6 col-md-6">
                <VehicleCard
                  vehicle={vehicle}
                  onBook={(v) => {
                    setSelectedVehicle(v);
                    setShowBookingModal(true);
                  }}
                  onViewDetails={(v) => {
                    setSelectedVehicle(v);
                    setShowDetailsModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingModal
        vehicle={selectedVehicle}
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={(booking) => {
          navigate(`/booking-confirmation/${booking.bookingReference}`, { state: { booking } });
        }}
      />

      <VehicleDetailsModal
        vehicle={selectedVehicle}
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onBookNow={(vehicle) => {
          setSelectedVehicle(vehicle);
          setShowBookingModal(true);
        }}
      />
    </div>
  );
};

export default Mopeds;
