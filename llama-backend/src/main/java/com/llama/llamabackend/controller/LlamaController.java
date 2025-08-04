package com.llama.llamabackend.controller;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.Patch;
import com.llama.llamabackend.dto.PromptRequest;
import com.llama.llamabackend.dto.LlamaResponseDTO;
import com.llama.llamabackend.model.Chat;
import com.llama.llamabackend.model.Message;
import com.llama.llamabackend.model.PromptHistory;
import com.llama.llamabackend.repository.ChatRepository;
import com.llama.llamabackend.repository.MessageRepository;
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
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    @Autowired
    public LlamaController(LlamaService llamaService, PromptHistoryRepository promptHistoryRepository, 
                         ChatRepository chatRepository, MessageRepository messageRepository) {
        this.llamaService = llamaService;
        this.promptHistoryRepository = promptHistoryRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
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


    @PostMapping("/prompts")
    public ResponseEntity<LlamaResponseDTO> generateWithLlama(@RequestBody PromptRequest promptRequest) {
        String prompt = promptRequest.getPrompt();
        String code = promptRequest.getCode();
        Long chatId = promptRequest.getChatId();
        String pythonApiUrl = "http://localhost:8000/analyze";

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);
        requestBody.put("code", code);
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

            String correctedCode = (String) responseBody.getOrDefault("corrected_code", "");
            String language = (String) responseBody.getOrDefault("language", "inconnue");
            List<String> errors = (List<String>) responseBody.getOrDefault("errors", new ArrayList<>());
            List<String> corrections = (List<String>) responseBody.getOrDefault("corrections", new ArrayList<>());

            Object inputTokensObj = responseBody.get("input_tokens");
            int inputTokens = inputTokensObj instanceof Number ? ((Number) inputTokensObj).intValue() : 0;

            Object outputTokensObj = responseBody.get("output_tokens");
            int outputTokens = outputTokensObj instanceof Number ? ((Number) outputTokensObj).intValue() : 0;

            // Utiliser les lignes de surlignage directement de FastAPI
            List<Integer> originalHighlightLines = new ArrayList<>();
            List<Integer> correctedHighlightLines = new ArrayList<>();
            
            // Préparer les lignes pour l'historique
            List<String> originalLines = Arrays.asList(code.split("\n"));
            List<String> correctedLines = Arrays.asList(correctedCode.split("\n"));
            
            try {
                Object originalHighlightObj = responseBody.get("original_highlight_lines");
                Object correctedHighlightObj = responseBody.get("corrected_highlight_lines");
                
                System.out.println("FastAPI response - original_highlight_lines: " + originalHighlightObj);
                System.out.println("FastAPI response - corrected_highlight_lines: " + correctedHighlightObj);
                
                if (originalHighlightObj instanceof List) {
                    originalHighlightLines = (List<Integer>) originalHighlightObj;
                }
                if (correctedHighlightObj instanceof List) {
                    correctedHighlightLines = (List<Integer>) correctedHighlightObj;
                }
                
                System.out.println("Parsed originalHighlightLines: " + originalHighlightLines);
                System.out.println("Parsed correctedHighlightLines: " + correctedHighlightLines);
                
            } catch (Exception e) {
                System.out.println("Error parsing highlight lines from FastAPI: " + e.getMessage());
                // Fallback: utiliser le diff local si les données de FastAPI ne sont pas disponibles
                Patch<String> patch = DiffUtils.diff(originalLines, correctedLines);
                originalHighlightLines = CodeDiffUtil.getHighlightLines(patch, true);
                correctedHighlightLines = CodeDiffUtil.getHighlightLines(patch, false);
                
                System.out.println("Fallback - originalHighlightLines: " + originalHighlightLines);
                System.out.println("Fallback - correctedHighlightLines: " + correctedHighlightLines);
            }

            // Sauvegarder dans l'historique des prompts (pour compatibilité)
            PromptHistory history = new PromptHistory();
            history.setPrompt(prompt);
            history.setOutput(correctedCode);
            history.setInputTokens(inputTokens);
            history.setOutputTokens(outputTokens);
            history.setResponseTimeMs(responseTime);
            history.setTimestamp(LocalDateTime.now());
            history.setOriginalWithHighlights(String.join("\n", originalLines));
            history.setCorrectedWithHighlights(String.join("\n", correctedLines));
            promptHistoryRepository.save(history);

            // Sauvegarder le message dans le chat
            if (chatId != null) {
                Chat chat = chatRepository.findById(chatId).orElse(null);
                if (chat != null) {
                    Message message = new Message();
                    message.setChat(chat);
                    message.setPrompt(prompt);
                    message.setOutput(correctedCode);
                    message.setOriginalCode(code);
                    message.setCorrectedCode(correctedCode);
                    message.setOriginalHighlightLines(originalHighlightLines);
                    message.setCorrectedHighlightLines(correctedHighlightLines);
                    message.setLanguage(language);
                    message.setErrors(errors);
                    message.setCorrections(corrections);
                    message.setInputTokens(inputTokens);
                    message.setOutputTokens(outputTokens);
                    message.setResponseTimeMs(responseTime);
                    message.setCreatedAt(LocalDateTime.now());
                    
                    messageRepository.save(message);
                    
                    // Mettre à jour le timestamp du chat
                    chat.setUpdatedAt(LocalDateTime.now());
                    chatRepository.save(chat);
                }
            }


            LlamaResponseDTO result = new LlamaResponseDTO();
            result.setOutput(correctedCode);
            result.setLanguage(language);
            result.setErrors(errors);
            result.setCorrections(corrections);
            result.setOriginalCode(code);
            result.setCorrectedCode(correctedCode);
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
