import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Bikes = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBikes();
  }, [maxPrice, sortBy]);

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', {
        params: {
          category: 'BIKE',
          maxPrice: maxPrice || undefined,
          sortBy: sortBy || undefined,
        },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load bikes:', err);
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

  const resetFilters = () => {
    setMaxPrice('');
    setSortBy('');
    setAvailableOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Page Header Banner */}
        <div
          className="card text-white p-4 p-md-5 border-0 shadow mb-5"
          style={{
            background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
            borderRadius: '20px',
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                <i className="bi bi-bicycle me-1"></i> Motorcycle & Bike Rentals
              </span>
              <h1 className="fw-bold text-white mb-2">Feel the Throttle, Conquer the Open Road</h1>
              <p className="text-light mb-0" style={{ opacity: 0.9 }}>
                Rent iconic cruisers and high-mileage commuters including <strong>Royal Enfield Classic 350 & Hunter 350</strong>, <strong>Bajaj Pulsar NS200 & 150</strong>, <strong>TVS Apache RTR 160</strong>, <strong>Yamaha FZ-S</strong>, <strong>Honda Shine 125 & SP 125</strong>, and <strong>Hero Splendor Plus & Xtreme 125R</strong>.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
              <div className="bg-dark bg-opacity-50 p-3 rounded-4 border border-secondary d-inline-block text-start">
                <div className="text-secondary small">Starting Rate</div>
                <div className="fs-2 fw-bold text-warning">₹60<span className="fs-6 text-white fw-normal">/hour</span></div>
                <small className="text-success fw-semibold"><i className="bi bi-shield-check"></i> 100% Serviced & Certified Fleet</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search bike brand (Royal Enfield, Pulsar, Shine...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sort by Price */}
            <div className="col-lg-3 col-md-3 col-sm-6">
              <select
                className="form-select bg-light"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort by Price</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Available Only */}
            <div className="col-lg-3 col-md-3 col-sm-6">
              <div className="form-check form-switch pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availBikesCheck"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-secondary" htmlFor="availBikesCheck">
                  Available Only
                </label>
              </div>
            </div>

            {/* Reset Button */}
            <div className="col-lg-1 col-md-12 text-end">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters} title="Reset filters">
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <LoadingSpinner message="Loading genuine motorcycle fleet..." />
        ) : filteredList.length === 0 ? (
          <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <i className="bi bi-bicycle text-muted fs-1 mb-2"></i>
            <h5 className="fw-bold text-dark">No Motorcycles Found</h5>
            <p className="text-muted mb-3">No bikes match your applied search or filters.</p>
            <button className="btn btn-navy mx-auto px-4" onClick={resetFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredList.map((vehicle) => (
              <div key={vehicle.id} className="col-lg-4 col-md-6">
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

export default Bikes;
