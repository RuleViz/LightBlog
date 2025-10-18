package com.xingmiao.blog.app.controller;

import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final StreamingChatModel streamingChatModel;

    public AIController(StreamingChatModel streamingChatModel) {
        this.streamingChatModel = streamingChatModel;
    }

    public record SummarizeRequest(String content, Integer lengthHint) {}
    public record PolishRequest(String content, String tone) {}

    @PostMapping(value = "/summarize/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter summarize(@RequestBody SummarizeRequest req) {
        SseEmitter emitter = new SseEmitter(0L);
        CompletableFuture.runAsync(() -> doStream(
                buildSummarizePrompt(req.content(), req.lengthHint()),
                emitter
        ));
        return emitter;
    }

    @PostMapping(value = "/polish/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter polish(@RequestBody PolishRequest req) {
        SseEmitter emitter = new SseEmitter(0L);
        CompletableFuture.runAsync(() -> doStream(
                buildPolishPrompt(req.content(), req.tone()),
                emitter
        ));
        return emitter;
    }

    private void doStream(String userPrompt, SseEmitter emitter) {
        try {
            streamingChatModel.chat(userPrompt, new StreamingChatResponseHandler() {
                @Override
                public void onPartialResponse(String partialResponse) {
                    try {
                        if (partialResponse != null && !partialResponse.isEmpty()) {
                            emitter.send(SseEmitter.event().data(partialResponse));
                        }
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                }

                @Override
                public void onCompleteResponse(ChatResponse completeResponse) {
                    emitter.complete();
                }

                @Override
                public void onError(Throwable error) {
                    try {
                        emitter.send(SseEmitter.event().name("error").data(error.getMessage()));
                    } catch (IOException ignored) {}
                    emitter.completeWithError(error);
                }
            });
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }
    }

    private String buildSummarizePrompt(String content, Integer lengthHint) {
        String len = (lengthHint == null || lengthHint <= 0) ? "" : ("，尽量控制在约" + lengthHint + "字内");
        return "你是专业的中文编辑，请基于以下文章生成简明扼要的中文摘要，保留核心事实与要点" + len + "。仅输出摘要，不要解释。\n\n文章：\n" + content;
    }

    private String buildPolishPrompt(String content, String tone) {
        String t = (tone == null || tone.isBlank()) ? "自然" : tone.trim();
        return "你是专业的中文写作润色助手。请在不改变原意和事实的前提下提升以下文本的清晰度、结构与流畅度，语气风格偏向：" + t + "。仅输出润色后的文本，不要附加任何解释。\n\n原文：\n" + content;
    }
}


