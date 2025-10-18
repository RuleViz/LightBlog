package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.app.config.AuthorConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 博客作者信息管理控制器
 * 
 * <p>提供博客作者基本信息的查询功能。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>获取博客作者信息</li>
 * </ul>
 * 
 * <p>注意：这是一个单用户博客系统，使用配置文件管理作者信息。</p>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/author")
@RequiredArgsConstructor
@Tag(name = "作者信息", description = "博客作者基本信息的查询接口")
public class UserController {

    private final AuthorConfig authorConfig;

    /**
     * 获取博客作者信息
     * 
     * @return 博客作者的基本信息
     */
    @GetMapping
    @Operation(summary = "获取作者信息", description = "获取博客作者的基本信息，包括姓名、简介、头像等")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "获取成功"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Map<String, Object>> getAuthorInfo() {
        Map<String, Object> authorInfo = new HashMap<>();
        authorInfo.put("username", authorConfig.getUsername());
        authorInfo.put("nickname", authorConfig.getNickname());
        authorInfo.put("bio", authorConfig.getBio());
        authorInfo.put("avatarUrl", authorConfig.getAvatarUrl());
        authorInfo.put("email", authorConfig.getEmail());
        authorInfo.put("website", authorConfig.getWebsite());
        authorInfo.put("passwordEnabled", authorConfig.isPasswordEnabled());
        
        return ResponseEntity.ok(authorInfo);
    }
}


