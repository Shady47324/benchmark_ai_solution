package com.llama.llamabackend.model;

public class PromptResponse {
    private String output;
    private int input_tokens;
    private int output_tokens;
    private double response_time_ms;

    // Getters & Setters

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public int getInput_tokens() {
        return input_tokens;
    }

    public void setInput_tokens(int input_tokens) {
        this.input_tokens = input_tokens;
    }

    public int getOutput_tokens() {
        return output_tokens;
    }

    public void setOutput_tokens(int output_tokens) {
        this.output_tokens = output_tokens;
    }

    public double getResponse_time_ms() {
        return response_time_ms;
    }

    public void setResponse_time_ms(double response_time_ms) {
        this.response_time_ms = response_time_ms;
    }
}
