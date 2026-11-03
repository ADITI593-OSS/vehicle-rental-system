package com.driveease.vehiclerental.controller;

import com.driveease.vehiclerental.dto.ReturnResponse;
import com.driveease.vehiclerental.service.ReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    @Autowired
    private ReturnService returnService;

    @GetMapping("/{bookingId}")
    public ResponseEntity<ReturnResponse> getReturnByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(returnService.getReturnByBookingId(bookingId));
    }
}
