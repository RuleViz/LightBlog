package com.xingmiao.blog.app.service.impl;

import com.xingmiao.blog.app.repository.PostRepository;
import com.xingmiao.blog.app.repository.CategoryRepository;
import com.xingmiao.blog.app.service.TrashService;
import com.xingmiao.blog.common.domain.entity.Post;
import com.xingmiao.blog.common.dto.PostDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 回收站服务实现类
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrashServiceImpl implements TrashService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listPosts(Pageable pageable) {
        return postRepository.findByDeletedAtIsNotNull(pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PostDto> getPost(Long id) {
        return postRepository.findByIdAndDeletedAtIsNotNull(id)
                .map(this::convertToDto);
    }

    @Override
    @Transactional
    public void restorePost(Long id) {
        Post post = postRepository.findByIdAndDeletedAtIsNotNull(id)
                .orElseThrow(() -> new RuntimeException("回收站中文章不存在，ID:" + id));
        
        // 检查文章的分类是否存在且激活
        if (post.getCategory() != null) {
            boolean categoryExists = categoryRepository.existsById(post.getCategory().getId());

            if (!categoryExists) {
                throw new RuntimeException("无法恢复文章，文章的分类 \"" + post.getCategory().getName() + "\" 不存在或已被删除。请先恢复分类后再恢复文章。");
            }
        }
        
        post.setDeletedAt(null);
        postRepository.save(post);
        
        
        log.info("文章已从回收站恢复，ID:{} 标题:{}", id, post.getTitle());
    }

    @Override
    @Transactional
    public void hardDeletePost(Long id) {
        Post post = postRepository.findByIdAndDeletedAtIsNotNull(id)
                .orElseThrow(() -> new RuntimeException("回收站中文章不存在，ID:" + id));
        
        String title = post.getTitle();
        postRepository.delete(post);
        
        log.info("文章已从回收站硬删除，ID:{} 标题:{}", id, title);
    }

    @Override
    @Transactional
    public void batchRestore(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("文章ID列表不能为空");
        }
        
        List<Post> posts = postRepository.findAllById(ids);
        List<Post> trashPosts = posts.stream()
                .filter(post -> post.getDeletedAt() != null)
                .toList();
        
        if (trashPosts.isEmpty()) {
            throw new RuntimeException("没有找到可恢复的文章");
        }
        
        // 检查每个文章的分类是否存在且激活
        for (Post post : trashPosts) {
            if (post.getCategory() != null) {
                boolean categoryExists = categoryRepository.existsById(post.getCategory().getId());

                if (!categoryExists) {
                    throw new RuntimeException("无法恢复文章 \"" + post.getTitle() + "\"，其分类 \"" + post.getCategory().getName() + "\" 不存在或已被删除。请先恢复分类后再恢复文章。");
                }
            }
        }
        
        // 批量恢复
        trashPosts.forEach(post -> post.setDeletedAt(null));
        postRepository.saveAll(trashPosts);
        
        
        log.info("批量恢复文章完成，恢复数量:{} 文章ID:{}", trashPosts.size(), 
                trashPosts.stream().map(Post::getId).toList());
    }

    @Override
    @Transactional
    public void batchHardDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("文章ID列表不能为空");
        }
        
        List<Post> posts = postRepository.findAllById(ids);
        List<Post> trashPosts = posts.stream()
                .filter(post -> post.getDeletedAt() != null)
                .toList();
        
        if (trashPosts.isEmpty()) {
            throw new RuntimeException("没有找到可删除的文章");
        }
        
        // 批量硬删除
        postRepository.deleteAll(trashPosts);
        
        log.info("批量硬删除文章完成，删除数量:{} 文章ID:{}", trashPosts.size(),
                trashPosts.stream().map(Post::getId).toList());
    }

    /**
     * 转换Post实体为PostDto
     */
    private PostDto convertToDto(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt())
                .content(post.getContent())
                .contentType(post.getContentType())
                .status(post.getStatus())
                .visibility(post.getVisibility())
                .password(post.getPassword())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .coverImageUrl(post.getCoverImageUrl())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
