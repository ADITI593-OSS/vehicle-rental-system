package com.driveease.vehiclerental.config;

import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.entity.Vehicle;
import com.driveease.vehiclerental.repository.UserRepository;
import com.driveease.vehiclerental.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        syncFleetVehicles();
    }

    private void initializeUsers() {
        // Ensure Admin user exists with valid BCrypt hash
        userRepository.findByEmail("admin@gmail.com").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode("admin123"));
                    admin.setRole("ROLE_ADMIN");
                    admin.setAccountStatus("ACTIVE");
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User(
                            "System Administrator",
                            "admin@gmail.com",
                            "9876543210",
                            passwordEncoder.encode("admin123"),
                            "ROLE_ADMIN"
                    );
                    userRepository.save(admin);
                    logger.info("Created default Admin: admin@gmail.com");
                }
        );
    }

    public void syncFleetVehicles() {
        logger.info("Ensuring all 33 verified Indian fleet vehicles are present and synced with local images...");

        // 8 Scooters
        upsertVehicle("TVS", "Jupiter 110", "MH-01-JP-1101", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("65.00"), new BigDecimal("500.00"), new BigDecimal("1000.00"),
                "Andheri West, Mumbai", "/images/vehicles/tvs-jupiter-110.jpg",
                "Comfortable, economical commuter scooter with advanced ET-Fi technology and large underseat storage.",
                "ET-Fi Technology, LED Headlamp, Large Footboard, 110cc Refined Engine");

        upsertVehicle("TVS", "Jupiter 125", "MH-01-JP-1252", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("75.00"), new BigDecimal("600.00"), new BigDecimal("1000.00"),
                "Bandra Kurla Complex, Mumbai", "/images/vehicles/tvs-jupiter-125.png",
                "Spacious 125cc scooter featuring progressive neo-retro styling, external front fuel lid, and massive underseat storage.",
                "Front External Fuel Fill, 33L Underseat Boot, Metal Body, Front Disc Brake");

        upsertVehicle("Honda", "Activa 6G", "MH-02-AC-6003", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("70.00"), new BigDecimal("550.00"), new BigDecimal("1000.00"),
                "Andheri West, Mumbai", "/images/vehicles/honda-activa-6g.png",
                "India's highest selling scooter with proven reliability, telescopic suspension, and silent ACG starter.",
                "Telescopic Suspension, eSP Engine, External Fuel Cap, Combi Brake System");

        upsertVehicle("Honda", "Activa 125", "MH-02-AC-1254", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("80.00"), new BigDecimal("650.00"), new BigDecimal("1000.00"),
                "Connaught Place, New Delhi", "/images/vehicles/honda-activa-125.png",
                "Premium 125cc commuter with digital-analog meter, intelligent key system, and supreme refinement.",
                "Smart Key, Real-time Mileage Indicator, Side Stand Engine Cut-Off, Disc Brake");

        upsertVehicle("Honda", "Dio 125", "MH-02-DI-1255", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("75.00"), new BigDecimal("600.00"), new BigDecimal("1000.00"),
                "Hitec City, Hyderabad", "/images/vehicles/honda-dio-125.png",
                "Sporty, dynamic moto-scooter with striking graphics, dual outlet exhaust muffler, and agile handling.",
                "Sporty Muffler, Wave Disk Brake, Fully Digital Cluster, Alloy Wheels");

        upsertVehicle("Suzuki", "Access 125", "MH-03-AC-1256", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("80.00"), new BigDecimal("650.00"), new BigDecimal("1000.00"),
                "Koramangala, Bengaluru", "/images/vehicles/suzuki-access-125.png",
                "Retro-modern flagship scooter by Suzuki with ultra-smooth 125cc SEP engine and LED headlamp.",
                "Suzuki Eco Performance, Bluetooth Digital Console, USB Socket, Chrome Mirror Covers");

        upsertVehicle("TVS", "NTORQ 125", "MH-03-NT-1257", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("85.00"), new BigDecimal("700.00"), new BigDecimal("1000.00"),
                "Indiranagar, Bengaluru", "/images/vehicles/tvs-ntorq-125.png",
                "Race-inspired performance scooter with SmartXonnect Bluetooth cluster, sport exhaust note, and dual riding modes.",
                "Race Edition Graphics, Stealth Aircraft Design, Lap Timer, High Speed Warning");

        upsertVehicle("Yamaha", "Fascino 125", "MH-04-FA-1258", "SCOOTER", "SCOOTER", "Petrol", "Automatic", 2,
                new BigDecimal("75.00"), new BigDecimal("620.00"), new BigDecimal("1000.00"),
                "Vashi, Navi Mumbai", "/images/vehicles/yamaha-fascino-125.png",
                "Classic European styling with Hybrid power assist engine, ultra-lightweight chassis, and stop & start system.",
                "Hybrid Assist, 99kg Lightweight Body, Smart Motor Generator, Automatic Stop & Start");

        // 2 Mopeds (Dedicated category)
        upsertVehicle("TVS", "XL100 Heavy Duty", "MH-04-XL-1001", "MOPED", "MOPED", "Petrol", "Automatic", 2,
                new BigDecimal("45.00"), new BigDecimal("350.00"), new BigDecimal("800.00"),
                "Andheri West, Mumbai", "/images/vehicles/tvs-xl100-heavy-duty.png",
                "India's legendary rugged multi-utility moped with detachable pillion seat, heavy-duty payload capacity, and high fuel economy.",
                "Detachable Pillion Seat, Heavy-Duty Frame, Rollover Sensor, 80+ kmpl Mileage");

        upsertVehicle("TVS", "XL100 Comfort i-Touchstart", "MH-04-XL-1002", "MOPED", "MOPED", "Petrol", "Automatic", 2,
                new BigDecimal("50.00"), new BigDecimal("390.00"), new BigDecimal("800.00"),
                "Connaught Place, New Delhi", "/images/vehicles/tvs-xl100-comfort.png",
                "Comfort edition moped with cushioned single-piece seat, USB mobile charger, silent integrated starter generator, and effortless ride.",
                "i-Touchstart Silent Electric Start, Cushioned Long Seat, USB Mobile Charger, Synchronized Braking");

        // 10 Motorcycles / Bikes
        upsertVehicle("Royal Enfield", "Classic 350", "MH-05-RE-3501", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("160.00"), new BigDecimal("1400.00"), new BigDecimal("2500.00"),
                "Koramangala, Bengaluru", "/images/vehicles/royal-enfield-classic-350.png",
                "Timeless retro icon powered by the refined 349cc J-series engine, dual-channel ABS, and signature exhaust thumper.",
                "J-Series 349cc Engine, Dual Channel ABS, Tripper Navigation, Supreme Highway Touring Comfort");

        upsertVehicle("Royal Enfield", "Hunter 350", "MH-05-RE-3502", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("150.00"), new BigDecimal("1300.00"), new BigDecimal("2500.00"),
                "Bandra Kurla Complex, Mumbai", "/images/vehicles/royal-enfield-hunter-350.png",
                "Compact, nimble urban roadster with light handling, punchy mid-range torque, and alloy wheels.",
                "Agile City Geometry, Tubeless Alloys, Dual-Channel ABS, USB Port");

        upsertVehicle("Honda", "Shine 125", "MH-06-HS-1251", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("85.00"), new BigDecimal("700.00"), new BigDecimal("1200.00"),
                "Connaught Place, New Delhi", "/images/vehicles/honda-shine-125.png",
                "India's highest-selling 125cc motorcycle known for its ultra-smooth 5-speed eSP engine and 65+ kmpl mileage.",
                "5-Speed Transmission, Silent ACG Starter, eSP Tech, DC Headlamp");

        upsertVehicle("Honda", "SP 125", "MH-06-SP-1252", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("90.00"), new BigDecimal("750.00"), new BigDecimal("1200.00"),
                "Hitec City, Hyderabad", "/images/vehicles/honda-sp-125.jpg",
                "Edgy and modern premium commuter featuring fully digital instrumentation, LED headlamp, and silent start ACG.",
                "Full Digital Meter with Gear Indicator, Sharp LED Headlamp, Split Alloy Wheels");

        upsertVehicle("Bajaj", "Pulsar 150", "MH-07-BP-1501", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("100.00"), new BigDecimal("850.00"), new BigDecimal("1500.00"),
                "Andheri West, Mumbai", "/images/vehicles/bajaj-pulsar-150.jpg",
                "The legendary street sports motorcycle with muscular tank shrouds, twin disc brakes, and punchy 14 PS power.",
                "Twin Spark DTS-i Engine, Front ABS, Aerodynamic Fairing Cowl, Clip-on Handlebars");

        upsertVehicle("Bajaj", "Pulsar NS200", "MH-07-BP-2002", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("130.00"), new BigDecimal("1100.00"), new BigDecimal("2000.00"),
                "Hitec City, Hyderabad", "/images/vehicles/bajaj-pulsar-ns200.jpg",
                "Aggressive naked streetfighter with liquid-cooled 4-valve triple spark engine, inverted USD forks, and perimeter frame.",
                "Liquid Cooled 24.5 PS, Upside Down Forks, Dual-Channel ABS, Nitrox Monoshock");

        upsertVehicle("TVS", "Apache RTR 160", "MH-08-AP-1601", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("110.00"), new BigDecimal("900.00"), new BigDecimal("1500.00"),
                "Indiranagar, Bengaluru", "/images/vehicles/tvs-apache-rtr-160.png",
                "Track-bred racing heritage bike with race-tuned fuel injection (RT-Fi), Glide Through Technology (GTT), and 3 ride modes.",
                "3 Ride Modes (Rain/Urban/Sport), SmartXonnect Bluetooth, Wave Disc Brakes");

        upsertVehicle("Yamaha", "FZ-S FI V4", "MH-08-YF-1502", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("110.00"), new BigDecimal("950.00"), new BigDecimal("1500.00"),
                "Koramangala, Bengaluru", "/images/vehicles/yamaha-fzs-fi.png",
                "Muscular street presence with Traction Control System (TCS), Bluetooth Y-Connect, and refined Blue Core engine.",
                "Traction Control System, LED Flashers, Class D Headlamp, Bluetooth Y-Connect");

        upsertVehicle("Hero", "Splendor Plus", "MH-09-HS-1001", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("60.00"), new BigDecimal("480.00"), new BigDecimal("1000.00"),
                "Vashi, Navi Mumbai", "/images/vehicles/hero-splendor-plus.png",
                "The undisputed mileage champion of India with revolutionary i3S technology and rock-solid reliability.",
                "i3S Idle Stop-Start System, APDV Engine, Integrated Braking System, Low Maintenance");

        upsertVehicle("Hero", "Xtreme 125R", "MH-09-HX-1252", "BIKE", "MOTORCYCLE", "Petrol", "Manual", 2,
                new BigDecimal("95.00"), new BigDecimal("780.00"), new BigDecimal("1200.00"),
                "Connaught Place, New Delhi", "/images/vehicles/hero-xtreme-125r.png",
                "Next-generation sporty 125cc motorcycle with full-LED lighting, sprint-EP engine, and single-channel ABS.",
                "Full LED Projector Headlamp, Single-Channel ABS, Sprint-EBT Engine, Sharp Tank Extension");

        // 13 Cars
        upsertVehicle("Maruti Suzuki", "Alto K10", "MH-10-AL-1001", "CAR", "HATCHBACK", "Petrol", "Manual", 4,
                new BigDecimal("110.00"), new BigDecimal("1200.00"), new BigDecimal("2000.00"),
                "Andheri West, Mumbai", "/images/vehicles/maruti-alto-k10.png",
                "Compact, peppy city hatchback that easily maneuvers tight parking spots while delivering superior fuel efficiency.",
                "Dual Airbags, ABS with EBD, SmartPlay Dock, High Fuel Efficiency");

        upsertVehicle("Maruti Suzuki", "Swift", "MH-10-SW-1202", "CAR", "HATCHBACK", "Petrol", "Manual", 5,
                new BigDecimal("140.00"), new BigDecimal("1500.00"), new BigDecimal("3000.00"),
                "Andheri West, Mumbai", "/images/vehicles/maruti-swift.png",
                "Fun-to-drive, sporty hatchback featuring peppy engine response, Apple CarPlay/Android Auto, and sleek aerodynamics.",
                "Touchscreen Infotainment, Keyless Entry, Push Button Start, Cruise Control");

        upsertVehicle("Maruti Suzuki", "Baleno", "MH-11-BL-1203", "CAR", "HATCHBACK", "Petrol", "Automatic", 5,
                new BigDecimal("160.00"), new BigDecimal("1700.00"), new BigDecimal("3000.00"),
                "Bandra Kurla Complex, Mumbai", "/images/vehicles/maruti-baleno.png",
                "Premium hatchback offering 9-inch SmartPlay Pro+ touchscreen, 360-view camera, heads-up display, and plush seating.",
                "Heads-Up Display, 360 Camera, 9-inch Touchscreen, 6 Airbags");

        upsertVehicle("Maruti Suzuki", "Dzire", "MH-11-DZ-1204", "CAR", "SEDAN", "Petrol", "Automatic", 5,
                new BigDecimal("165.00"), new BigDecimal("1750.00"), new BigDecimal("3000.00"),
                "Connaught Place, New Delhi", "/images/vehicles/maruti-dzire.png",
                "Elegant compact sedan with supreme rear-seat comfort, expansive 378L boot, and class-leading highway efficiency.",
                "Spacious Boot, Rear AC Vents, Cruise Control, Automatic Climate Control");

        upsertVehicle("Hyundai", "Grand i10 Nios", "MH-12-GN-1205", "CAR", "HATCHBACK", "Petrol", "Manual", 5,
                new BigDecimal("135.00"), new BigDecimal("1450.00"), new BigDecimal("3000.00"),
                "Vashi, Navi Mumbai", "/images/vehicles/hyundai-grand-i10-nios.png",
                "Urban hatchback with contemporary European styling, wireless charging pad, 6 airbags standard, and cruise control.",
                "6 Airbags Standard, Wireless Phone Charger, 8-inch Touchscreen, Type-C Fast Chargers");

        upsertVehicle("Hyundai", "i20", "MH-12-HI-1206", "CAR", "HATCHBACK", "Petrol", "Automatic", 5,
                new BigDecimal("160.00"), new BigDecimal("1700.00"), new BigDecimal("3000.00"),
                "Bandra Kurla Complex, Mumbai", "/images/vehicles/hyundai-i20.png",
                "Sleek, tech-loaded hatchback with Bose 7-speaker sound, electric sunroof, air purifier, and dual-tone interior.",
                "Bose 7-Speaker Audio, Electric Sunroof, Air Purifier with AQI Display, BlueLink Telematics");

        upsertVehicle("Tata", "Punch", "MH-13-TP-1207", "CAR", "SUV", "Petrol", "Manual", 5,
                new BigDecimal("150.00"), new BigDecimal("1600.00"), new BigDecimal("3000.00"),
                "Koramangala, Bengaluru", "/images/vehicles/tata-punch.png",
                "Sub-compact SUV with robust 5-star safety rating, 187mm ground clearance, and high command seating position.",
                "5-Star GNCAP Safety, 187mm Ground Clearance, Traction Modes, Harman Infotainment");

        upsertVehicle("Tata", "Nexon", "MH-13-TN-1508", "CAR", "SUV", "Diesel", "Manual", 5,
                new BigDecimal("210.00"), new BigDecimal("2200.00"), new BigDecimal("4000.00"),
                "Connaught Place, New Delhi", "/images/vehicles/tata-nexon.png",
                "India's highest safety rated compact SUV featuring futuristic bi-LED headlamps, ventilated front seats, and 360 camera.",
                "5-Star GNCAP, Ventilated Seats, 360 Camera, 10.25-inch Floating Display");

        upsertVehicle("Hyundai", "Creta", "MH-14-HC-1509", "CAR", "SUV", "Diesel", "Automatic", 5,
                new BigDecimal("260.00"), new BigDecimal("2800.00"), new BigDecimal("5000.00"),
                "Hitec City, Hyderabad", "/images/vehicles/hyundai-creta.png",
                "India's bestselling midsize SUV with panoramic sunroof, Level 2 ADAS driver assistance, and premium dual-zone climate.",
                "Panoramic Sunroof, Level 2 ADAS, Ventilated Front Seats, Bose Audio System");

        upsertVehicle("Kia", "Sonet", "MH-14-KS-1510", "CAR", "SUV", "Petrol", "Automatic", 5,
                new BigDecimal("190.00"), new BigDecimal("2000.00"), new BigDecimal("3500.00"),
                "Indiranagar, Bengaluru", "/images/vehicles/kia-sonet.png",
                "Aggressive tiger-nose compact SUV packed with dual 10.25-inch screens, ventilated seats, and paddle shifters.",
                "Dual 10.25-inch Screens, Paddle Shifters, Front Ventilated Seats, LED Sound Mood Lighting");

        upsertVehicle("Mahindra", "Thar 4x4", "MH-15-MT-2011", "CAR", "SUV", "Diesel", "Manual", 4,
                new BigDecimal("280.00"), new BigDecimal("3000.00"), new BigDecimal("5000.00"),
                "Koramangala, Bengaluru", "/images/vehicles/mahindra-thar.png",
                "Iconic all-terrain 4x4 beast with mechanical locking differential, removable hard top, and unparalleled road presence.",
                "Shift-on-the-fly 4x4, Mechanical Locking Differential, Roll Cage, Water-resistant IP54 Interior");

        upsertVehicle("Maruti Suzuki", "Ertiga", "MH-15-ME-1512", "CAR", "MUV", "CNG", "Manual", 7,
                new BigDecimal("220.00"), new BigDecimal("2400.00"), new BigDecimal("4000.00"),
                "Vashi, Navi Mumbai", "/images/vehicles/maruti-ertiga.png",
                "Versatile 7-seater family MPV equipped with factory-fitted S-CNG, roof-mounted AC vents, and flexible sliding row seats.",
                "7-Passenger Seating, Roof Mounted Dual AC, SmartPlay Audio, Flexible Luggage Space");

        upsertVehicle("Toyota", "Innova Crysta", "MH-16-TI-2413", "CAR", "MUV", "Diesel", "Automatic", 7,
                new BigDecimal("340.00"), new BigDecimal("3600.00"), new BigDecimal("6000.00"),
                "Andheri West, Mumbai", "/images/vehicles/toyota-innova-crysta.png",
                "The ultimate king of long-distance touring with captain chairs, 7 airbags, supreme cabin comfort, and legendary reliability.",
                "Captain Seats, 7 Airbags, Cruise Control, Dual Climate Zone, Bulletproof Reliability");

        logger.info("Sync completed: Fleet has all 33 genuine vehicles configured.");
    }

    private void upsertVehicle(String brand, String model, String reg, String category, String subCat,
                              String fuel, String trans, int seats, BigDecimal hourly, BigDecimal daily,
                              BigDecimal deposit, String location, String img, String desc, String features) {
        Vehicle v = vehicleRepository.findByRegistrationNumber(reg).orElseGet(Vehicle::new);
        v.setBrand(brand);
        v.setModel(model);
        v.setRegistrationNumber(reg);
        v.setCategory(category);
        v.setSubCategory(subCat);
        v.setFuelType(fuel);
        v.setTransmission(trans);
        v.setSeatingCapacity(seats);
        v.setPricePerHour(hourly);
        v.setPricePerDay(daily);
        v.setSecurityDeposit(deposit);
        v.setLocation(location);
        v.setImageUrl(img);
        if (v.getVehicleStatus() == null) {
            v.setVehicleStatus("AVAILABLE");
        }
        v.setDescription(desc);
        v.setFeatures(features);
        vehicleRepository.save(v);
    }
}
