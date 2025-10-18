package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.dto.PostDto;
import com.xingmiao.blog.common.result.Result;
import com.xingmiao.blog.common.result.PageResult;
import com.xingmiao.blog.app.service.TrashService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;

import java.util.List;

/**
 * 回收站管理控制器
 * 
 * <p>提供回收站文章的恢复、删除和查询功能。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>分页查询回收站中的文章</li>
 *   <li>获取回收站文章详情</li>
 *   <li>恢复文章（移出回收站）</li>
 *   <li>硬删除文章（彻底删除）</li>
 *   <li>批量恢复文章</li>
 *   <li>批量硬删除文章</li>
 * </ul>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/trash")
@RequiredArgsConstructor
@Tag(name = "回收站管理", description = "回收站文章的恢复、删除和查询接口")
public class TrashController {

    private final TrashService trashService;

    /**
     * 分页查询回收站中的文章
     * 
     * @param pageable 分页参数
     * @return 回收站中的分页文章列表
     */
    @GetMapping("/posts")
    @Operation(summary = "查询回收站文章", description = "分页查询回收站中的所有文章")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = PageResult.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<PageResult<PostDto>>> listPosts(
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        Page<PostDto> page = trashService.listPosts(pageable);
        PageResult<PostDto> pageResult = PageResult.success(
            page.getContent(), 
            page.getNumber() + 1, 
            page.getSize(), 
            page.getTotalElements()
        );
        return ResponseEntity.ok(Result.success(pageResult));
    }

    /**
     * 获取回收站中的文章详情
     * 
     * @param id 文章ID
     * @return 回收站中的文章详情
     */
    @GetMapping("/posts/{id}")
    @Operation(summary = "获取回收站文章详情", description = "根据ID获取回收站中的文章详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = PostDto.class))),
        @ApiResponse(responseCode = "404", description = "回收站中文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<PostDto>> getPost(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id) {
        return trashService.getPost(id)
                .map(post -> ResponseEntity.ok(Result.success(post)))
                .orElse(ResponseEntity.ok(Result.error("回收站中文章不存在")));
    }

    /**
     * 恢复文章（从回收站移出）
     * 
     * @param id 文章ID
     * @return 恢复成功返回200状态码
     */
    @PostMapping("/posts/{id}/restore")
    @Operation(summary = "恢复文章", description = "从回收站中恢复文章，使其重新可见")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "文章恢复成功"),
        @ApiResponse(responseCode = "404", description = "回收站中文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<Void>> restorePost(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id) {
        trashService.restorePost(id);
        return ResponseEntity.ok(Result.success());
    }

    /**
     * 硬删除文章（从回收站彻底删除）
     * 
     * @param id 文章ID
     * @return 硬删除成功返回200状态码
     */
    @DeleteMapping("/posts/{id}")
    @Operation(summary = "硬删除文章", description = "从回收站中彻底删除文章，此操作不可恢复")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "文章硬删除成功"),
        @ApiResponse(responseCode = "404", description = "回收站中文章不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<Void>> hardDeletePost(
            @Parameter(description = "文章ID", required = true) @PathVariable("id") Long id) {
        trashService.hardDeletePost(id);
        return ResponseEntity.ok(Result.success());
    }

    /**
     * 批量恢复文章
     * 
     * @param ids 文章ID列表
     * @return 批量恢复结果
     */
    @PostMapping("/posts/batch-restore")
    @Operation(summary = "批量恢复文章", description = "批量从回收站中恢复文章")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "批量恢复成功"),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<Void>> batchRestore(
            @Parameter(description = "文章ID列表", required = true) @RequestBody List<Long> ids) {
        trashService.batchRestore(ids);
        return ResponseEntity.ok(Result.success());
    }

    /**
     * 批量硬删除文章
     * 
     * @param ids 文章ID列表
     * @return 批量硬删除结果
     */
    @DeleteMapping("/posts/batch-delete")
    @Operation(summary = "批量硬删除文章", description = "批量从回收站中彻底删除文章，此操作不可恢复")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "批量硬删除成功"),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Result<Void>> batchHardDelete(
            @Parameter(description = "文章ID列表", required = true) @RequestBody List<Long> ids) {
        trashService.batchHardDelete(ids);
        return ResponseEntity.ok(Result.success());
    }
}
