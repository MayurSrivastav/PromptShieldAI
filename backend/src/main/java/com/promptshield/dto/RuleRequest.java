package com.promptshield.dto;

import jakarta.validation.constraints.NotBlank;

public class RuleRequest {

    @NotBlank(message = "Keyword cannot be empty")
    private String keyword;

    @NotBlank(message = "Category cannot be empty")
    private String category;

    @NotBlank(message = "Severity cannot be empty")
    private String severity;

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}