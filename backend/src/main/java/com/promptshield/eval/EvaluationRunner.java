package com.promptshield.eval;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.Map;

/**
 * Standalone evaluation script.
 * Run with: java -cp target/classes com.promptshield.eval.EvaluationRunner
 * (Make sure the Spring Boot app is running on localhost:8080 first!)
 */
public class EvaluationRunner {

    private static final String SCAN_URL = "http://localhost:8080/api/scan";

    public static void main(String[] args) throws Exception {

        List<String[]> rows = loadDataset("src/main/resources/eval-dataset.csv");

        RestTemplate restTemplate = new RestTemplate();

        int truePositive = 0;
        int trueNegative = 0;
        int falsePositive = 0;
        int falseNegative = 0;

        List<String> falsePositiveExamples = new ArrayList<>();
        List<String> falseNegativeExamples = new ArrayList<>();

        System.out.println("Running evaluation on " + rows.size() + " examples...\n");

        for (String[] row : rows) {
            String prompt = row[0];
            boolean expectedToxic = row[1].equals("1");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String body = "{\"prompt\": \"" + prompt.replace("\"", "\\\"") + "\"}";
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(SCAN_URL, request, Map.class);
                String action = (String) response.getBody().get("action");
                boolean predictedToxic = "BLOCKED".equals(action);

                if (expectedToxic && predictedToxic) {
                    truePositive++;
                } else if (!expectedToxic && !predictedToxic) {
                    trueNegative++;
                } else if (!expectedToxic && predictedToxic) {
                    falsePositive++;
                    falsePositiveExamples.add(prompt);
                } else {
                    falseNegative++;
                    falseNegativeExamples.add(prompt);
                }

                System.out.printf("%-60s expected=%-6s actual=%-8s %s%n",
                    truncate(prompt, 58),
                    expectedToxic ? "TOXIC" : "CLEAN",
                    action,
                    (expectedToxic == predictedToxic) ? "OK" : "MISMATCH");

            } catch (Exception e) {
                System.out.println("ERROR scanning: " + prompt + " -> " + e.getMessage());
            }
        }

        double precision = truePositive + falsePositive == 0 ? 0 :
            (double) truePositive / (truePositive + falsePositive);
        double recall = truePositive + falseNegative == 0 ? 0 :
            (double) truePositive / (truePositive + falseNegative);
        double f1 = (precision + recall) == 0 ? 0 :
            2 * (precision * recall) / (precision + recall);
        double accuracy = (double) (truePositive + trueNegative) / rows.size();
        double falsePositiveRate = falsePositive + trueNegative == 0 ? 0 :
            (double) falsePositive / (falsePositive + trueNegative);

        System.out.println("\n========== EVALUATION RESULTS ==========");
        System.out.println("Total examples:      " + rows.size());
        System.out.println("True Positives:      " + truePositive + "  (toxic, correctly blocked)");
        System.out.println("True Negatives:       " + trueNegative + "  (clean, correctly allowed)");
        System.out.println("False Positives:    " + falsePositive + "  (clean, wrongly blocked)");
        System.out.println("False Negatives:    " + falseNegative + "  (toxic, wrongly allowed)");
        System.out.println("-----------------------------------------");
        System.out.printf("Accuracy:            %.1f%%%n", accuracy * 100);
        System.out.printf("Precision:           %.1f%%%n", precision * 100);
        System.out.printf("Recall:              %.1f%%%n", recall * 100);
        System.out.printf("F1 Score:            %.1f%%%n", f1 * 100);
        System.out.printf("False Positive Rate: %.1f%%%n", falsePositiveRate * 100);
        System.out.println("=========================================\n");

        if (!falsePositiveExamples.isEmpty()) {
            System.out.println("False Positives (clean prompts wrongly blocked):");
            falsePositiveExamples.forEach(p -> System.out.println("  - " + p));
        }
        if (!falseNegativeExamples.isEmpty()) {
            System.out.println("\nFalse Negatives (toxic prompts that slipped through):");
            falseNegativeExamples.forEach(p -> System.out.println("  - " + p));
        }
    }

    private static List<String[]> loadDataset(String path) throws IOException {
        List<String[]> rows = new ArrayList<>();
        List<String> lines = Files.readAllLines(Paths.get(path));
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i);

            if (line == null || line.trim().isEmpty()) {
                continue;
            }

            int lastComma = line.lastIndexOf(',');
            if (lastComma == -1) {
                System.out.println("Skipping malformed line " + (i + 1) + ": " + line);
                continue;
            }

            String prompt = line.substring(0, lastComma).trim();
            String label = line.substring(lastComma + 1).trim();

            if (prompt.isEmpty() || (!label.equals("0") && !label.equals("1"))) {
                System.out.println("Skipping invalid row " + (i + 1) + ": " + line);
                continue;
            }

            rows.add(new String[]{prompt, label});
        }
        return rows;
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max - 3) + "...";
    }
}