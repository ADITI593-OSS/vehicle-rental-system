import React from 'react';

const VehicleDetailsModal = ({ vehicle, show, onClose, onBookNow }) => {
  if (!show || !vehicle) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="modal-header bg-navy text-white py-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
            <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill text-warning"></i>
              Vehicle Specifications & Details
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Image & Quick Specs */}
              <div className="col-md-6">
                <div className="rounded-3 overflow-hidden shadow-sm border mb-3 position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '240px' }}>
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-100 h-100 object-fit-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/vehicles/maruti-swift.png';
                    }}
                  />
                  <span className="badge bg-dark position-absolute bottom-0 start-0 m-2 px-3 py-2 opacity-90">
                    Reg: {vehicle.registrationNumber}
                  </span>
                </div>

                <h4 className="fw-bold text-dark mb-1">
                  {vehicle.brand} {vehicle.model}
                </h4>
                <p className="text-muted small mb-3">{vehicle.description}</p>

                <h6 className="fw-bold text-dark mb-2">Key Features:</h6>
                <div className="p-2 bg-light rounded border small text-secondary mb-3">
                  {vehicle.features || 'Standard rental amenities and comprehensive safety features.'}
                </div>

                <div className="alert alert-info py-2 px-3 small mb-0">
                  <i className="bi bi-shield-check me-2 fs-6"></i>
                  <strong>Required Documents:</strong> Valid Driving License & Government Photo ID (Aadhaar / Passport) at pickup.
                </div>
              </div>

              {/* Pricing & Terms */}
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-2">Configured Rental Rates:</h6>
                <div className="table-responsive border rounded-3 mb-3">
                  <table className="table table-sm table-striped mb-0 text-center">
                    <thead className="table-dark small">
                      <tr>
                        <th>Duration</th>
                        <th>Rate (₹)</th>
                        <th>Savings</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      <tr>
                        <td>1 Hour</td>
                        <td className="fw-bold text-primary">{formatCurrency(vehicle.pricePerHour)}</td>
                        <td>Base Rate</td>
                      </tr>
                      <tr>
                        <td>6 Hours</td>
                        <td className="fw-bold text-primary">{formatCurrency(vehicle.priceFor6Hours)}</td>
                        <td className="text-success fw-bold">10% Off</td>
                      </tr>
                      <tr>
                        <td>12 Hours</td>
                        <td className="fw-bold text-primary">{formatCurrency(vehicle.priceFor12Hours)}</td>
                        <td className="text-success fw-bold">15% Off</td>
                      </tr>
                      <tr>
                        <td>24 Hours (Full Day)</td>
                        <td className="fw-bold text-primary">{formatCurrency(vehicle.pricePerDay)}</td>
                        <td className="text-success fw-bold">Best Value</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-bold text-dark mb-2">Rental Policies & Deposit:</h6>
                <ul className="list-group list-group-flush small border rounded-3 mb-3">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Security Deposit (Refundable)</span>
                    <span className="fw-bold text-success">{formatCurrency(vehicle.securityDeposit)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Fuel Policy</span>
                    <span className="text-muted">Same-to-Same Level</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Pickup Location</span>
                    <span className="text-muted text-end">{vehicle.location}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Late Return Policy</span>
                    <span className="text-muted">30m grace, then 1.5x hourly</span>
                  </li>
                </ul>

                <button
                  type="button"
                  className="btn btn-accent w-100 fw-bold py-2 shadow"
                  disabled={vehicle.vehicleStatus !== 'AVAILABLE'}
                  onClick={() => {
                    onClose();
                    onBookNow(vehicle);
                  }}
                >
                  <i className="bi bi-key-fill me-2"></i>
                  {vehicle.vehicleStatus === 'AVAILABLE' ? 'Proceed to Book This Vehicle' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
