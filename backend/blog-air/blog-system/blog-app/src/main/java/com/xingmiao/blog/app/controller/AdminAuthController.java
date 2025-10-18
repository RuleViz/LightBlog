package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.app.config.AuthorConfig;
import com.xingmiao.blog.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员认证控制器
 * 
 * <p>提供简单的管理员密码验证功能。</p>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "管理员认证", description = "管理员密码验证接口")
public class AdminAuthController {

    private final AuthorConfig authorConfig;

    /**
     * 管理员密码验证
     */
    @PostMapping("/admin-login")
    @Operation(summary = "管理员登录", description = "验证管理员密码")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "验证成功"),
        @ApiResponse(responseCode = "401", description = "密码错误"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<String>> adminLogin(@RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.ok(Result.error("密码不能为空"));
            }

            // 检查是否启用了密码验证
            if (!authorConfig.isPasswordEnabled()) {
                return ResponseEntity.ok(Result.error("管理员密码验证未启用"));
            }

            // 验证密码
            if (authorConfig.getPassword() != null && authorConfig.getPassword().equals(password)) {
                log.info("管理员密码验证成功");
                return ResponseEntity.ok(Result.success("验证成功"));
            } else {
                log.warn("管理员密码验证失败");
                return ResponseEntity.ok(Result.error("密码错误"));
            }
        } catch (Exception e) {
            log.error("管理员密码验证异常", e);
            return ResponseEntity.ok(Result.error("验证失败：" + e.getMessage()));
        }
    }
}
