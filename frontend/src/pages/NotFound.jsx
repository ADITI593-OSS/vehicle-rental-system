import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="py-5 text-center my-5">
      <div className="container" style={{ maxWidth: '450px' }}>
        <h1 className="display-1 fw-bold text-navy" style={{ color: 'var(--navy-dark)' }}>404</h1>
        <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-accent px-4 py-2">
          Back to Home Page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
