import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search widget states
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPickup, setSearchPickup] = useState('');
  const [searchReturn, setSearchReturn] = useState('');
  const [searchLocation, setSearchLocation] = useState('Mumbai Central Hub');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [popularTab, setPopularTab] = useState('ALL');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPopularVehicles();

    // Set default search pickup and return
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const returnTime = new Date(now);
    returnTime.setDate(returnTime.getDate() + 1);

    setSearchPickup(now.toISOString().slice(0, 16));
    setSearchReturn(returnTime.toISOString().slice(0, 16));
  }, []);

  const fetchPopularVehicles = async () => {
    try {
      const res = await api.get('/vehicles/available');
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPickup || !searchReturn) return;
    if (new Date(searchReturn) <= new Date(searchPickup)) {
      alert('Return date/time must be after pickup date/time');
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.get('/vehicles/search', {
        params: {
          category: searchCategory || undefined,
          pickup: searchPickup,
          returnTime: searchReturn,
          location: searchLocation || undefined,
        },
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openBookModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
  };

  const openDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-wrapper text-center text-lg-start">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                <i className="bi bi-patch-check-fill me-1"></i> Transparent Hourly & Daily Rental Rates
              </span>
              <h1 className="hero-title mb-3">
                Your Journey, <br />
                <span className="text-warning">Your Ride.</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Rent your perfect vehicle by the hour or day. Simple booking, transparent pricing,
                and a smooth ride with clean, insured cars, bikes, and scooters across India.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start mb-2">
                <Link to="/scooters" className="btn btn-warning fw-semibold px-3 py-2 rounded-pill">
                  <i className="bi bi-scooter me-1"></i> Scooters
                </Link>
                <Link to="/bikes" className="btn btn-accent fw-semibold px-3 py-2 rounded-pill">
                  <i className="bi bi-bicycle me-1"></i> Bikes
                </Link>
                <Link to="/mopeds" className="btn btn-outline-warning fw-semibold px-3 py-2 rounded-pill">
                  <i className="bi bi-box-seam me-1"></i> Mopeds
                </Link>
                <Link to="/cars" className="btn btn-outline-light fw-semibold px-3 py-2 rounded-pill">
                  <i className="bi bi-car-front me-1"></i> Cars
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block text-center">
              <div className="p-3 bg-white bg-opacity-10 rounded-4 border border-light border-opacity-25 shadow-lg">
                <img
                  src="/images/vehicles/hyundai-creta.png"
                  alt="DriveEase Hero Fleet"
                  className="img-fluid rounded-3"
                  style={{ maxHeight: '280px', objectFit: 'contain' }}
                />
                <div className="d-flex justify-content-around mt-2 text-white small">
                  <span><i className="bi bi-shield-check text-warning"></i> 100% Verified Fleet</span>
                  <span><i className="bi bi-geo-alt text-warning"></i> 4 City Hubs</span>
                  <span><i className="bi bi-clock-history text-warning"></i> 24/7 Pickup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Booking Search Section */}
      <section className="container">
        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-grid-fill text-primary me-1"></i> Vehicle Category
                </label>
                <select
                  className="form-select"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">All Fleet (Scooters, Bikes, Mopeds, Cars)</option>
                  <option value="SCOOTER">Scooters (Activa, Jupiter, Access...)</option>
                  <option value="BIKE">Motorcycles / Bikes (Classic 350, Pulsar...)</option>
                  <option value="MOPED">Mopeds (TVS XL100 Utility)</option>
                  <option value="CAR">Cars (Hatchbacks, Sedans, SUVs, MUVs)</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-calendar-event text-primary me-1"></i> Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={searchPickup}
                  required
                  onChange={(e) => setSearchPickup(e.target.value)}
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-calendar-check text-primary me-1"></i> Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={searchReturn}
                  required
                  onChange={(e) => setSearchReturn(e.target.value)}
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i> Pickup Location
                </label>
                <select
                  className="form-select"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                >
                  <option value="Mumbai Central Hub">Mumbai Central Hub</option>
                  <option value="Andheri West, Mumbai">Andheri West, Mumbai</option>
                  <option value="Bandra Kurla Complex, Mumbai">Bandra Kurla Complex, Mumbai</option>
                  <option value="Connaught Place, New Delhi">Connaught Place, New Delhi</option>
                  <option value="Koramangala, Bengaluru">Koramangala, Bengaluru</option>
                  <option value="Hitec City, Hyderabad">Hitec City, Hyderabad</option>
                </select>
              </div>

              <div className="col-12 text-end mt-4">
                <button
                  type="submit"
                  className="btn btn-accent btn-lg px-4 py-2 fw-bold"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Searching Live Fleet...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i> Search Available Vehicles
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Search Results Display (if active) */}
      {searchResults !== null && (
        <section className="container mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                Available Vehicles Matching Your Schedule
              </h3>
              <p className="text-muted mb-0">
                Found {searchResults.length} available vehicle(s) for the selected dates and location.
              </p>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchResults(null)}>
              Clear Results
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="card text-center py-5 border-dashed bg-white shadow-sm">
              <i className="bi bi-calendar-x text-muted fs-1 mb-2"></i>
              <h5 className="fw-bold text-dark">No Available Vehicles For This Slot</h5>
              <p className="text-muted mb-0">Try adjusting your dates or check another pickup location.</p>
            </div>
          ) : (
            <div className="row g-4">
              {searchResults.map((v) => (
                <div key={v.id} className="col-lg-4 col-md-6">
                  <VehicleCard
                    vehicle={v}
                    onBook={openBookModal}
                    onViewDetails={openDetailsModal}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Popular Vehicles Section */}
      <section className="container mt-5 pt-4">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold text-primary small tracking-wide">
            Prime Fleet Showcase
          </span>
          <h2 className="fw-bold text-dark mt-1">Popular Vehicles For Rent</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
            Choose from a premier collection of city commuters, highway cruisers, and spacious family cars.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {[
              { id: 'ALL', label: 'All Fleet', icon: 'bi-grid' },
              { id: 'SCOOTER', label: 'Scooters', icon: 'bi-scooter' },
              { id: 'BIKE', label: 'Bikes', icon: 'bi-bicycle' },
              { id: 'MOPED', label: 'Mopeds', icon: 'bi-box-seam' },
              { id: 'CAR', label: 'Cars', icon: 'bi-car-front' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn rounded-pill px-3 py-2 fw-semibold ${
                  popularTab === tab.id ? 'btn-navy shadow-sm' : 'btn-outline-secondary'
                }`}
                onClick={() => setPopularTab(tab.id)}
              >
                <i className={`bi ${tab.icon} me-1`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading popular vehicles..." />
        ) : (
          <div className="row g-4">
            {vehicles
              .filter((v) => {
                if (popularTab === 'ALL') return true;
                if (popularTab === 'SCOOTER') return v.category === 'SCOOTER' || (v.category === 'TWO_WHEELER' && v.subCategory === 'SCOOTER');
                if (popularTab === 'BIKE') return v.category === 'BIKE' || (v.category === 'TWO_WHEELER' && v.subCategory === 'MOTORCYCLE');
                if (popularTab === 'MOPED') return v.category === 'MOPED' || (v.category === 'TWO_WHEELER' && v.subCategory === 'MOPED');
                if (popularTab === 'CAR') return v.category === 'CAR';
                return true;
              })
              .slice(0, 6)
              .map((vehicle) => (
                <div key={vehicle.id} className="col-lg-4 col-md-6">
                  <VehicleCard
                    vehicle={vehicle}
                    onBook={openBookModal}
                    onViewDetails={openDetailsModal}
                  />
                </div>
              ))}
          </div>
        )}

        <div className="text-center mt-5">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/scooters" className="btn btn-outline-navy px-3 py-2 rounded-pill">
              <i className="bi bi-scooter me-1"></i> View All Scooters
            </Link>
            <Link to="/bikes" className="btn btn-outline-navy px-3 py-2 rounded-pill">
              <i className="bi bi-bicycle me-1"></i> View All Bikes
            </Link>
            <Link to="/mopeds" className="btn btn-outline-navy px-3 py-2 rounded-pill">
              <i className="bi bi-box-seam me-1"></i> View All Mopeds
            </Link>
            <Link to="/cars" className="btn btn-navy px-4 py-2 rounded-pill">
              <i className="bi bi-car-front me-1"></i> View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us? */}
      <section className="container mt-5 pt-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold text-warning small tracking-wide">
            Our Advantage
          </span>
          <h2 className="fw-bold text-dark mt-1">Why Choose DriveEase Rentals?</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Experience hassle-free mobility with complete freedom and guaranteed peace of mind.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="feature-box h-100">
              <div className="feature-icon-circle">
                <i className="bi bi-wallet2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Affordable Pricing</h5>
              <p className="text-muted small mb-0">
                Transparent hourly and daily rates without hidden charges or surprise surcharges.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-box h-100">
              <div className="feature-icon-circle">
                <i className="bi bi-phone"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Easy Online Booking</h5>
              <p className="text-muted small mb-0">
                Book in seconds from any device with live availability checks and instant confirmation.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-box h-100">
              <div className="feature-icon-circle">
                <i className="bi bi-clock-history"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Flexible Rental Hours</h5>
              <p className="text-muted small mb-0">
                Rent by the hour for errands or by the week for getaways. Change plans on the go.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-box h-100">
              <div className="feature-icon-circle">
                <i className="bi bi-shield-check"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Reliable Vehicles</h5>
              <p className="text-muted small mb-0">
                Fully sanitized, routinely serviced, 100% roadworthy vehicles with 24x7 roadside assist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="container mt-5 pt-5">
        <div className="card bg-navy text-white p-5 border-0 shadow-lg" style={{ backgroundColor: 'var(--navy-dark)', borderRadius: '24px' }}>
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
              Simple 5-Step Process
            </span>
            <h2 className="fw-bold text-white mt-1">How DriveEase Works</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              From selection to return, your self-drive rental is streamlined for maximum comfort.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="step-card">
                <div className="step-number bg-warning text-dark">1</div>
                <h6 className="fw-bold text-white mb-2">Choose Vehicle</h6>
                <p className="small text-secondary mb-0">
                  Select your preferred car or two-wheeler.
                </p>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="step-card">
                <div className="step-number bg-warning text-dark">2</div>
                <h6 className="fw-bold text-white mb-2">Select Duration</h6>
                <p className="small text-secondary mb-0">
                  Pick your exact pickup & return hours.
                </p>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="step-card">
                <div className="step-number bg-warning text-dark">3</div>
                <h6 className="fw-bold text-white mb-2">Confirm Booking</h6>
                <p className="small text-secondary mb-0">
                  Review the quote and confirm with reference.
                </p>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="step-card">
                <div className="step-number bg-warning text-dark">4</div>
                <h6 className="fw-bold text-white mb-2">Pick Up & Enjoy</h6>
                <p className="small text-secondary mb-0">
                  Present your license and hit the road.
                </p>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="step-card">
                <div className="step-number bg-warning text-dark">5</div>
                <h6 className="fw-bold text-white mb-2">Easy Return</h6>
                <p className="small text-secondary mb-0">
                  Quick check-in & deposit refund settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default Home;
