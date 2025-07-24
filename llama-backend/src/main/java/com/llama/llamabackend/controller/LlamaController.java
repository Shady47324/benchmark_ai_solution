package com.llama.llamabackend.controller;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.Patch;
import com.llama.llamabackend.dto.PromptRequest;
import com.llama.llamabackend.dto.LlamaResponseDTO;
import com.llama.llamabackend.model.PromptHistory;
import com.llama.llamabackend.repository.PromptHistoryRepository;
import com.llama.llamabackend.service.LlamaService;
import com.llama.llamabackend.utils.CodeDiffUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

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

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/history")
    public ResponseEntity<List<PromptHistory>> getHistory() {
        return ResponseEntity.ok(promptHistoryRepository.findAll());
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deletePrompt(@PathVariable Long id) {
        if (promptHistoryRepository.existsById(id)) {
            promptHistoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping("/llama")
    public ResponseEntity<LlamaResponseDTO> generateWithLlama(@RequestBody PromptRequest promptRequest) {
        String prompt = promptRequest.getPrompt();
        String pythonApiUrl = "http://localhost:8000/api/generate";

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            long startTime = System.currentTimeMillis();

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonApiUrl,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            long responseTime = System.currentTimeMillis() - startTime;

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

            String output = (String) responseBody.getOrDefault("output", "");
            String language = (String) responseBody.getOrDefault("language", "inconnue");
            String errors = (String) responseBody.getOrDefault("errors", "");
            String corrections = (String) responseBody.getOrDefault("corrections", "");

            Object inputTokensObj = responseBody.get("input_tokens");
            int inputTokens = inputTokensObj instanceof Number ? ((Number) inputTokensObj).intValue() : 0;

            Object outputTokensObj = responseBody.get("output_tokens");
            int outputTokens = outputTokensObj instanceof Number ? ((Number) outputTokensObj).intValue() : 0;

            List<String> originalLines = Arrays.asList(prompt.split("\n"));
            List<String> correctedLines = Arrays.asList(output.split("\n"));

            Patch<String> patch = DiffUtils.diff(originalLines, correctedLines);

            List<Integer> originalHighlightLines = CodeDiffUtil.getHighlightLines(patch, true);
            List<Integer> correctedHighlightLines = CodeDiffUtil.getHighlightLines(patch, false);

            LlamaResponseDTO result = new LlamaResponseDTO();
            result.setOutput(output);
            result.setLanguage(language);
            result.setErrors(Collections.singletonList(errors));
            result.setCorrections(Collections.singletonList(corrections));
            result.setOriginalCode(prompt);
            result.setCorrectedCode(output);
            result.setOriginalHighlightLines(originalHighlightLines);
            result.setCorrectedHighlightLines(correctedHighlightLines);
            result.setInputTokens(inputTokens);
            result.setOutputTokens(outputTokens);
            result.setResponseTimeMs(responseTime);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            LlamaResponseDTO errorResponse = new LlamaResponseDTO();
            errorResponse.setOutput("Erreur : " + e.getMessage());
            errorResponse.setLanguage("N/A");
            errorResponse.setErrors(Collections.singletonList("Exception côté serveur"));
            errorResponse.setCorrections(Collections.singletonList(""));

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}
