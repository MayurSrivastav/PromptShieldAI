package com.promptshield.controller;

import com.promptshield.dto.ScanRequest;
import com.promptshield.dto.ScanResponse;
import com.promptshield.model.ScanLog;
import com.promptshield.repository.ScanLogRepository;
import com.promptshield.service.RuleEngineService;
import com.promptshield.service.OpenAIModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FirewallController {

    @Autowired
    private RuleEngineService ruleEngineService;

    @Autowired
    private OpenAIModerationService openAIModerationService;

    @Autowired
    private ScanLogRepository scanLogRepository;

    @Value("${promptshield.toxicity-threshold}")
    private double toxicityThreshold;

    @PostMapping("/scan")
    public ResponseEntity<ScanResponse> scanPrompt(
            @Valid @RequestBody ScanRequest request) {

        try {
            String prompt = request.getPrompt();
            ScanLog log = new ScanLog();
            log.setPrompt(prompt);

            // Step 1: Check Rule Engine first
            String ruleResult = ruleEngineService.checkPrompt(prompt);

            if (ruleResult.startsWith("BLOCKED")) {
                log.setAction("BLOCKED");
                log.setReason(ruleResult);
                log.setToxicityScore(1.0);
            } else {
                // Step 2: Check OpenAI Moderation
                double score = openAIModerationService.getToxicityScore(prompt);
                log.setToxicityScore(score);

                if (score > toxicityThreshold) {
                    log.setAction("BLOCKED");
                    log.setReason("AI detected toxic content");
                } else {
                    log.setAction("ALLOWED");
                    log.setReason("Prompt is clean");
                }
            }

            // Step 3: Save to database
            scanLogRepository.save(log);

            // Step 4: Return clean response
            return ResponseEntity.ok(ScanResponse.success(
                log.getId(),
                log.getPrompt(),
                log.getToxicityScore(),
                log.getAction(),
                log.getReason(),
                log.getCreatedAt()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ScanResponse.error(
                    "Something went wrong: " + e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ScanLog>> getLogs() {
        return ResponseEntity.ok(
            scanLogRepository.findAllByOrderByCreatedAtDesc());
    }
}