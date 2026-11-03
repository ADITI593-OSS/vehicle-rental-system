# DriveEase Rentals - Full-Stack Vehicle Rental System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![JWT](https://img.shields.io/badge/Security-JWT%20Auth-red.svg)](https://jwt.io/)

A complete, modern, beginner-friendly, and production-ready **Vehicle Rental System** web application. Customers can rent two-wheelers (scooters, commuter motorcycles, cruisers) and cars (hatchbacks, sedans, SUVs, 7-seater MUVs) by the hour or day with instant availability verification, transparent pricing, refundable security deposits, and structured return inspections.

---

## 🚀 Key Features

### 1. Website & Customer Experience
- **Modern Theme:** Clean palette of deep navy blue (`#0B192C`), crisp white, light slate background, vibrant electric blue, and bold accent orange (`#FF6500`).
- **Hero & Quick Search:** Filter fleet by category (Cars vs Two-Wheelers), pickup date/time, return date/time, and Indian hub location with live conflict detection.
- **Dedicated Fleet Sections:**
  - **Two-Wheeler Rentals:** Scooters (Activa 6G, TVS Jupiter) and Motorcycles (Royal Enfield Classic 350, Pulsar NS200, Shine 125, Yamaha FZ-S). Filter by Scooter/Bike, fuel, price sorting, and availability.
  - **Car Rentals:** Hatchbacks (Swift, i20), SUVs (Nexon, Creta, Thar 4x4), and MUVs (Ertiga, Innova Crysta). Filter by body type, transmission (Manual/Automatic), fuel (Petrol, Diesel, CNG), seating capacity (5 or 7 seats).
- **Vehicle Specifications & Pricing Tiers:** Dedicated view for hourly rate, 6-hour discount rate (10% off), 12-hour discount rate (15% off), full-day (24h) rate, and refundable security deposits.
- **Customer Dashboard ("My Bookings"):**
  - KPI counters: Total Bookings, Active Rentals, Completed, and Cancelled.
  - Printable/downloadable booking confirmation vouchers.
  - Self-service booking cancellation with immediate security deposit release.
  - Profile contact update.

### 2. Real-World Business Rules & Security
- **Dynamic Pricing Engine:** Automatic calculation of base rental, multi-day tiers, 5% GST/platform fee, and security deposits in Indian Rupees (₹).
- **Overlapping Booking Prevention:** Backend query check (`pickup < existingReturn AND return > existingPickup`) ensuring two customers cannot book the same vehicle for overlapping time slots.
- **Privacy & Registration Masking:** Registration numbers are masked for the general public (e.g. `MH-01-XX-XXXX`) and only unmasked for authorized admins and assigned booking vouchers.
- **Role-Based Access Control (RBAC):** Spring Security with stateless JWT. Customers cannot access administrative management routes, alter prices, or process returns.

### 3. Vehicle Return & Inspection Workflow
- **Pending Returns Tracking:** Real-time visibility into active rentals due or overdue for return.
- **Condition & Damage Assessment:** Log actual return timestamp, vehicle condition (`EXCELLENT`, `GOOD`, `MINOR_SCRATCH`, `DAMAGED`), odometer reading, and damage notes.
- **Automated Late Fee Calculation:** 30-minute grace period; subsequent overdue hours are billed at 1.5x hourly rate.
- **Security Deposit Settlement:** Settle deposits as `FULLY_REFUNDED`, `PARTIALLY_REFUNDED`, or `FORFEITED` with automatic balance calculation.
- **Vehicle Auto-Freeing:** Automatically sets the vehicle status back to `AVAILABLE` and marks the booking as `COMPLETED`.

### 4. Admin Intelligence Dashboard
- **8 Real-Time KPI Cards:** Total Vehicles, Available Vehicles, Currently Rented, Total Customers, Total Bookings, Active Rentals, Pending Returns, and Rental Revenue.
- **Interactive Charts (Chart.js):**
  - Monthly Bookings Velocity (Bar Chart).
  - Fleet Category Share (Doughnut Chart: Cars vs Bikes).
  - Booking Status Lifecycle (Pie Chart).
