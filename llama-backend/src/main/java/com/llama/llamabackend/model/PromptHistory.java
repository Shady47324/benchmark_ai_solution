package com.llama.llamabackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PromptHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String output;

    private int inputTokens;
    private int outputTokens;
    private double responseTimeMs;

    private LocalDateTime timestamp = LocalDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public int getInputTokens() { return inputTokens; }
    public void setInputTokens(int inputTokens) { this.inputTokens = inputTokens; }

    public int getOutputTokens() { return outputTokens; }
    public void setOutputTokens(int outputTokens) { this.outputTokens = outputTokens; }

    public double getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(double responseTimeMs) { this.responseTimeMs = responseTimeMs; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
