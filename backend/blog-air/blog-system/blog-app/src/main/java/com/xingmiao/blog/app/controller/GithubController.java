package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.app.config.AuthorConfig;
import com.xingmiao.blog.app.service.GithubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub API", description = "GitHub相关接口")
public class GithubController {

    private final GithubService githubService;
    private final AuthorConfig authorConfig;


    @GetMapping("/contributions/data")
    @Operation(summary = "获取GitHub贡献数据", description = "仅获取解析后的贡献数据")
    public ResponseEntity<Map<String, Object>> getContributionsData(
            @Parameter(name = "username", description = "GitHub用户名", example = "octocat")
            @RequestParam(name = "username") String username,
            
            @Parameter(name = "from", description = "开始日期 (YYYY-MM-DD)", required = false)
            @RequestParam(name = "from", required = false) String from,
            
            @Parameter(name = "to", description = "结束日期 (YYYY-MM-DD)", required = false)
            @RequestParam(name = "to", required = false) String to) {
        
        try {
            var data = githubService.getContributionsData(username, from, to);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "username", username,
                    "data", data
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/contributions")
    @Operation(summary = "获取博客作者的GitHub贡献数据", description = "获取配置用户的GitHub贡献数据，用于前端展示")
    public ResponseEntity<Map<String, Object>> getAuthorContributions() {
        try {
            String username = authorConfig.getGithubUsername();
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "error", "未配置GitHub用户名"
                ));
            }

            var data = githubService.getContributionsData(username, null, null);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "username", username,
                    "data", data
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }
}