- **Vehicle Fleet Management (CRUD):** Add new vehicle with image, specs, and price rules; edit details; toggle maintenance status; deactivate.
- **Customer Directory:** Search registered users, monitor booking counts, and toggle account activation/suspension.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Vite), React Router DOM, Axios, Bootstrap 5, Bootstrap Icons, Chart.js, React-Chartjs-2 |
| **Backend** | Java 17/21/25, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Spring Security, JJWT (0.11.5), Maven |
| **Database** | MySQL 8.0 (`vehicle_rental_db`) |
| **Tools** | VS Code, Postman, Git |

---

## 📂 Project Architecture

```
Final Coaching Project/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/driveease/vehiclerental/
│       │   ├── VehicleRentalApplication.java
│       │   ├── config/             # SecurityConfig, WebConfig, DataInitializer
│       │   ├── controller/         # Auth, Vehicle, Booking, Return, Admin, Dashboard
│       │   ├── dto/                # Request & Response Data Transfer Objects
│       │   ├── entity/             # User, Vehicle, Booking, ReturnRecord, PricingRule
│       │   ├── exception/          # GlobalExceptionHandler, Custom Exceptions
│       │   ├── repository/         # Spring Data JPA Repositories
│       │   ├── security/           # JwtUtils, JwtFilter, UserDetailsImpl
│       │   └── service/            # Core Business Services (Pricing, Booking, Return, etc.)
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/             # Navbar, Footer, VehicleCard, BookingModal, AdminLayout, etc.
│       ├── context/                # AuthContext (JWT session state)
│       ├── pages/                  # Home, TwoWheelers, Cars, MyBookings, Login, Register, Voucher
│       │   └── admin/              # AdminDashboard, ManageVehicles, ManageCustomers, Returns
│       ├── services/               # api.js (Axios HTTP client)
│       ├── App.jsx                 # Application routes
│       ├── main.jsx
│       └── index.css               # Global stylesheet & design tokens
├── database/
│   └── schema.sql                  # MySQL schema definition & seed records
├── postman/
│   └── DriveEase_Vehicle_Rental_API.postman_collection.json
└── README.md
```

---

## 📋 Prerequisites

Before running the application, ensure the following are installed:
- **Java Development Kit (JDK):** Version 17, 21, or 25
- **Apache Maven:** 3.8+ (or use local Maven executable)
- **Node.js & npm:** Node 18+ and npm 9+
- **MySQL Server:** Version 8.0+ running on port 3306

---

## 🗄️ Database Setup

1. Open MySQL command line client or MySQL Workbench.
2. Run the provided database script:

```bash
mysql -u root -p < database/schema.sql
```

*(Enter your MySQL root password when prompted)*

This automatically creates:
- The database `vehicle_rental_db`.
- Tables: `users`, `vehicles`, `bookings`, `returns`, `rental_pricing_rules`.
- Initial realistic fleet of 12 Indian vehicles (Activa, Classic 350, Pulsar, Swift, Creta, Nexon, Innova, etc.).
- Default Admin and Customer credentials.

---

## ⚙️ Configuration & Running the Application

### 1. Backend Configuration
Check `backend/src/main/resources/application.properties` to ensure your MySQL credentials match:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vehicle_rental_db?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=mysql
server.port=8080
```

### 2. Start the Spring Boot Backend

Open a terminal inside the `backend` folder:

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

The backend server starts at **`http://localhost:8080`**.

### 3. Start the React Frontend

Open a second terminal inside the `frontend` folder:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔐 Default Demo Accounts

For instant evaluation, the application includes pre-seeded demo accounts:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Administrator** | `admin@driveease.com` | `admin123` | Full access to Admin Dashboard, Vehicle CRUD, Customer Directory, Rental Management, and Return Processing |
| **Customer** | `rahul@gmail.com` | `customer123` | Browsing, price calculators, creating bookings, voucher viewing, cancellation, profile editing |
| **Customer 2** | `priya@gmail.com` | `customer123` | Alternate customer profile |

