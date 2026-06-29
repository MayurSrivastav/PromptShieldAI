package com.promptshield.service;

import com.promptshield.model.Rule;
import com.promptshield.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class RuleEngineService {

    @Autowired
    private RuleRepository ruleRepository;

    private static final Map<Character, Character> NORMALIZE_MAP = new HashMap<>();
    static {
        NORMALIZE_MAP.put('0', 'o');
        NORMALIZE_MAP.put('1', 'i');
        NORMALIZE_MAP.put('3', 'e');
        NORMALIZE_MAP.put('4', 'a');
        NORMALIZE_MAP.put('5', 's');
        NORMALIZE_MAP.put('7', 't');
        NORMALIZE_MAP.put('8', 'b');
        NORMALIZE_MAP.put('@', 'a');
        NORMALIZE_MAP.put('$', 's');
    }

    public String checkPrompt(String prompt) {
        String normalized = normalize(prompt);

        List<Rule> activeRules = ruleRepository.findByIsActiveTrue();

        for (Rule rule : activeRules) {
            String normalizedKeyword = normalize(rule.getKeyword());

            if (normalized.contains(normalizedKeyword)) {
                return "BLOCKED - Contains banned keyword: "
                    + rule.getKeyword()
                    + " [" + rule.getCategory() + " - " + rule.getSeverity() + "]";
            }
        }

        return "ALLOWED";
    }

    private String normalize(String input) {
        if (input == null) return "";

        String lower = input.toLowerCase();

        StringBuilder substituted = new StringBuilder();
        for (char c : lower.toCharArray()) {
            substituted.append(NORMALIZE_MAP.getOrDefault(c, c));
        }

        String noSeparators = substituted.toString()
            .replaceAll("[\\s._\\-*]+", "");

        StringBuilder collapsed = new StringBuilder();
        char last = '\0';
        int repeatCount = 0;
        for (char c : noSeparators.toCharArray()) {
            if (c == last) {
                repeatCount++;
                if (repeatCount >= 2) continue;
            } else {
                repeatCount = 0;
            }
            collapsed.append(c);
            last = c;
        }

        return collapsed.toString();
    }
}