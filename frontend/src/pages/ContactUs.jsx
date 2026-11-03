import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    subject: 'Booking Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Banner */}
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
                <i className="bi bi-headset me-1"></i> Customer Support 24/7
              </span>
              <h1 className="fw-bold text-white mb-2">We're Here to Help You Drive Easy</h1>
              <p className="text-light mb-0" style={{ opacity: 0.9 }}>
                Have questions regarding vehicle pickup, custom corporate rentals, security deposit refunds, or 24/7 roadside assistance? Reach out to our team anytime.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
              <div className="bg-dark bg-opacity-50 p-3 rounded-4 border border-secondary d-inline-block text-start">
                <div className="text-secondary small">Emergency Helpline</div>
                <div className="fs-3 fw-bold text-warning">+91 98200 98200</div>
                <small className="text-success fw-semibold"><i className="bi bi-telephone-inbound"></i> Toll-Free Support Available</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Contact Details & Hubs */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold text-dark mb-3">Headquarters & Central Hubs</h5>

              <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Mumbai Hub (HQ)</h6>
                  <p className="text-muted small mb-0">
                    Plot 42, Link Road, Andheri West, Mumbai, Maharashtra - 400053
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Bengaluru Tech Hub</h6>
                  <p className="text-muted small mb-0">
                    80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka - 560034
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Delhi NCR Hub</h6>
                  <p className="text-muted small mb-0">
                    Inner Circle, Block C, Connaught Place, New Delhi - 110001
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Hyderabad Cyber Hub</h6>
                  <p className="text-muted small mb-0">
                    Mindspace IT Park, HITEC City, Hyderabad, Telangana - 500081
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="card border-0 shadow-sm p-4 text-white" style={{ backgroundColor: 'var(--navy-dark)', borderRadius: '16px' }}>
              <h5 className="fw-bold text-white mb-3">Direct Contacts</h5>
              <div className="mb-3">
                <small className="text-secondary d-block">Customer Care Email</small>
                <a href="mailto:support@driveease.com" className="text-warning fw-semibold text-decoration-none">
                  support@driveease.com
                </a>
              </div>
              <div className="mb-3">
                <small className="text-secondary d-block">Fleet & Corporate Partnerships</small>
                <a href="mailto:corporate@driveease.com" className="text-light text-decoration-none">
                  corporate@driveease.com
                </a>
              </div>
              <div>
                <small className="text-secondary d-block">Operating Hours</small>
                <span className="text-light fw-medium">Open 24 hours / 7 days a week</span>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
              <h4 className="fw-bold text-dark mb-1">Send Us a Message</h4>
              <p className="text-muted mb-4 small">
                Fill out the form below and our regional dispatch supervisor will respond within 15 minutes.
              </p>

              {submitted ? (
                <div className="alert alert-success p-4 rounded-4 text-center my-4">
                  <div className="fs-1 text-success mb-2"><i className="bi bi-check-circle-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Message Received!</h5>
                  <p className="text-muted small mb-3">
                    Thank you, <strong>{formData.name}</strong>. Our team has received your inquiry and our support officer will contact you shortly on <strong>{formData.phone || formData.email}</strong>.
                  </p>
                  <button
                    className="btn btn-navy px-4"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        city: 'Mumbai',
                        subject: 'Booking Inquiry',
                        message: '',
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Your Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Mobile Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        placeholder="e.g. 9820098200"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Nearest City Hub</label>
                      <select
                        className="form-select"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="New Delhi">New Delhi</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Message / Query *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        required
                        placeholder="Describe your question, rental requirements, or feedback..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-accent w-100 py-3 fw-bold">
                        <i className="bi bi-send-fill me-2"></i> Submit Inquiry
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
