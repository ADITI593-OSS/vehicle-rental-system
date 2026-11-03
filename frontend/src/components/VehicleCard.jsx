import React from 'react';

const VehicleCard = ({ vehicle, onBook, onViewDetails }) => {
  const isAvailable = vehicle.vehicleStatus === 'AVAILABLE';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCategoryLabel = () => {
    if (vehicle.category === 'SCOOTER') return 'Scooter';
    if (vehicle.category === 'MOPED') return 'Moped';
    if (vehicle.category === 'BIKE' || vehicle.category === 'MOTORCYCLE') return 'Motorcycle';
    if (vehicle.category === 'CAR') return 'Car';
    if (vehicle.category === 'TWO_WHEELER') {
      if (vehicle.subCategory === 'SCOOTER') return 'Scooter';
      if (vehicle.subCategory === 'MOPED') return 'Moped';
      return 'Motorcycle';
    }
    return vehicle.category;
  };

  const getFallbackImage = () => {
    const cat = vehicle.category?.toUpperCase();
    const sub = vehicle.subCategory?.toUpperCase();
    if (cat === 'SCOOTER' || sub === 'SCOOTER') return '/images/vehicles/honda-activa-6g.png';
    if (cat === 'MOPED' || sub === 'MOPED') return '/images/vehicles/tvs-xl100-heavy-duty.png';
    if (cat === 'BIKE' || cat === 'MOTORCYCLE' || sub === 'MOTORCYCLE') return '/images/vehicles/royal-enfield-classic-350.png';
    return '/images/vehicles/maruti-swift.png';
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-img-wrapper">
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getFallbackImage();
          }}
        />
        <span className="badge-category">
          {getCategoryLabel()} • {vehicle.subCategory}
        </span>
        <span
          className={`badge-status ${
            isAvailable ? 'bg-success text-white' : 'bg-secondary text-white'
          }`}
        >
          {isAvailable ? 'Available' : vehicle.vehicleStatus}
        </span>
      </div>

      <div className="p-4 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark">
                {vehicle.brand} {vehicle.model}
              </h5>
              <small className="text-muted">Reg: {vehicle.registrationNumber}</small>
            </div>
            <div className="text-end">
              <div className="vehicle-price-highlight text-primary">
                {formatCurrency(vehicle.pricePerHour)}
                <span className="fs-6 fw-normal text-muted">/hr</span>
              </div>
              <small className="text-muted fw-semibold">
                {formatCurrency(vehicle.pricePerDay)}/day
              </small>
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="d-flex flex-wrap gap-2 my-3">
            <span className="vehicle-spec-pill">
              <i className="bi bi-fuel-pump text-danger"></i> {vehicle.fuelType}
            </span>
            <span className="vehicle-spec-pill">
              <i className="bi bi-gear-wide-connected text-primary"></i> {vehicle.transmission}
            </span>
            <span className="vehicle-spec-pill">
              <i className="bi bi-people text-success"></i> {vehicle.seatingCapacity} Seater
            </span>
            <span className="vehicle-spec-pill">
              <i className="bi bi-geo-alt text-warning"></i> {vehicle.location?.split(',')[0]}
            </span>
          </div>

          {/* Hourly Tier Pricing Mini Breakdown */}
          <div className="bg-light p-2 rounded-3 mb-3 border">
            <div className="row text-center g-1 small">
              <div className="col-4 border-end">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>6 Hours</span>
                <span className="fw-bold text-dark">{formatCurrency(vehicle.priceFor6Hours)}</span>
              </div>
              <div className="col-4 border-end">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>12 Hours</span>
                <span className="fw-bold text-dark">{formatCurrency(vehicle.priceFor12Hours)}</span>
              </div>
              <div className="col-4">
                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Deposit</span>
                <span className="fw-bold text-success">{formatCurrency(vehicle.securityDeposit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 pt-2 border-top">
          <button
            type="button"
            className="btn btn-outline-navy flex-grow-1"
            onClick={() => onViewDetails(vehicle)}
          >
            <i className="bi bi-info-circle me-1"></i> Details
          </button>
          <button
            type="button"
            className="btn btn-accent flex-grow-1"
            disabled={!isAvailable}
            onClick={() => onBook(vehicle)}
          >
            <i className="bi bi-key-fill me-1"></i> Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
