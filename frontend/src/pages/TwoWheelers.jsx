import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TwoWheelers = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [subCategory, setSubCategory] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [subCategory, fuelType, maxPrice, sortBy]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', {
        params: {
          category: 'TWO_WHEELER',
          subCategory: subCategory || undefined,
          fuelType: fuelType || undefined,
          maxPrice: maxPrice || undefined,
          sortBy: sortBy || undefined,
        },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load two-wheelers:', err);
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
    setSubCategory('');
    setFuelType('');
    setMaxPrice('');
    setSortBy('');
    setAvailableOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Page Header Banner */}
        <div className="card bg-navy text-white p-4 p-md-5 border-0 shadow mb-5" style={{ backgroundColor: 'var(--navy-dark)', borderRadius: '20px' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                <i className="bi bi-bicycle me-1"></i> Two-Wheeler Rentals
              </span>
              <h1 className="fw-bold text-white mb-2">Ride Free, Beat the Traffic</h1>
              <p className="text-secondary mb-0">
                Explore our fleet of fuel-efficient scooters and powerful touring motorcycles.
                Starting from just ₹70/hour with complimentary sanitization and helmets.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="bg-dark p-3 rounded-4 border border-secondary d-inline-block text-start">
                <div className="text-secondary small">Starting Price</div>
                <div className="fs-3 fw-bold text-warning">₹70<span className="fs-6 text-white fw-normal">/hour</span></div>
                <small className="text-success"><i className="bi bi-shield-check"></i> Zero Hidden Costs</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
          <div className="row g-3 align-items-center">
            {/* Instant Search */}
            <div className="col-lg-3 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search brand, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sub-Category: Scooter vs Motorcycle */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <select
                className="form-select bg-light"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="SCOOTER">Scooter (Activa, Jupiter)</option>
                <option value="MOTORCYCLE">Motorcycle (Classic, Pulsar)</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <select
                className="form-select bg-light"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Sort by Price */}
            <div className="col-lg-2 col-md-4 col-sm-6">
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

            {/* Available Only Switch */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="form-check form-switch pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availCheck"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-secondary" htmlFor="availCheck">
                  Available Only
                </label>
              </div>
            </div>

            {/* Reset Button */}
            <div className="col-lg-1 col-md-4 col-sm-6 text-end">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters} title="Reset filters">
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <LoadingSpinner message="Loading two-wheelers..." />
        ) : filteredList.length === 0 ? (
          <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <i className="bi bi-bicycle text-muted fs-1 mb-2"></i>
            <h5 className="fw-bold text-dark">No Two-Wheelers Found</h5>
            <p className="text-muted mb-3">No bikes or scooters match the applied filters.</p>
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

export default TwoWheelers;
