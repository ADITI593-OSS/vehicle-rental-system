import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    registrationNumber: '',
    category: 'CAR',
    subCategory: 'HATCHBACK',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 5,
    pricePerHour: '',
    pricePerDay: '',
    securityDeposit: '2000',
    location: 'Mumbai Central Hub',
    imageUrl: '',
    vehicleStatus: 'AVAILABLE',
    description: '',
    features: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      registrationNumber: '',
      category: 'CAR',
      subCategory: 'HATCHBACK',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: 5,
      pricePerHour: '150',
      pricePerDay: '1600',
      securityDeposit: '3000',
      location: 'Mumbai Central Hub',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      vehicleStatus: 'AVAILABLE',
      description: 'Clean, well-maintained self-drive rental vehicle.',
      features: 'Air Conditioning, Bluetooth Infotainment, Power Steering',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (v) => {
    setEditingVehicle(v);
    setFormData({
      brand: v.brand,
      model: v.model,
      registrationNumber: v.registrationNumber,
      category: v.category,
      subCategory: v.subCategory,
      fuelType: v.fuelType,
      transmission: v.transmission,
      seatingCapacity: v.seatingCapacity,
      pricePerHour: v.pricePerHour,
      pricePerDay: v.pricePerDay,
      securityDeposit: v.securityDeposit,
      location: v.location,
      imageUrl: v.imageUrl,
      vehicleStatus: v.vehicleStatus,
      description: v.description || '',
      features: v.features || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingVehicle) {
        await api.put(`/admin/vehicles/${editingVehicle.id}`, formData);
        setAlertMsg({ text: `Vehicle ${formData.brand} ${formData.model} updated successfully!`, type: 'success' });
      } else {
        await api.post('/admin/vehicles', formData);
        setAlertMsg({ text: `Vehicle ${formData.brand} ${formData.model} added successfully!`, type: 'success' });
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save vehicle. Check all inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/vehicles/${id}/status`, { status: newStatus });
      setAlertMsg({ text: 'Vehicle status updated to ' + newStatus, type: 'info' });
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to set vehicle "${name}" to INACTIVE?`)) {
      try {
        await api.delete(`/admin/vehicles/${id}`);
        setAlertMsg({ text: `Vehicle ${name} set to INACTIVE`, type: 'warning' });
        fetchVehicles();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete vehicle');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredVehicles = vehicles
    .filter((v) => {
      if (!categoryFilter) return true;
      if (categoryFilter === 'SCOOTER') return v.category === 'SCOOTER' || (v.category === 'TWO_WHEELER' && v.subCategory === 'SCOOTER');
      if (categoryFilter === 'BIKE') return v.category === 'BIKE' || v.category === 'MOTORCYCLE' || (v.category === 'TWO_WHEELER' && v.subCategory === 'MOTORCYCLE');
      if (categoryFilter === 'MOPED') return v.category === 'MOPED' || (v.category === 'TWO_WHEELER' && v.subCategory === 'MOPED');
      if (categoryFilter === 'CAR') return v.category === 'CAR';
      return v.category === categoryFilter;
    })
    .filter((v) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Fleet Vehicle Management</h2>
          <p className="text-muted small mb-0">
            Add new cars, scooters, bikes & mopeds, adjust hourly/daily pricing, update maintenance, and manage fleet.
          </p>
        </div>
        <button className="btn btn-accent mt-3 mt-md-0 fw-semibold" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add New Vehicle
        </button>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '14px' }}>
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search brand, model, registration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories (All 33 Fleet Vehicles)</option>
              <option value="SCOOTER">Scooters (Jupiter, Activa, Access...)</option>
              <option value="BIKE">Bikes & Motorcycles (Classic 350, Pulsar...)</option>
              <option value="MOPED">Mopeds (TVS XL100 Utility)</option>
              <option value="CAR">Cars (Swift, Creta, Nexon, Innova...)</option>
            </select>
          </div>
          <div className="col-md-3 text-md-end text-muted small pt-2">
            Showing <strong>{filteredVehicles.length}</strong> vehicles
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      {loading ? (
        <LoadingSpinner message="Loading fleet vehicles..." />
      ) : (
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-4">Vehicle</th>
                  <th>Registration</th>
                  <th>Category / Type</th>
                  <th>Specs</th>
                  <th>Hourly Rate</th>
                  <th>Daily Rate</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredVehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={v.imageUrl}
                          alt={v.model}
                          className="rounded-3 object-fit-contain bg-light border p-1 shadow-sm"
                          style={{ width: '60px', height: '44px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/vehicles/maruti-swift.png';
                          }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{v.brand} {v.model}</div>
                          <small className="text-muted">{v.location?.split(',')[0]}</small>
                        </div>
                      </div>
                    </td>
                    <td className="fw-semibold text-secondary">{v.registrationNumber}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {v.category === 'TWO_WHEELER' ? 'Two-Wheeler' : 'Car'} • {v.subCategory}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted d-block">{v.fuelType} • {v.transmission}</small>
                      <small className="text-muted">{v.seatingCapacity} Seats</small>
                    </td>
                    <td className="fw-bold text-primary">{formatCurrency(v.pricePerHour)}/hr</td>
                    <td className="fw-bold text-dark">{formatCurrency(v.pricePerDay)}/day</td>
                    <td className="text-success fw-semibold">{formatCurrency(v.securityDeposit)}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm fw-semibold ${
                          v.vehicleStatus === 'AVAILABLE'
                            ? 'text-success'
                            : v.vehicleStatus === 'RENTED'
                            ? 'text-primary'
                            : 'text-warning'
                        }`}
                        value={v.vehicleStatus}
                        onChange={(e) => handleStatusChange(v.id, e.target.value)}
                        style={{ width: '130px' }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RENTED">RENTED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleOpenEditModal(v)}
                          title="Edit vehicle"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(v.id, `${v.brand} ${v.model}`)}
                          title="Deactivate vehicle"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-navy text-white p-3 px-4" style={{ backgroundColor: 'var(--navy-dark)' }}>
                <h5 className="modal-title fw-bold text-white">
                  {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle to Fleet'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger py-2 small mb-3">{formError}</div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Brand</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Maruti Suzuki, Royal Enfield"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Model</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Swift, Classic 350"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Registration Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MH-01-AB-1234"
                        required
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="SCOOTER">SCOOTER</option>
                        <option value="BIKE">BIKE</option>
                        <option value="MOPED">MOPED</option>
                        <option value="CAR">CAR</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Sub-Category</label>
                      <select
                        className="form-select"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="SCOOTER">SCOOTER</option>
                        <option value="MOTORCYCLE">MOTORCYCLE</option>
                        <option value="MOPED">MOPED</option>
                        <option value="HATCHBACK">HATCHBACK</option>
                        <option value="SEDAN">SEDAN</option>
                        <option value="SUV">SUV</option>
                        <option value="MUV">MUV</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Fuel Type</label>
                      <select
                        className="form-select"
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Transmission</label>
                      <select
                        className="form-select"
                        value={formData.transmission}
                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Seating Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="form-control"
                        required
                        value={formData.seatingCapacity}
                        onChange={(e) => setFormData({ ...formData, seatingCapacity: parseInt(e.target.value, 10) })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Price / Hour (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-control"
                        required
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Price / Day (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-control"
                        required
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Security Deposit (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        required
                        value={formData.securityDeposit}
                        onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Hub Location</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        required
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Vehicle Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Features & Amenities (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Airbag, Sunroof, ABS, Bluetooth..."
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer p-3">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehicles;
