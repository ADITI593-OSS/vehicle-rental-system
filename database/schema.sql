-- ============================================================================
-- DriveEase Rentals - Vehicle Rental System Database Schema & Initial Data
-- Database: vehicle_rental_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS vehicle_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vehicle_rental_db;

-- 1. USERS TABLE
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rental_pricing_rules;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VEHICLES TABLE
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(60) NOT NULL,
    model VARCHAR(80) NOT NULL,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL, -- TWO_WHEELER, CAR
    sub_category VARCHAR(40) NOT NULL, -- SCOOTER, MOTORCYCLE, HATCHBACK, SEDAN, SUV, MUV
    fuel_type VARCHAR(30) NOT NULL, -- Petrol, Diesel, Electric, CNG
    transmission VARCHAR(30) NOT NULL, -- Manual, Automatic
    seating_capacity INT NOT NULL DEFAULT 2,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    location VARCHAR(100) NOT NULL DEFAULT 'Mumbai Central Hub',
    image_url VARCHAR(500) NOT NULL,
    vehicle_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, RENTED, MAINTENANCE, INACTIVE
    description TEXT,
    features VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOKINGS TABLE
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    pickup_datetime DATETIME NOT NULL,
    expected_return_datetime DATETIME NOT NULL,
    actual_return_datetime DATETIME NULL,
    rental_duration_hours INT NOT NULL,
    rental_amount DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    late_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    security_deposit DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- PENDING, CONFIRMED, CANCELLED, COMPLETED
    pickup_location VARCHAR(120) NOT NULL,
    drop_location VARCHAR(120) NOT NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 4. RETURNS TABLE
CREATE TABLE returns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    actual_return_datetime DATETIME NOT NULL,
    vehicle_condition VARCHAR(50) NOT NULL DEFAULT 'GOOD', -- EXCELLENT, GOOD, MINOR_SCRATCH, DAMAGED
    odometer_reading INT NOT NULL DEFAULT 0,
    damage_notes TEXT,
    additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    late_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deposit_refund_status VARCHAR(40) NOT NULL DEFAULT 'FULLY_REFUNDED', -- PENDING, FULLY_REFUNDED, PARTIALLY_REFUNDED, FORFEITED
    final_amount DECIMAL(10,2) NOT NULL,
    returned_by VARCHAR(100) NOT NULL DEFAULT 'Admin Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_returns_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 5. RENTAL PRICING RULES TABLE
CREATE TABLE rental_pricing_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NULL,
    pricing_type VARCHAR(50) NOT NULL, -- HOURLY_TIER, WEEKEND_SURCHARGE, PROMOTIONAL
    duration_hours INT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_pricing_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ============================================================================
-- SEED DATA
-- Default Passwords (BCrypt hash for 'admin123' and 'customer123'):
-- '$2a$10$wT0lYl0O11O7Gf7B8kE76OC6wZk3q66Jq.fO0gA2lQyE26p4k1nB2' -> admin123
-- '$2a$10$f3F8i9tJ/pP0dEv1n1k/QOFwZlqD7Z9rV3B.xZ.tO3yL3rE9.vM0e' -> customer123
-- We also implement runtime BCrypt hashing in DataInitializer so any environment works seamlessly.
-- ============================================================================

-- Seed Users
INSERT INTO users (full_name, email, mobile_number, password_hash, role, account_status) VALUES
('System Administrator', 'admin@driveease.com', '9876543210', '$2a$10$wT0lYl0O11O7Gf7B8kE76OC6wZk3q66Jq.fO0gA2lQyE26p4k1nB2', 'ROLE_ADMIN', 'ACTIVE'),
('Rahul Sharma', 'rahul@gmail.com', '9820098200', '$2a$10$f3F8i9tJ/pP0dEv1n1k/QOFwZlqD7Z9rV3B.xZ.tO3yL3rE9.vM0e', 'ROLE_CUSTOMER', 'ACTIVE'),
('Priya Patel', 'priya@gmail.com', '9811198111', '$2a$10$f3F8i9tJ/pP0dEv1n1k/QOFwZlqD7Z9rV3B.xZ.tO3yL3rE9.vM0e', 'ROLE_CUSTOMER', 'ACTIVE');

