package com.promptshield.controller;

import com.promptshield.repository.ScanLogRepository;
import com.promptshield.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private ScanLogRepository scanLogRepository;

    @Autowired
    private RuleRepository ruleRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {

        Map<String, Object> stats = new HashMap<>();

        // Total scans
        long totalScans = scanLogRepository.count();

        // Blocked scans
        long blockedScans = scanLogRepository
            .countByAction("BLOCKED");

        // Allowed scans
        long allowedScans = scanLogRepository
            .countByAction("ALLOWED");

        // Total active rules
        long activeRules = ruleRepository
            .countByIsActiveTrue();

        // Block rate percentage
        double blockRate = totalScans > 0 ?
            (double) blockedScans / totalScans * 100 : 0;

        stats.put("totalScans", totalScans);
        stats.put("blockedScans", blockedScans);
        stats.put("allowedScans", allowedScans);
        stats.put("activeRules", activeRules);
        stats.put("blockRate", Math.round(blockRate));

        return ResponseEntity.ok(stats);
    }
}