package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.UserDto;
import com.driveease.vehiclerental.entity.User;
import com.driveease.vehiclerental.security.UserDetailsImpl;
import com.driveease.vehiclerental.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(userService.mapToUserDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        String fullName = body.get("fullName");
        String mobileNumber = body.get("mobileNumber");
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), fullName, mobileNumber));
    }
}
