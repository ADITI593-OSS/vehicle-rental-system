package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.*;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.security.JwtUtils;
import com.driveease.vehiclerental.security.UserDetailsImpl;
import com.driveease.vehiclerental.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String GMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@gmail\\.com$";

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    private boolean isDemoOrTestEmail(String email) {
        if (email == null) return false;
        String lower = email.toLowerCase().trim();
        return lower.contains("demo") || lower.contains("test") || lower.contains("fake") || lower.contains("dummy") || lower.contains("temp");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        String email = loginRequest.getEmail().toLowerCase().trim();

        if (!email.matches(GMAIL_REGEX)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only valid Gmail accounts (@gmail.com) are allowed to login."));
        }

        if (isDemoOrTestEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Demo and test accounts are not permitted to log in. Please use your valid personal Gmail account."));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(userPrincipal.getId());

        AuthResponse res = new AuthResponse(
                jwt,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getRole()
        );

        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().toLowerCase().trim();

        if (!email.matches(GMAIL_REGEX)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only valid Gmail accounts (@gmail.com) are allowed to register."));
        }

        if (isDemoOrTestEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Demo and test accounts are not permitted to register. Please use your valid personal Gmail account."));
        }

        userService.registerUser(registerRequest);

        return new ResponseEntity<>(Map.of(
                "success", true,
                "message", "Account registered successfully! Please sign in with your Gmail and password to access your account."
        ), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(userPrincipal.getId());
        UserDto dto = userService.mapToUserDto(user);
        return ResponseEntity.ok(dto);
    }
}
