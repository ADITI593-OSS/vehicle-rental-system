import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Cars = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [subCategory, setSubCategory] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCars();
  }, [subCategory, fuelType, transmission, sortBy]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', {
        params: {
          category: 'CAR',
          subCategory: subCategory || undefined,
          fuelType: fuelType || undefined,
          transmission: transmission || undefined,
          sortBy: sortBy || undefined,
        },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = vehicles
    .filter((v) => (!availableOnly ? true : v.vehicleStatus === 'AVAILABLE'))
    .filter((v) => (!seatingCapacity ? true : v.seatingCapacity === parseInt(seatingCapacity, 10)))
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
    setTransmission('');
    setSortBy('');
    setSeatingCapacity('');
    setAvailableOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Banner */}
        <div className="card bg-navy text-white p-4 p-md-5 border-0 shadow mb-5" style={{ backgroundColor: 'var(--navy-dark)', borderRadius: '20px' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                <i className="bi bi-car-front me-1"></i> Self-Drive Car Rentals
              </span>
              <h1 className="fw-bold text-white mb-2">Drive Comfortably, Arrive in Style</h1>
              <p className="text-secondary mb-0">
                Choose from nimble city hatchbacks, comfortable sedans, powerful SUVs, and spacious 7-seater MUVs.
                All cars equipped with AC, fastag, air bags, and Bluetooth infotainment.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="bg-dark p-3 rounded-4 border border-secondary d-inline-block text-start">
                <div className="text-secondary small">Starting Rate</div>
                <div className="fs-3 fw-bold text-warning">₹110<span className="fs-6 text-white fw-normal">/hour</span></div>
                <small className="text-success"><i className="bi bi-shield-check"></i> Comprehensive Insurance Included</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-lg-3 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search Swift, Creta, Innova..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <select
                className="form-select bg-light"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All Body Types</option>
                <option value="HATCHBACK">Hatchback (Swift, i20)</option>
                <option value="SUV">SUV (Nexon, Creta)</option>
                <option value="MUV">MUV (Ertiga, Innova)</option>
                <option value="SEDAN">Sedan</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <select
                className="form-select bg-light"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="">Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Fuel */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <select
                className="form-select bg-light"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="">Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Seats */}
            <div className="col-lg-1 col-md-4 col-sm-6">
              <select
                className="form-select bg-light px-2"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
              >
                <option value="">Seats</option>
                <option value="5">5 Seats</option>
                <option value="7">7 Seats</option>
              </select>
            </div>

            {/* Sort */}
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
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="availCheckCar"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-secondary" htmlFor="availCheckCar">
                Show Available Cars Only
              </label>
            </div>

            <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <LoadingSpinner message="Loading cars fleet..." />
        ) : filteredList.length === 0 ? (
          <div className="card text-center py-5 border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <i className="bi bi-car-front text-muted fs-1 mb-2"></i>
            <h5 className="fw-bold text-dark">No Cars Match Your Criteria</h5>
            <p className="text-muted mb-3">Try adjusting your filters or price sort.</p>
            <button className="btn btn-navy mx-auto px-4" onClick={resetFilters}>
              Reset Filters
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

export default Cars;