-- Seed Vehicles: 6 Two-Wheelers + 6 Cars
INSERT INTO vehicles (brand, model, registration_number, category, sub_category, fuel_type, transmission, seating_capacity, price_per_hour, price_per_day, security_deposit, location, image_url, vehicle_status, description, features) VALUES
-- Two-Wheelers
('Honda', 'Activa 6G', 'MH-01-AB-1001', 'TWO_WHEELER', 'SCOOTER', 'Petrol', 'Automatic', 2, 70.00, 550.00, 1000.00, 'Andheri West, Mumbai', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Reliable and smooth automatic scooter, ideal for city commutes and quick errands.', 'Telescopic Suspension, Combi-Brake System, 110cc Fuel Efficient'),
('TVS', 'Jupiter 125', 'MH-02-CD-2002', 'TWO_WHEELER', 'SCOOTER', 'Petrol', 'Automatic', 2, 75.00, 600.00, 1000.00, 'Bandra Kurla Complex, Mumbai', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Spacious 125cc scooter with massive underseat storage and comfortable legroom.', 'Underseat USB Charger, External Fuel Fill, Disc Brakes'),
('Honda', 'Shine 125', 'MH-03-EF-3003', 'TWO_WHEELER', 'MOTORCYCLE', 'Petrol', 'Manual', 2, 85.00, 700.00, 1200.00, 'Connaught Place, New Delhi', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'India''s favorite commuter motorcycle with super quiet eSP engine and 65 km/l mileage.', '5-Speed Gearbox, Silent Start with ACG, Tubeless Tyres'),
('Royal Enfield', 'Classic 350', 'MH-04-GH-4004', 'TWO_WHEELER', 'MOTORCYCLE', 'Petrol', 'Manual', 2, 160.00, 1400.00, 2500.00, 'Koramangala, Bengaluru', 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Timeless retro thumper with modern refined J-series engine. Supreme road presence and highway cruising.', 'Dual-Channel ABS, Tripper Navigation, Touring Comfort'),
('Bajaj', 'Pulsar NS200', 'MH-05-IJ-5005', 'TWO_WHEELER', 'MOTORCYCLE', 'Petrol', 'Manual', 2, 130.00, 1100.00, 2000.00, 'Hitec City, Hyderabad', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Aggressive streetfighter naked bike with perimeter frame and triple spark engine.', 'Liquid Cooled 24.5 PS, Upside Down Forks, Dual ABS'),
('Yamaha', 'FZ-S V4', 'MH-06-KL-6006', 'TWO_WHEELER', 'MOTORCYCLE', 'Petrol', 'Manual', 2, 110.00, 950.00, 1500.00, 'Indiranagar, Bengaluru', 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Sporty, modern street bike equipped with traction control system and Bluetooth connectivity.', 'Traction Control, LED Flashers, Y-Connect Mobile App'),

-- Cars
('Maruti Suzuki', 'Swift ZXi', 'MH-12-MN-7007', 'CAR', 'HATCHBACK', 'Petrol', 'Manual', 5, 140.00, 1500.00, 3000.00, 'Andheri West, Mumbai', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Fun to drive, peppy hatchback with fantastic fuel economy and easy city parking.', 'Apple CarPlay / Android Auto, Cruise Control, Keyless Push Start'),
('Hyundai', 'i20 Asta', 'MH-14-OP-8008', 'CAR', 'HATCHBACK', 'Petrol', 'Automatic', 5, 160.00, 1700.00, 3000.00, 'Bandra Kurla Complex, Mumbai', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Premium European style hatchback with Bose 7-speaker audio and electric sunroof.', 'Bose Premium Sound, Electric Sunroof, Wireless Phone Charger'),
('Tata', 'Nexon Fearless', 'MH-15-QR-9009', 'CAR', 'SUV', 'Diesel', 'Manual', 5, 210.00, 2200.00, 4000.00, 'Connaught Place, New Delhi', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', '5-Star GNCAP safety rated compact SUV with commanding driving position and punchy turbo torque.', '5-Star Safety, 360-Degree Camera, Ventilated Front Seats'),
('Hyundai', 'Creta SX(O)', 'MH-20-ST-1010', 'CAR', 'SUV', 'Diesel', 'Automatic', 5, 260.00, 2800.00, 5000.00, 'Hitec City, Hyderabad', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'India''s favorite mid-size SUV featuring panoramic sunroof, level 2 ADAS, and plush leatherette seats.', 'Panoramic Sunroof, Level 2 ADAS, Bose Sound System'),
('Maruti Suzuki', 'Ertiga ZXi', 'MH-43-UV-2020', 'CAR', 'MUV', 'CNG', 'Manual', 7, 220.00, 2400.00, 4000.00, 'Vashi, Navi Mumbai', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'Practical 7-seater family MPV with factory-fitted CNG and dual-row roof mounted AC vents.', '7 Passenger Seating, SmartPlay Pro Audio, Dual AC'),
('Toyota', 'Innova Crysta', 'MH-03-WX-3030', 'CAR', 'MUV', 'Diesel', 'Automatic', 7, 340.00, 3600.00, 6000.00, 'Koramangala, Bengaluru', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80', 'AVAILABLE', 'The undisputed king of long distance highway touring with unmatched comfort and bulletproof reliability.', 'Captain Seats, 7 Airbags, Climate Control, Exceptional Legroom');

-- Seed Sample Bookings (one completed with return, one active)
INSERT INTO bookings (booking_reference, customer_id, vehicle_id, pickup_datetime, expected_return_datetime, actual_return_datetime, rental_duration_hours, rental_amount, additional_charges, late_fee, security_deposit, tax_amount, total_amount, booking_status, pickup_location, drop_location, notes) VALUES
('DER-2026-1001', 2, 4, '2026-10-01 10:00:00', '2026-10-02 10:00:00', '2026-10-02 10:30:00', 24, 1400.00, 0.00, 0.00, 2500.00, 70.00, 3970.00, 'COMPLETED', 'Koramangala, Bengaluru', 'Koramangala, Bengaluru', 'Weekend ride to Nandi Hills'),
('DER-2026-1002', 2, 7, '2026-10-15 09:00:00', '2026-10-17 09:00:00', NULL, 48, 3000.00, 0.00, 0.00, 3000.00, 150.00, 6150.00, 'CONFIRMED', 'Andheri West, Mumbai', 'Andheri West, Mumbai', 'Family weekend trip to Lonavala');

-- Seed Sample Return for Booking #1
INSERT INTO returns (booking_id, actual_return_datetime, vehicle_condition, odometer_reading, damage_notes, additional_charges, late_fee, deposit_refund_status, final_amount, returned_by) VALUES
(1, '2026-10-02 10:30:00', 'EXCELLENT', 14250, 'Vehicle returned in spotless clean condition. Fuel level full.', 0.00, 0.00, 'FULLY_REFUNDED', 1470.00, 'Admin Staff');
