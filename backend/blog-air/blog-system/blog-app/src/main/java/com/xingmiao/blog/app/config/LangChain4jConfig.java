package com.xingmiao.blog.app.config;

import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jConfig {

    @Bean
    public StreamingChatModel streamingChatModel(
            @Value("${langchain4j.open-ai.streaming-chat-model.api-key}") String apiKey,
            @Value("${langchain4j.open-ai.streaming-chat-model.model-name}") String modelName,
            @Value(value = "${langchain4j.open-ai.streaming-chat-model.base-url:}") String baseUrl,
            @Value(value = "${langchain4j.open-ai.streaming-chat-model.temperature:0.3}") Double temperature
    ) {
        var builder = OpenAiStreamingChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(temperature);
        if (baseUrl != null && !baseUrl.isBlank()) {
            builder.baseUrl(baseUrl);
        }
        return builder.build();
    }
}


