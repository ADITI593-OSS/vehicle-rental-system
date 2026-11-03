import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CustomerRoute, AdminRoute } from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Public & Customer Pages
import Home from './pages/Home';
import Scooters from './pages/Scooters';
import Bikes from './pages/Bikes';
import Mopeds from './pages/Mopeds';
import TwoWheelers from './pages/TwoWheelers';
import Cars from './pages/Cars';
import ContactUs from './pages/ContactUs';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageRentals from './pages/admin/ManageRentals';
import ManageReturns from './pages/admin/ManageReturns';
import ManagePayments from './pages/admin/ManagePayments';

// Layout wrapper for public and customer views
const MainLayout = () => (
  <div className="d-flex flex-column min-vh-100">
    <Navbar />
    <div className="flex-grow-1">
      <Outlet />
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public & Customer Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/scooters" element={<Scooters />} />
            <Route path="/bikes" element={<Bikes />} />
            <Route path="/mopeds" element={<Mopeds />} />
            <Route path="/two-wheelers" element={<TwoWheelers />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/booking-confirmation/:bookingRef"
              element={
                <CustomerRoute>
                  <BookingConfirmationPage />
                </CustomerRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <CustomerRoute>
                  <MyBookings />
                </CustomerRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <CustomerRoute>
                  <Profile />
                </CustomerRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<ManageVehicles />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="rentals" element={<ManageRentals />} />
            <Route path="returns" element={<ManageReturns />} />
            <Route path="payments" element={<ManagePayments />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
