package com.llama.llamabackend.dto;

import lombok.Setter;

import java.util.List;

public class LlamaResponseDTO {

    private String output;
    private String language;
    private List<String> errors;
    private List<String> corrections;

    private int inputTokens;
    private int outputTokens;
    private double responseTimeMs;
    @Setter
    private String originalCode;
    @Setter
    private String correctedCode;
    @Setter
    private List<Integer> originalHighlightLines;
    @Setter
    private List<Integer> correctedHighlightLines;


    // Getters et setters pour tout

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getCorrections() {
        return corrections;
    }

    public void setCorrections(List<String> corrections) {
        this.corrections = corrections;
    }

    public int getInputTokens() {
        return inputTokens;
    }

    public void setInputTokens(int inputTokens) {
        this.inputTokens = inputTokens;
    }

    public int getOutputTokens() {
        return outputTokens;
    }

    public void setOutputTokens(int outputTokens) {
        this.outputTokens = outputTokens;
    }

    public double getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(double responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

}
