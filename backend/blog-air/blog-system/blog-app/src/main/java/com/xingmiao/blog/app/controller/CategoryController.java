package com.xingmiao.blog.app.controller;

import com.xingmiao.blog.common.dto.CategoryCreateRequest;
import com.xingmiao.blog.common.dto.CategoryDto;
import com.xingmiao.blog.common.dto.CategoryUpdateRequest;
import com.xingmiao.blog.app.service.CategoryService;
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
import com.xingmiao.blog.common.exception.CategoryDeleteException;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;

import java.util.List;

/**
 * 分类管理控制器
 * 
 * <p>提供博客系统分类的管理功能，支持分类的增删改查、层级结构管理。</p>
 * <p>主要功能包括：</p>
 * <ul>
 *   <li>创建、更新、删除分类</li>
 *   <li>根据ID、名称或别名查询分类</li>
 *   <li>分页查询分类列表</li>
 *   <li>查询所有分类（不分页）</li>
 *   <li>检查分类名称或别名是否存在</li>
 *   <li>查询子分类</li>
 * </ul>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "分类管理", description = "文章分类的增删改查接口")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 创建新分类
     * 
     * @param request 分类创建请求对象，包含分类名称、别名、描述等信息
     * @return 创建成功返回分类详情，状态码201
     */
    @PostMapping
    @Operation(summary = "创建分类", description = "创建新的文章分类")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "分类创建成功", 
                    content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "409", description = "分类名称或别名已存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 更新分类信息
     * 
     * @param id 分类ID
     * @param request 分类更新请求对象
     * @return 更新成功返回更新后的分类详情
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新分类", description = "根据分类ID更新分类信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "分类更新成功", 
                    content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "404", description = "分类不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<CategoryDto> update(
            @Parameter(description = "分类ID", required = true) @PathVariable("id") Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryDto updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * 根据ID查询分类
     * 
     * @param id 分类ID
     * @return 分类详情，如果不存在返回404
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询分类", description = "根据分类ID查询分类详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "404", description = "分类不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<CategoryDto> getById(
            @Parameter(description = "分类ID", required = true) @PathVariable("id") Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据名称查询分类
     * 
     * @param name 分类名称
     * @return 分类详情，如果不存在返回404
     */
    @GetMapping("/name/{name}")
    @Operation(summary = "根据名称查询分类", description = "根据分类名称查询分类详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "404", description = "分类不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<CategoryDto> getByName(
            @Parameter(description = "分类名称", required = true) @PathVariable("name") String name) {
        return categoryService.getCategoryByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据别名查询分类
     * 
     * @param slug 分类别名
     * @return 分类详情，如果不存在返回404
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "根据别名查询分类", description = "根据分类别名查询分类详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = CategoryDto.class))),
        @ApiResponse(responseCode = "404", description = "分类不存在"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<CategoryDto> getBySlug(
            @Parameter(description = "分类别名", required = true) @PathVariable("slug") String slug) {
        return categoryService.getCategoryBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 分页查询分类列表
     * 
     * @param pageable 分页参数
     * @return 分页的分类列表
     */
    @GetMapping
    @Operation(summary = "分页查询分类列表", description = "分页查询所有分类，支持排序和分页")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Page<CategoryDto>> list(
            @Parameter(description = "分页参数") @ParameterObject Pageable pageable) {
        Page<CategoryDto> page = categoryService.getAllCategories(pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * 查询所有分类（不分页）
     * 
     * @return 所有分类的列表
     */
    @GetMapping("/all")
    @Operation(summary = "查询所有分类", description = "查询所有分类，不分页")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<List<CategoryDto>> listAll() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * 删除分类
     * 
     * @param id 分类ID
     * @return 删除成功返回204状态码
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类", description = "根据分类ID删除分类")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "分类删除成功"),
        @ApiResponse(responseCode = "404", description = "分类不存在"),
        @ApiResponse(responseCode = "409", description = "分类下存在文章，无法删除"),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<?> delete(
            @Parameter(description = "分类ID", required = true) @PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (CategoryDeleteException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of(
                            "message", ex.getMessage(),
                            "postCount", ex.getPostCount()
                    ));
        }
    }

    /**
     * 检查分类名称是否存在
     * 
     * @param name 分类名称
     * @return 存在返回true，不存在返回false
     */
    @GetMapping("/exists/name/{name}")
    @Operation(summary = "检查分类名称是否存在", description = "检查指定名称的分类是否已存在")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "检查完成", 
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Boolean> existsByName(
            @Parameter(description = "分类名称", required = true) @PathVariable("name") String name) {
        return ResponseEntity.ok(categoryService.existsByName(name));
    }

    /**
     * 检查分类别名是否存在
     * 
     * @param slug 分类别名
     * @return 存在返回true，不存在返回false
     */
    @GetMapping("/exists/slug/{slug}")
    @Operation(summary = "检查分类别名是否存在", description = "检查指定别名的分类是否已存在")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "检查完成", 
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<Boolean> existsBySlug(
            @Parameter(description = "分类别名", required = true) @PathVariable("slug") String slug) {
        return ResponseEntity.ok(categoryService.existsBySlug(slug));
    }

    /**
     * 查询子分类
     * 
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    @GetMapping("/{parentId}/children")
    @Operation(summary = "查询子分类", description = "查询指定父分类下的所有子分类")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
        @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<List<CategoryDto>> children(
            @Parameter(description = "父分类ID", required = true) @PathVariable("parentId") Long parentId) {
        return ResponseEntity.ok(categoryService.getChildren(parentId));
    }
}


