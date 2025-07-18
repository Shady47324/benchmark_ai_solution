package com.llama.llamabackend.controller;

import com.llama.llamabackend.model.PromptHistory;
import com.llama.llamabackend.dto.PromptRequest;
import com.llama.llamabackend.model.PromptResponse;
import com.llama.llamabackend.repository.PromptHistoryRepository;
import com.llama.llamabackend.service.LlamaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class LlamaController {

    private final LlamaService llamaService;
    private final PromptHistoryRepository promptHistoryRepository;

    @Autowired
    public LlamaController(LlamaService llamaService, PromptHistoryRepository promptHistoryRepository) {
        this.llamaService = llamaService;
        this.promptHistoryRepository = promptHistoryRepository;
    }

    // Endpoint GET /api/history
    @GetMapping("/history")
    public ResponseEntity<List<PromptHistory>> getHistory() {
        return ResponseEntity.ok(promptHistoryRepository.findAll());
    }
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/llama")
    public ResponseEntity<String> generateWithLlama(@RequestBody PromptRequest promptRequest) {
        String prompt = promptRequest.getPrompt();
        String pythonApiUrl = "http://localhost:8000/api/generate";

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            long startTime = System.currentTimeMillis();

            // Appel API Python
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonApiUrl, entity, Map.class);

            long responseTime = System.currentTimeMillis() - startTime;

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Réponse vide du serveur Python");
            }

            String output = (String) responseBody.get("output");
            int inputTokens = (int) responseBody.getOrDefault("input_tokens", 0);
            int outputTokens = (int) responseBody.getOrDefault("output_tokens", 0);

            // 🔽 Sauvegarde dans la base de données
            PromptHistory history = new PromptHistory();
            history.setPrompt(prompt);
            history.setOutput(output);
            history.setInputTokens(inputTokens);
            history.setOutputTokens(outputTokens);
            history.setResponseTimeMs((double) responseTime);
            history.setTimestamp(LocalDateTime.now());

            promptHistoryRepository.save(history);

            return ResponseEntity.ok(output);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

}
