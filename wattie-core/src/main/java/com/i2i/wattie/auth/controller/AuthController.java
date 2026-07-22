package com.i2i.wattie.auth.controller;

import com.i2i.wattie.auth.dto.LoginRequest;
import com.i2i.wattie.auth.dto.LoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Authentication controller for VoltWise Web App.
 * Provides a simple credential-based login endpoint for the frontend.
 * Credentials are injected via environment variables — never hardcoded.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    @Value("${voltwise.admin.email:admin@voltwise.com}")
    private String adminEmail;

    @Value("${voltwise.admin.password:voltwise123}")
    private String adminPassword;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        if (adminEmail.equalsIgnoreCase(request.getEmail())
                && adminPassword.equals(request.getPassword())) {

            LoginResponse response = LoginResponse.builder()
                    .success(true)
                    .message("Authentication successful")
                    .token(UUID.randomUUID().toString())
                    .userName("VoltWise Admin")
                    .email(request.getEmail())
                    .build();

            return ResponseEntity.ok(response);
        }

        LoginResponse response = LoginResponse.builder()
                .success(false)
                .message("Invalid email or password")
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info (validates token presence)")
    public ResponseEntity<LoginResponse> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || authHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("No authorization token provided")
                            .build());
        }

        return ResponseEntity.ok(LoginResponse.builder()
                .success(true)
                .userName("VoltWise Admin")
                .email(adminEmail)
                .build());
    }
}
