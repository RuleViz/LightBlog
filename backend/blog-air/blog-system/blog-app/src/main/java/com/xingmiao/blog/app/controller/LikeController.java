package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.domain.enums.LikeTargetType;
import com.xingmiao.blog.app.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@Tag(name = "点赞", description = "点赞/取消/统计/状态 查询接口")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{targetType}/{targetId}")
    @Operation(summary = "点赞")
    public ResponseEntity<Void> like(
            @Parameter(description = "目标类型", required = true) @PathVariable("targetType") LikeTargetType targetType,
            @Parameter(description = "目标ID", required = true) @PathVariable("targetId") Long targetId,
            HttpServletRequest request) {
        String ip = getClientIp(request);
        String ua = request.getHeader("User-Agent");
        likeService.like(targetType, targetId, ip, ua);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{targetType}/{targetId}")
    @Operation(summary = "取消点赞")
    public ResponseEntity<Void> unlike(
            @Parameter(description = "目标类型", required = true) @PathVariable("targetType") LikeTargetType targetType,
            @Parameter(description = "目标ID", required = true) @PathVariable("targetId") Long targetId,
            HttpServletRequest request) {
        String ip = getClientIp(request);
        likeService.unlike(targetType, targetId, ip);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{targetType}/{targetId}/count")
    @Operation(summary = "统计点赞数")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "查询成功", content = @Content(schema = @Schema(implementation = Long.class)))
    })
    public ResponseEntity<Long> count(
            @Parameter(description = "目标类型", required = true) @PathVariable("targetType") LikeTargetType targetType,
            @Parameter(description = "目标ID", required = true) @PathVariable("targetId") Long targetId) {
        return ResponseEntity.ok(likeService.count(targetType, targetId));
    }

    @GetMapping("/{targetType}/{targetId}/status")
    @Operation(summary = "当前IP是否已点赞")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "查询成功", content = @Content(schema = @Schema(implementation = Boolean.class)))
    })
    public ResponseEntity<Boolean> isLiked(
            @Parameter(description = "目标类型", required = true) @PathVariable("targetType") LikeTargetType targetType,
            @Parameter(description = "目标ID", required = true) @PathVariable("targetId") Long targetId,
            HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(likeService.isLiked(targetType, targetId, ip));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int idx = xff.indexOf(',');
            return idx > 0 ? xff.substring(0, idx).trim() : xff.trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}


