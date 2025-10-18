package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.dto.TagCreateRequest;
import com.xingmiao.blog.common.dto.TagDto;
import com.xingmiao.blog.common.dto.TagUpdateRequest;
import com.xingmiao.blog.app.service.TagService;
import com.xingmiao.blog.common.exception.TagDeleteException;
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

import java.util.List;

/**
 * 标签管理控制器
 * 
 * <p>提供博客系统标签的管理功能，支持标签的增删改查操作。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>创建、更新、删除标签</li>
 *   <li>根据ID、名称或别名查询标签</li>
 *   <li>分页查询标签列表</li>
 *   <li>查询所有标签（不分页）</li>
 *   <li>检查标签名称或别名是否存在</li>
 * </ul>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "标签管理", description = "文章标签的增删改查接口")
public class TagController {
    
    private final TagService tagService;
    
    /**
     * 创建新标签
     * 
     * @param request 标签创建请求对象，包含标签名称、别名、描述等信息
     * @return 创建成功返回标签详情，状态码201
     */
    @PostMapping
    @Operation(summary = "创建标签", description = "创建新的文章标签")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "标签创建成功", 
                    content = @Content(schema = @Schema(implementation = TagDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "409", description = "标签名称或别名已存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody TagCreateRequest request) {
        TagDto createdTag = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTag);
    }
    
    /**
     * 更新标签信息
     * 
     * @param id 标签ID
     * @param request 标签更新请求对象
     * @return 更新成功返回更新后的标签详情
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新标签", description = "根据标签ID更新标签信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "标签更新成功", 
                    content = @Content(schema = @Schema(implementation = TagDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "404", description = "标签不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<TagDto> updateTag(
            @Parameter(description = "标签ID", required = true) @PathVariable("id") Long id, 
            @Valid @RequestBody TagUpdateRequest request) {
        TagDto updatedTag = tagService.updateTag(id, request);
        return ResponseEntity.ok(updatedTag);
    }
    
    /**
     * 根据ID查询标签
     * 
     * @param id 标签ID
     * @return 标签详情，如果不存在返回404
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询标签", description = "根据标签ID查询标签详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = TagDto.class))),
        @ApiResponse(responseCode = "404", description = "标签不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<TagDto> getTagById(
            @Parameter(description = "标签ID", required = true) @PathVariable("id") Long id) {
        return tagService.getTagById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 根据名称查询标签
     * 
     * @param name 标签名称
     * @return 标签详情，如果不存在返回404
     */
    @GetMapping("/name/{name}")
    @Operation(summary = "根据名称查询标签", description = "根据标签名称查询标签详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = TagDto.class))),
        @ApiResponse(responseCode = "404", description = "标签不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<TagDto> getTagByName(
            @Parameter(description = "标签名称", required = true) @PathVariable("name") String name) {
        return tagService.getTagByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 根据别名查询标签
     * 
     * @param slug 标签别名
     * @return 标签详情，如果不存在返回404
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "根据别名查询标签", description = "根据标签别名查询标签详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = TagDto.class))),
        @ApiResponse(responseCode = "404", description = "标签不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<TagDto> getTagBySlug(
            @Parameter(description = "标签别名", required = true) @PathVariable("slug") String slug) {
        return tagService.getTagBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 分页查询标签列表
     * 
     * @param pageable 分页参数
     * @return 分页的标签列表
     */
    @GetMapping
    @Operation(summary = "分页查询标签列表", description = "分页查询所有标签，支持排序和分页")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Page<TagDto>> getAllTags(
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        Page<TagDto> tags = tagService.getAllTags(pageable);
        return ResponseEntity.ok(tags);
    }
    
    /**
     * 查询所有标签（不分页）
     * 
     * @return 所有标签的列表
     */
    @GetMapping("/all")
    @Operation(summary = "查询所有标签", description = "查询所有标签，不分页")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<List<TagDto>> getAllTags() {
        List<TagDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }
    
    /**
     * 删除标签
     * 
     * @param id 标签ID
     * @return 删除成功返回204状态码
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除标签", description = "根据标签ID删除标签")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "标签删除成功"),
        @ApiResponse(responseCode = "404", description = "标签不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<?> deleteTag(
            @Parameter(description = "标签ID", required = true) @PathVariable("id") Long id) {
        try {
            tagService.deleteTag(id);
            return ResponseEntity.noContent().build();
        } catch (TagDeleteException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of(
                            "message", ex.getMessage(),
                            "postCount", ex.getPostCount()
                    ));
        }
    }
    
    /**
     * 检查标签名称是否存在
     * 
     * @param name 标签名称
     * @return 存在返回true，不存在返回false
     */
    @GetMapping("/exists/name/{name}")
    @Operation(summary = "检查标签名称是否存在", description = "检查指定名称的标签是否已存在")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "检查完成", 
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Boolean> existsByName(
            @Parameter(description = "标签名称", required = true) @PathVariable("name") String name) {
        boolean exists = tagService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * 检查标签别名是否存在
     * 
     * @param slug 标签别名
     * @return 存在返回true，不存在返回false
     */
    @GetMapping("/exists/slug/{slug}")
    @Operation(summary = "检查标签别名是否存在", description = "检查指定别名的标签是否已存在")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "检查完成", 
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Boolean> existsBySlug(
            @Parameter(description = "标签别名", required = true) @PathVariable("slug") String slug) {
        boolean exists = tagService.existsBySlug(slug);
        return ResponseEntity.ok(exists);
    }
}
