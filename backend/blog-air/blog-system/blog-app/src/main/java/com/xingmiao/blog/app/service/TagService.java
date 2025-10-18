package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.TagCreateRequest;
import com.xingmiao.blog.common.dto.TagDto;
import com.xingmiao.blog.common.dto.TagUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TagService {
    
    /**
     * 创建标签
     */
    TagDto createTag(TagCreateRequest request);
    
    /**
     * 更新标签
     */
    TagDto updateTag(Long id, TagUpdateRequest request);
    
    /**
     * 根据ID获取标签
     */
    Optional<TagDto> getTagById(Long id);
    
    /**
     * 根据名称获取标签
     */
    Optional<TagDto> getTagByName(String name);
    
    /**
     * 根据别名获取标签
     */
    Optional<TagDto> getTagBySlug(String slug);
    
    /**
     * 分页获取所有标签
     */
    Page<TagDto> getAllTags(Pageable pageable);
    
    /**
     * 获取所有标签（不分页）
     */
    List<TagDto> getAllTags();
    
    /**
     * 删除标签
     */
    void deleteTag(Long id);
    
    /**
     * 检查标签名称是否存在
     */
    boolean existsByName(String name);
    
    /**
     * 检查标签别名是否存在
     */
    boolean existsBySlug(String slug);
}
