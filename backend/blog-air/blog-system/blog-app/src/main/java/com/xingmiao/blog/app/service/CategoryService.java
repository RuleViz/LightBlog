package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.CategoryCreateRequest;
import com.xingmiao.blog.common.dto.CategoryDto;
import com.xingmiao.blog.common.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    CategoryDto createCategory(CategoryCreateRequest request);

    CategoryDto updateCategory(Long id, CategoryUpdateRequest request);

    Optional<CategoryDto> getCategoryById(Long id);

    Optional<CategoryDto> getCategoryByName(String name);

    Optional<CategoryDto> getCategoryBySlug(String slug);

    Page<CategoryDto> getAllCategories(Pageable pageable);

    List<CategoryDto> getAllCategories();

    void deleteCategory(Long id);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    List<CategoryDto> getChildren(Long parentId);
}