*(The login screen also features 1-click demo credential quick-fill buttons for fast testing).*

---

## 🌐 REST API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Vehicles (`/api/vehicles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | Public | List vehicles with filters (`category`, `subCategory`, `fuelType`, `sortBy`) |
| `GET` | `/api/vehicles/available` | Public | List all available vehicles |
| `GET` | `/api/vehicles/category/{category}` | Public | List vehicles by category (`TWO_WHEELER` or `CAR`) |
| `GET` | `/api/vehicles/search` | Public | Search available vehicles by date range & location |
| `GET` | `/api/vehicles/{id}` | Public | Get single vehicle details |
| `POST` | `/api/vehicles/calculate-price` | Public | Compute live quote (hours, base rent, tax, deposit, total) |

### Customer Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Customer / Admin | Create reservation with overlap check & pricing validation |
| `GET` | `/api/bookings/my-bookings` | Customer | List authenticated customer's booking history |
| `GET` | `/api/bookings/{id}` | Customer / Admin | Get booking voucher details |
| `PATCH` | `/api/bookings/{id}/cancel` | Customer / Admin | Cancel booking and release reservation slot |

### Admin & Returns (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/summary` | Admin Only | Real-time KPI counters, revenue, and charts data |
| `POST` | `/api/admin/vehicles` | Admin Only | Add new vehicle to fleet |
| `PUT` | `/api/admin/vehicles/{id}` | Admin Only | Update vehicle specifications and rates |
| `DELETE` | `/api/admin/vehicles/{id}` | Admin Only | Deactivate vehicle |
| `PATCH` | `/api/admin/vehicles/{id}/status` | Admin Only | Update vehicle status (`AVAILABLE`, `MAINTENANCE`, `INACTIVE`) |
| `GET` | `/api/admin/customers` | Admin Only | Directory of registered customer accounts |
| `PATCH` | `/api/admin/customers/{id}/toggle-status` | Admin Only | Suspend or activate customer account |
| `GET` | `/api/admin/bookings` | Admin Only | Audit all customer reservations with status filter |
| `GET` | `/api/admin/returns/pending` | Admin Only | List active rentals pending check-in |
| `POST` | `/api/admin/returns/{bookingId}` | Admin Only | Complete vehicle return, calculate late fees, and settle deposits |
| `GET` | `/api/admin/returns` | Admin Only | View return history audit log |

---

## 🧪 Postman Collection & Testing

A complete Postman test collection is located in `postman/DriveEase_Vehicle_Rental_API.postman_collection.json`.

### How to Import:
1. Open Postman.
2. Click **Import** in the top left corner.
3. Select `postman/DriveEase_Vehicle_Rental_API.postman_collection.json`.
4. Run requests in sequence:
   - **Login Customer** (Automatically stores `{{customerToken}}`).
   - **Login Admin** (Automatically stores `{{adminToken}}`).
   - **Create Booking**: Creates booking `#3`.
   - **Test Overlapping Booking**: Attempts overlapping reservation on the same vehicle. Returns `400 Bad Request` with message: *"Vehicle is already booked by another customer for the requested time range"*.
   - **Process Return**: Admin processes check-in, calculates late fee, and refunds security deposit.
   - **Test Unauthorized Access**: Customer tries to access `/api/admin/dashboard/summary`. Returns `403 Forbidden`.

---

## 🔒 Security Best Practices Implemented

- **Password Hashing:** Passwords hashed with BCrypt.
- **Stateless Tokens:** Signed HMAC-SHA256 JWT tokens with 24-hour expiration.
- **Credential Protection:** Customer passwords and tokens are never returned in public user profiles or admin directories.
- **Granular Authorization:** Secured Spring Security Filter Chain restricting `/api/admin/**` to `ROLE_ADMIN`.
- **CORS Configuration:** Explicitly permitted localhost dev ports (`5173` and `3000`).

---

## 🛡️ License

This project is created for educational and demonstration purposes. All rights reserved.
