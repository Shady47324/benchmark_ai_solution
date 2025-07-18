package com.llama.llamabackend.service;

import com.llama.llamabackend.model.PromptHistory;
import com.llama.llamabackend.model.PromptResponse;
import com.llama.llamabackend.repository.PromptHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LlamaService {

    @Autowired
    private PromptHistoryRepository promptHistoryRepository;

    public PromptResponse sendPromptToPython(String prompt) {
        String pythonUrl = "http://localhost:5000/api/generate";

        RestTemplate restTemplate = new RestTemplate();

        // Préparer les données à envoyer
        Map<String, String> payload = new HashMap<>();
        payload.put("prompt", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        // Envoyer la requête à l'API Python
        ResponseEntity<PromptResponse> responseEntity = restTemplate.exchange(
                pythonUrl,
                HttpMethod.POST,
                entity,
                PromptResponse.class
        );

        PromptResponse response = responseEntity.getBody();

        // Sauvegarder dans la base de données si réponse valide
        if (response != null) {
            PromptHistory history = new PromptHistory();
            history.setPrompt(prompt);
            history.setOutput(response.getOutput());
            history.setInputTokens(response.getInput_tokens());
            history.setOutputTokens(response.getOutput_tokens());
            history.setResponseTimeMs(response.getResponse_time_ms());

            promptHistoryRepository.save(history);
        }

        return response;
    }
}
