package com.promptshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    @NotBlank(message = "Password cannot be empty")
@Size(min = 4, max = 10, message = "Password must be between 4 and 10 characters")
private String password;

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}