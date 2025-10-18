package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.PostCreateRequest;
import com.xingmiao.blog.common.dto.PostDto;
import com.xingmiao.blog.common.dto.PostUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PostService {
    PostDto create(PostCreateRequest request);
    PostDto update(Long id, PostUpdateRequest request);
    void delete(Long id);
    Optional<PostDto> getById(Long id);
    Optional<PostDto> getBySlug(String slug);
    Page<PostDto> list(Pageable pageable);
    Page<PostDto> listByCategory(Long categoryId, Pageable pageable);
    Page<PostDto> listByTag(Long tagId, Pageable pageable);
    Page<PostDto> searchByKeyword(String keyword, Pageable pageable);
    boolean existsById(Long id);
    
    // 用户端专用方法（只显示已发布的文章）
    Page<PostDto> listPublishedPosts(Pageable pageable);
    Page<PostDto> listPublishedPostsByCategory(Long categoryId, Pageable pageable);
    Page<PostDto> listPublishedPostsByTag(Long tagId, Pageable pageable);
    Page<PostDto> searchPublishedPosts(String keyword, Pageable pageable);
    
    // 统计方法
    long countAllPosts();
    long countPublishedPosts();
    long countDraftPosts();

    /**
     * 浏览量 +1（同一请求仅加一次，幂等由调用方保证）
     */
    void incrementViewCount(Long id);
}


