package com.promptshield.controller;

import com.promptshield.dto.AuthRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${promptshield.admin-password}")
    private String adminPassword;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyAdmin(@Valid @RequestBody AuthRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (adminPassword.equals(request.getPassword())) {
            response.put("success", true);
            response.put("message", "Access granted");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Incorrect password");
            return ResponseEntity.status(401).body(response);
        }
    }
}