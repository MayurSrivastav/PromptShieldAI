package com.promptshield.dto;

import java.time.LocalDateTime;

public class ScanResponse {

    private Long id;
    private String prompt;
    private Double toxicityScore;
    private String action;
    private String reason;
    private LocalDateTime createdAt;
    private String status;
    private String message;

    public static ScanResponse success(Long id, String prompt,
            Double score, String action, String reason,
            LocalDateTime createdAt) {
        ScanResponse response = new ScanResponse();
        response.id = id;
        response.prompt = prompt;
        response.toxicityScore = score;
        response.action = action;
        response.reason = reason;
        response.createdAt = createdAt;
        response.status = "SUCCESS";
        response.message = action.equals("BLOCKED") ?
            "Prompt was blocked!" : "Prompt is clean!";
        return response;
    }

    public static ScanResponse error(String message) {
        ScanResponse response = new ScanResponse();
        response.status = "ERROR";
        response.message = message;
        return response;
    }

    public Long getId() { return id; }
    public String getPrompt() { return prompt; }
    public Double getToxicityScore() { return toxicityScore; }
    public String getAction() { return action; }
    public String getReason() { return reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
    public String getMessage() { return message; }
}