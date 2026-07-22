package com.i2i.wattie.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiClientService {

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestClient restClient;

    public GeminiClientService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    public String getRecommendation(String eventType, String details) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Falling back to default static recommendation.");
            return getFallbackRecommendation(eventType);
        }

        try {
            String prompt = String.format(
                    "Sen bir ev enerji tüketimi asistanısın. Aşağıdaki durum için ev sahibine kısa (2-3 cümle), " +
                    "samimi ve pratik bir Türkçe tavsiye metni yaz. Teknik jargon kullanma.%n%n" +
                    "Durum türü: %s%n" +
                    "Detay: %s",
                    eventType, details
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            Map<?, ?> response = restClient.post()
                    .uri(GEMINI_URL + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            String text = extractTextFromResponse(response);
            if (text != null && !text.isBlank()) {
                return text.trim();
            }
        } catch (Exception e) {
            log.error("Failed to fetch recommendation from Gemini API for eventType {}: {}. Using fallback.",
                    eventType, e.getMessage());
        }

        return getFallbackRecommendation(eventType);
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<?, ?> response) {
        if (response == null) return null;
        try {
            List<Map<?, ?>> candidates = (List<Map<?, ?>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<?, ?> candidate = candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                if (content != null) {
                    List<Map<?, ?>> parts = (List<Map<?, ?>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Gemini API response structure: {}", e.getMessage());
        }
        return null;
    }

    private String getFallbackRecommendation(String eventType) {
        return switch (eventType) {
            case "QUOTA_80" ->
                    "Aylık enerji kotanızın %80'ine ulaştınız. Tüketiminizi kontrol etmenizi öneririz.";
            case "QUOTA_100" ->
                    "Aylık enerji kotanız doldu. Cihaz kullanımınızı gözden geçirin.";
            case "PENALTY_ACTIVATED" ->
                    "Kotanız aşıldığı için ceza tarifesi devreye girdi. Tüketiminizi azaltmanız faturanızı düşürecektir.";
            case "ANOMALY_DETECTED" ->
                    "Bir cihazınızda beklenmedik güç tüketimi tespit edildi. Cihazı kontrol etmenizi öneririz.";
            default ->
                    "Enerji tüketiminizde dikkat edilmesi gereken bir durum tespit edildi. Cihaz kullanımınızı gözden geçirmenizi öneririz.";
        };
    }
}
