package com.xingmiao.blog.app.service.impl;

import com.xingmiao.blog.common.domain.entity.Category;
import com.xingmiao.blog.common.domain.entity.Post;
import com.xingmiao.blog.common.dto.CategoryCreateRequest;
import com.xingmiao.blog.common.dto.CategoryDto;
import com.xingmiao.blog.common.dto.CategoryUpdateRequest;
import com.xingmiao.blog.common.exception.CategoryDeleteException;
import com.xingmiao.blog.app.repository.CategoryRepository;
import com.xingmiao.blog.app.repository.PostRepository;
import com.xingmiao.blog.app.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    @Override
    public CategoryDto createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("分类别名已存在: " + request.getSlug());
        }
        if (request.getName() != null && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("分类名称已存在: " + request.getName());
        }

        Category parent = null;
        Integer level = 1;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("父级分类不存在: " + request.getParentId()));
            level = (parent.getLevel() == null ? 1 : parent.getLevel()) + 1;
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .parent(parent)
                .level(level)
                .sortOrder(request.getSortOrder())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        return convertToDto(saved);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在: " + id));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new RuntimeException("分类名称已存在: " + request.getName());
            }
            category.setName(request.getName());
        }

        if (request.getSlug() != null && !request.getSlug().equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("分类别名已存在: " + request.getSlug());
            }
            category.setSlug(request.getSlug());
        }

        if (request.getParentId() != null) {
            Category newParent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("父级分类不存在: " + request.getParentId()));
            category.setParent(newParent);
            category.setLevel((newParent.getLevel() == null ? 1 : newParent.getLevel()) + 1);
        }

        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getLevel() != null) {
            category.setLevel(request.getLevel());
        }

        Category updated = categoryRepository.save(category);
        return convertToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> getCategoryById(Long id) {
        return categoryRepository.findById(id).map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> getCategoryByName(String name) {
        return categoryRepository.findByName(name).map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug).map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryDto> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long id) {
        boolean exists = categoryRepository.existsById(id);
        if (!exists) {
            throw new RuntimeException("分类不存在: " + id);
        }

        long activePostCount = postRepository.countByCategory_IdAndDeletedAtIsNull(id);
        if (activePostCount > 0) {
            throw new CategoryDeleteException(activePostCount);
        }

        List<Post> trashPosts = postRepository.findByCategory_IdAndDeletedAtIsNotNull(id);
        if (!trashPosts.isEmpty()) {
            postRepository.deleteAll(trashPosts);
            log.info("删除分类时级联删除回收站文章，分类ID:{} 删除文章数量:{}",
                    id, trashPosts.size());
        }

        // 删除分类及其子分类
        Set<Long> idsToDelete = collectDescendantIds(id);
        if (!idsToDelete.isEmpty()) {
            categoryRepository.deleteAllById(idsToDelete);
            log.info("分类硬删除成功，删除数量:{}，包含ID:{}", idsToDelete.size(), idsToDelete);
        }
    }

    private Set<Long> collectDescendantIds(Long targetId) {
        List<Category> allCategories = categoryRepository.findAll();
        Set<Long> result = new HashSet<>();
        for (Category category : allCategories) {
            if (isDescendantOrSelf(category, targetId)) {
                result.add(category.getId());
            }
        }
        return result;
    }

    private boolean isDescendantOrSelf(Category category, Long targetId) {
        if (category.getId().equals(targetId)) {
            return true;
        }
        Category parent = category.getParent();
        while (parent != null) {
            if (parent.getId().equals(targetId)) {
                return true;
            }
            parent = parent.getParent();
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        return categoryRepository.existsBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getChildren(Long parentId) {
        return categoryRepository.findByParent_Id(parentId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private CategoryDto convertToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .parentId(category.getParent() == null ? null : category.getParent().getId())
                .level(category.getLevel())
                .sortOrder(category.getSortOrder())
                .description(category.getDescription())
                .postCount((int) postRepository.countByCategory_IdAndDeletedAtIsNull(category.getId()))
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}


