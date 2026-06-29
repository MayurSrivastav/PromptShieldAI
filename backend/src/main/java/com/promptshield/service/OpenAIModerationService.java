package com.promptshield.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.List;

@Service
public class OpenAIModerationService {

    @Value("${promptshield.openrouter-api-key}")
    private String apiKey;

    private static final String API_URL =
        "https://openrouter.ai/api/v1/chat/completions";

    private static final String MODEL =
    "openai/gpt-oss-120b:free";

    @Autowired
    private RestTemplate restTemplate;

    public double getToxicityScore(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "https://promptshield.ai");
        headers.set("X-Title", "PromptShield AI");
        headers.setContentType(MediaType.APPLICATION_JSON);

        String userMessage =
            "Rate the toxicity of this text from 0.0 to 1.0. " +
            "Reply with ONLY a number like 0.95 or 0.02. Nothing else.\n\n" +
            "Text: " + escapeJson(prompt);

        String requestBody = "{"
            + "\"model\": \"" + MODEL + "\","
            + "\"messages\": ["
            + "  {\"role\": \"user\", \"content\": \"" + userMessage + "\"}"
            + "],"
            + "\"max_tokens\": 10,"
            + "\"temperature\": 0.0"
            + "}";

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                API_URL,
                HttpMethod.POST,
                request,
                Map.class
            );

            Map body = response.getBody();
            List<Map> choices = (List<Map>) body.get("choices");

            if (choices == null || choices.isEmpty()) return 0.0;

            Map message = (Map) choices.get(0).get("message");
            if (message == null) return 0.0;

            String content = (String) message.get("content");
            System.out.println("AI raw response: " + content);

            if (content == null || content.trim().isEmpty()) return 0.0;

            // Extract first number found in response
            String[] tokens = content.trim().split("[^0-9.]+");
            for (String token : tokens) {
                if (!token.isEmpty()) {
                    try {
                        double score = Double.parseDouble(token);
                        if (score >= 0.0 && score <= 1.0) {
                            System.out.println("Toxicity score: " + score);
                            return score;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }

        } catch (Exception e) {
            System.out.println("OpenRouter API error: " + e.getMessage());
        }

        return 0.0;
    }

    private String escapeJson(String text) {
        return text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}