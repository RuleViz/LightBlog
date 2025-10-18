package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.domain.enums.Visibility;
import com.xingmiao.blog.common.dto.PostCreateRequest;
import com.xingmiao.blog.common.dto.PostDto;
import com.xingmiao.blog.common.dto.PostUpdateRequest;
// import com.xingmiao.blog.app.repository.PostAccessKeyRepository;
// import com.xingmiao.blog.app.service.AccessTokenService;
import com.xingmiao.blog.app.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 博客文章管理控制器
 * 
 * <p>提供博客文章的增删改查功能，支持分页查询、分类查询、密码保护等功能。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>创建、更新、删除文章</li>
 *   <li>根据ID或别名查询文章</li>
 *   <li>分页查询文章列表</li>
 *   <li>按分类查询文章</li>
 *   <li>密码保护文章的访问控制</li>
 * </ul>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "文章管理", description = "博客文章的增删改查接口")
public class PostController {

    private final PostService postService;
    // 明文密码模式：不再依赖访问令牌和访问口令表

    /**
     * 创建新文章
     * 
     * @param request 文章创建请求对象，包含文章标题、内容、分类等信息
     * @return 创建成功返回文章详情，状态码201
     */
    @PostMapping
    @Operation(
        summary = "创建文章", 
        description = "创建一篇新的博客文章。只需要填写标题和内容即可，其他字段都有合理的默认值。",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "文章创建请求",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PostCreateRequest.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                    name = "简单创建示例",
                    summary = "最简单的文章创建",
                    description = "只需要提供标题和内容，其他字段使用默认值",
                    value = """
                    {
                        "title": "我的第一篇博客文章",
                        "content": "# 欢迎来到我的博客\\n\\n这是我的第一篇博客文章，很高兴与大家分享我的想法。"
                    }
                    """
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "文章创建成功", 
                    content = @Content(schema = @Schema(implementation = PostDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效", 
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<PostDto> create(@Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request));
    }

    /**
     * 更新文章
     * 
     * @param id 文章ID
     * @param request 文章更新请求对象
     * @return 更新成功返回更新后的文章详情
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新文章", description = "根据文章ID更新文章信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "文章更新成功", 
                    content = @Content(schema = @Schema(implementation = PostDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<PostDto> update(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id, 
            @Valid @RequestBody PostUpdateRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    /**
     * 删除文章
     * 
     * @param id 文章ID
     * @return 删除成功返回204状态码
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除文章", description = "根据文章ID删除文章")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "文章删除成功"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 根据ID查询文章
     * 
     * @param id 文章ID
     * @param request HTTP请求对象，用于获取访问令牌
     * @return 文章详情，如果是密码保护文章需要验证访问令牌
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询文章", description = "根据文章ID查询文章详情，支持密码保护文章的访问控制")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = PostDto.class))),
        @ApiResponse(responseCode = "401", description = "密码保护文章，需要访问令牌"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<PostDto> getById(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id, 
            HttpServletRequest request) {
        String token = getCookieValue(request, "pa_" + id);
        return postService.getById(id)
                .map(post -> handleProtectedPost(id, post, token))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据别名查询文章
     * 
     * @param slug 文章别名
     * @param request HTTP请求对象，用于获取访问令牌
     * @return 文章详情，如果是密码保护文章需要验证访问令牌
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "根据别名查询文章", description = "根据文章别名查询文章详情，支持密码保护文章的访问控制")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = PostDto.class))),
        @ApiResponse(responseCode = "401", description = "密码保护文章，需要访问令牌"),
        @ApiResponse(responseCode = "404", description = "文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<PostDto> getBySlug(
            @Parameter(description = "文章别名", required = true) @PathVariable("slug") String slug, 
            HttpServletRequest request) {
        return postService.getBySlug(slug)
                .map(post -> {
                    String token = getCookieValue(request, "pa_" + post.getId());
                    return handleProtectedPost(post.getId(), post, token);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 分页查询文章列表（支持关键词搜索）
     * 
     * @param keyword 搜索关键词（可选）
     * @param pageable 分页参数
     * @return 分页的文章列表
     */
    @GetMapping
    @Operation(summary = "分页查询文章列表", description = "分页查询文章，支持关键词搜索标题、内容和摘要")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Page<PostDto>> list(
            @Parameter(description = "搜索关键词") @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "标签ID") @RequestParam(value = "tagId", required = false) Long tagId,
            @Parameter(description = "分类ID") @RequestParam(value = "categoryId", required = false) Long categoryId,
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        if (tagId != null) {
            return ResponseEntity.ok(postService.listPublishedPostsByTag(tagId, pageable));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(postService.listPublishedPostsByCategory(categoryId, pageable));
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(postService.searchPublishedPosts(keyword, pageable));
        }
        return ResponseEntity.ok(postService.listPublishedPosts(pageable));
    }

    /**
     * 按分类查询文章
     * 
     * @param categoryId 分类ID
     * @param pageable 分页参数
     * @return 指定分类下的分页文章列表
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "按分类查询文章", description = "根据分类ID查询该分类下的所有文章，支持分页")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Page<PostDto>> listByCategory(
            @Parameter(description = "分类ID", required = true) @PathVariable("categoryId") Long categoryId, 
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(postService.listPublishedPostsByCategory(categoryId, pageable));
    }

    @GetMapping("/tag/{tagId}")
    @Operation(summary = "按标签查询文章", description = "根据标签ID查询该标签下的所有文章，支持分页")
    public ResponseEntity<Page<PostDto>> listByTag(
            @Parameter(description = "标签ID", required = true) @PathVariable("tagId") Long tagId,
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(postService.listPublishedPostsByTag(tagId, pageable));
    }

    // ========== 管理端专用接口 ==========
    
    /**
     * 管理端分页查询文章列表（包含所有状态）
     */
    @GetMapping("/admin")
    @Operation(summary = "管理端查询文章列表", description = "管理端分页查询文章，包含草稿、已发布、存档等所有状态")
    public ResponseEntity<Page<PostDto>> adminList(
            @Parameter(description = "搜索关键词") @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(postService.searchByKeyword(keyword, pageable));
        }
        return ResponseEntity.ok(postService.list(pageable));
    }

    /**
     * 获取文章统计信息
     */
    @GetMapping("/stats")
    @Operation(summary = "获取文章统计信息", description = "获取所有状态文章的统计信息，用于仪表盘")
    public ResponseEntity<java.util.Map<String, Object>> getStats() {
        long totalPosts = postService.countAllPosts();
        long publishedPosts = postService.countPublishedPosts();
        long draftPosts = postService.countDraftPosts();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalPosts", totalPosts);
        stats.put("publishedPosts", publishedPosts);
        stats.put("draftPosts", draftPosts);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * 处理密码保护文章的访问控制
     * 
     * @param postId 文章ID
     * @param post 文章对象
     * @param token 访问令牌
     * @return 根据访问权限返回相应的响应
     */
    private ResponseEntity<PostDto> handleProtectedPost(Long postId, PostDto post, String cookiePassword) {
        if (post.getVisibility() != Visibility.PASSWORD) {
            postService.incrementViewCount(postId);
            return ResponseEntity.ok(post);
        }
        if (cookiePassword == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!cookiePassword.equals(post.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        postService.incrementViewCount(postId);
        return ResponseEntity.ok(post);
    }


    /**
     * 从Cookie中获取指定名称的值
     * 
     * @param request HTTP请求对象
     * @param name Cookie名称
     * @return Cookie值，如果不存在返回null
     */
    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}


