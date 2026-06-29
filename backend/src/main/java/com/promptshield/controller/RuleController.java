package com.promptshield.controller;

import com.promptshield.dto.RuleRequest;
import com.promptshield.model.Rule;
import com.promptshield.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin(origins = "*")
public class RuleController {

    @Autowired
    private RuleRepository ruleRepository;

    @Value("${promptshield.admin-password}")
    private String adminPassword;

    // GET all rules — read-only, no password needed
    @GetMapping
    public ResponseEntity<List<Rule>> getAllRules() {
        return ResponseEntity.ok(ruleRepository.findAll());
    }

    // POST add new rule — requires admin password header
    @PostMapping
    public ResponseEntity<?> addRule(
            @Valid @RequestBody RuleRequest request,
            @RequestHeader(value = "X-Admin-Password", required = false) String providedPassword) {

        if (!isAuthorized(providedPassword)) {
            return unauthorizedResponse();
        }

        Rule rule = new Rule();
        rule.setKeyword(request.getKeyword().toLowerCase());
        rule.setCategory(request.getCategory().toUpperCase());
        rule.setSeverity(request.getSeverity().toUpperCase());
        rule.setIsActive(true);
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    // DELETE rule — requires admin password header
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Password", required = false) String providedPassword) {

        if (!isAuthorized(providedPassword)) {
            return unauthorizedResponse();
        }

        Map<String, String> response = new HashMap<>();
        if (!ruleRepository.existsById(id)) {
            response.put("message", "Rule not found");
            return ResponseEntity.notFound().build();
        }
        ruleRepository.deleteById(id);
        response.put("message", "Rule deleted successfully");
        return ResponseEntity.ok(response);
    }

    // PUT toggle rule — requires admin password header
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleRule(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Password", required = false) String providedPassword) {

        if (!isAuthorized(providedPassword)) {
            return unauthorizedResponse();
        }

        return ruleRepository.findById(id)
            .map(rule -> {
                rule.setIsActive(!rule.getIsActive());
                return ResponseEntity.ok(ruleRepository.save(rule));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private boolean isAuthorized(String providedPassword) {
        return providedPassword != null && adminPassword.equals(providedPassword);
    }

    private ResponseEntity<Map<String, String>> unauthorizedResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Unauthorized: admin password required");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}