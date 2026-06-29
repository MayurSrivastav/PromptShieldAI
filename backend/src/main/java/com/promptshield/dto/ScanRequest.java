package com.promptshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ScanRequest {

    @NotBlank(message = "Prompt cannot be empty")
    @Size(min = 1, max = 5000, message = "Prompt must be between 1 and 5000 characters")
    private String prompt;

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
}