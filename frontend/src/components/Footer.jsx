import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold text-white mb-3">
              <i className="bi bi-speedometer2 brand-accent me-2"></i>
              Drive<span className="brand-accent">Ease</span> Rentals
            </h4>
            <p className="text-secondary pe-lg-4">
              Your premier vehicle rental service across major Indian cities. Offering a reliable, transparent,
              and seamless self-drive experience for bikes, scooters, and cars by the hour or day.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5>Categories</h5>
            <Link to="/scooters" className="footer-link">Scooters</Link>
            <Link to="/bikes" className="footer-link">Motorcycles & Bikes</Link>
            <Link to="/mopeds" className="footer-link">Mopeds (TVS XL100)</Link>
            <Link to="/cars" className="footer-link">Self-Drive Cars</Link>
            <Link to="/contact" className="footer-link">Contact & Hubs</Link>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5>Rental Fleets</h5>
            <span className="footer-link">Electric & Petrol Scooters</span>
            <span className="footer-link">Cruisers & Naked Sports Bikes</span>
            <span className="footer-link">City Hatchbacks & Sedans</span>
            <span className="footer-link">7-Seater Family MUVs</span>
            <span className="footer-link">Highway Compact SUVs</span>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5>Contact & Support</h5>
            <p className="mb-2 text-secondary">
              <i className="bi bi-geo-alt brand-accent me-2"></i>
              Andheri West Hub, Mumbai, Maharashtra 400053
            </p>
            <p className="mb-2 text-secondary">
              <i className="bi bi-telephone brand-accent me-2"></i>
              +91 98765 43210 (24x7 Roadside Assistance)
            </p>
            <p className="mb-2 text-secondary">
              <i className="bi bi-envelope brand-accent me-2"></i>
              support@driveease.com
            </p>
            <p className="mb-0 text-secondary">
              <i className="bi bi-clock brand-accent me-2"></i>
              Daily: 6:00 AM - 11:30 PM IST
            </p>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} DriveEase Rentals India Pvt. Ltd. All Rights Reserved.
          </div>
          <div className="d-flex gap-3 mt-3 mt-md-0">
            <span className="footer-link mb-0">Terms & Conditions</span>
            <span>•</span>
            <span className="footer-link mb-0">Privacy Policy</span>
            <span>•</span>
            <span className="footer-link mb-0">Security Deposit Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
