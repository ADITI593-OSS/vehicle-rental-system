package com.driveease.vehiclerental.service;

import com.driveease.vehiclerental.dto.RegisterRequest;
import com.driveease.vehiclerental.dto.UserDto;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.exception.BadRequestException;
import com.driveease.vehiclerental.exception.ResourceNotFoundException;
import com.driveease.vehiclerental.repository.BookingRepository;
import com.driveease.vehiclerental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        if (!email.matches("^[a-zA-Z0-9._%+-]+@gmail\\.com$")) {
            throw new BadRequestException("Only valid Gmail accounts (@gmail.com) are allowed to register.");
        }
        if (email.contains("demo") || email.contains("test") || email.contains("fake") || email.contains("dummy") || email.contains("temp")) {
            throw new BadRequestException("Demo and test accounts are not permitted to register. Please use your authentic personal Gmail account.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered. Please login or use a different email.");
        }

        User user = new User(
                request.getFullName().trim(),
                request.getEmail().toLowerCase().trim(),
                request.getMobileNumber().trim(),
                passwordEncoder.encode(request.getPassword()),
                "ROLE_CUSTOMER"
        );

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setRole(user.getRole());
        dto.setAccountStatus(user.getAccountStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setTotalBookings(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId()).size());
        return dto;
    }

    public List<UserDto> getAllCustomers(String query) {
        List<User> users;
        if (query != null && !query.trim().isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                    .stream()
                    .filter(u -> "ROLE_CUSTOMER".equalsIgnoreCase(u.getRole()))
                    .collect(Collectors.toList());
        } else {
            users = userRepository.findByRole("ROLE_CUSTOMER");
        }
        return users.stream().map(this::mapToUserDto).collect(Collectors.toList());
    }

    @Transactional
    public UserDto toggleCustomerStatus(Long id) {
        User user = getUserById(id);
        if ("ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            user.setAccountStatus("SUSPENDED");
        } else {
            user.setAccountStatus("ACTIVE");
        }
        User updated = userRepository.save(user);
        return mapToUserDto(updated);
    }

    @Transactional
    public UserDto updateProfile(Long userId, String fullName, String mobileNumber) {
        User user = getUserById(userId);
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            user.setMobileNumber(mobileNumber.trim());
        }
        return mapToUserDto(userRepository.save(user));
    }
}
