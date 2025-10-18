package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.dto.PostDto;
import com.xingmiao.blog.app.service.PostService;
// import com.xingmiao.blog.app.service.AccessTokenService;
// import com.xingmiao.blog.app.service.PostAccessKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 文章密码管理控制器
 * 
 * <p>提供博客文章密码保护相关的功能，包括密码设置和访问验证。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>更新文章的访问密码</li>
 *   <li>验证文章访问密码并生成访问令牌</li>
 * </ul>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "文章密码管理", description = "文章密码保护和访问控制接口")
public class PostPasswordController {

    // 明文密码模式：无需访问口令服务和令牌服务
    private final PostService postService;

    /**
     * 更新文章的访问密码
     * 
     * @param postId 文章ID
     * @param request 密码更新请求对象，包含新的密码列表
     * @return 更新成功返回204状态码
     */
    // 明文模式下不再提供批量更新访问口令

    /**
     * 验证文章访问密码
     * 
     * @param postId 文章ID
     * @param password 访问密码
     * @return 验证成功返回200状态码，并设置访问令牌Cookie
     */
    @PostMapping("/{postId}/access")
    @Operation(summary = "验证文章密码", description = "验证文章访问密码（明文模式），验证成功后在 Cookie 中写入明文密码")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "密码验证成功，已设置访问令牌"),
        @ApiResponse(responseCode = "401", description = "密码验证失败"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Void> verify(
            @Parameter(description = "文章ID", required = true) @PathVariable("postId") Long postId,
            @Parameter(description = "访问密码", required = true) @RequestBody String password) {
        var postOpt = postService.getById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var post = postOpt.get();
        if (!password.equals(post.getPassword())) {
            return ResponseEntity.status(401).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, "pa_" + postId + "=" + password + "; Path=/; Max-Age=" + (24 * 3600));
        return ResponseEntity.ok().headers(headers).build();
    }

    /**
     * 通过 slug 验证文章访问密码
     *
     * @param slug 文章别名
     * @param password 访问密码
     * @return 验证成功返回200，并设置访问令牌Cookie；未找到返回404；失败返回401
     */
    @PostMapping("/slug/{slug}/access")
    @Operation(summary = "通过别名验证文章密码", description = "根据文章别名验证访问密码（明文模式），验证成功后在 Cookie 中写入明文密码")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "密码验证成功，已设置访问令牌"),
        @ApiResponse(responseCode = "401", description = "密码验证失败"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Void> verifyBySlug(
            @Parameter(description = "文章别名", required = true) @PathVariable("slug") String slug,
            @Parameter(description = "访问密码", required = true) @RequestBody String password) {
        var postOpt = postService.getBySlug(slug);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PostDto post = postOpt.get();
        Long postId = post.getId();
        if (!password.equals(post.getPassword())) {
            return ResponseEntity.status(401).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, "pa_" + postId + "=" + password + "; Path=/; Max-Age=" + (24 * 3600));
        return ResponseEntity.ok().headers(headers).build();
    }
}


