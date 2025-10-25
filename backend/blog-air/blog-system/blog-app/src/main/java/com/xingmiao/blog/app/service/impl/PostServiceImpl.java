package com.xingmiao.blog.app.service.impl;

import com.xingmiao.blog.common.domain.entity.Category;
import com.xingmiao.blog.common.domain.entity.Post;
import com.xingmiao.blog.common.domain.entity.Tag;
import com.xingmiao.blog.common.dto.PostCreateRequest;
import com.xingmiao.blog.common.dto.PostDto;
import com.xingmiao.blog.common.dto.PostUpdateRequest;
import com.xingmiao.blog.app.repository.CategoryRepository;
import com.xingmiao.blog.app.repository.PostRepository;
import com.xingmiao.blog.app.repository.TagRepository;
import com.xingmiao.blog.app.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Value("${upload.path:uploads}")
    private String uploadPath;

    private static final Pattern IMAGE_URL_PATTERN = Pattern.compile("!\\[[^]]*]\\(([^)]+)\\)");


    @Override
    public PostDto create(PostCreateRequest request) {
        if (postRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new RuntimeException("当前Slug已经存在，Slug不能重复:" + request.getSlug());
        }
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("当前分类不存在,CategoryId:" + request.getCategoryId()));
        }
        Set<Tag> tags = resolveTags(request.getTagIds());
        Post post = Post.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .contentType(request.getContentType())
                .status(request.getStatus())
                .visibility(request.getVisibility())
                .password(request.getPassword())
                .category(category)
                .coverImageUrl(request.getCoverImageUrl())
                .tags(tags)
                .build();
        Post savedPost = postRepository.save(post);
        // 明文模式：不再生成访问口令记录
        // 刷新标签计数
        refreshTagPostCounts(tags);
        return convertToDto(savedPost);
    }

    @Override
    public PostDto update(Long id, PostUpdateRequest request) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在，ID:" + id));
        if (request.getSlug() != null && !request.getSlug().equals(existingPost.getSlug())) {
            if (postRepository.findBySlug(request.getSlug()).isPresent()) {
                throw new RuntimeException("当前Slug已经存在，Slug不能重复:" + request.getSlug());
            }
        }
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("当前分类不存在,CategoryId:" + request.getCategoryId()));
        }
        // 记录更新前后的标签集合以便刷新计数
        Set<Tag> beforeTags = existingPost.getTags() == null ? new HashSet<>() : new HashSet<>(existingPost.getTags());

        if (request.getTitle() != null) {
            existingPost.setTitle(request.getTitle());
        }
        if (request.getSlug() != null) {
            existingPost.setSlug(request.getSlug());
        }
        if (request.getExcerpt() != null) {
            existingPost.setExcerpt(request.getExcerpt());
        }
        if (request.getContent() != null) {
            existingPost.setContent(request.getContent());
        }
        if (request.getContentType() != null) {
            existingPost.setContentType(request.getContentType());
        }
        if (request.getStatus() != null) {
            existingPost.setStatus(request.getStatus());
        }
        if (request.getVisibility() != null) {
            existingPost.setVisibility(request.getVisibility());
        }
        if (request.getPassword() != null) {
            existingPost.setPassword(request.getPassword());
        }
        if (category != null) {
            existingPost.setCategory(category);
        }
        if (request.getCoverImageUrl() != null) {
            existingPost.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getTagIds() != null) {
            Set<Tag> newTags = resolveTags(request.getTagIds());
            existingPost.setTags(newTags);
        }
        Post updatedPost = postRepository.save(existingPost);

        // 明文模式：不再维护访问口令记录

        // 刷新前后所有涉及标签的计数
        Set<Tag> affected = new HashSet<>(beforeTags);
        if (updatedPost.getTags() != null) {
            affected.addAll(updatedPost.getTags());
        }
        refreshTagPostCounts(affected);

        return convertToDto(updatedPost);
    }

    @Override
    public void delete(Long id) {
        Post post = postRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("文章不存在，ID:" + id));
        // 记录受影响标签
        Set<Tag> affected = post.getTags() == null ? new HashSet<>() : new HashSet<>(post.getTags());
        
        // 清理文章相关图片
        cleanupPostImages(post);
        
        // 硬删除（物理删除）
        postRepository.delete(post);
        
        // 刷新标签计数
        refreshTagPostCounts(affected);
    }

    private void cleanupPostImages(Post post) {
        if (post == null) {
            return;
        }

        Set<String> urls = new LinkedHashSet<>();
        if (StringUtils.hasText(post.getCoverImageUrl())) {
            urls.add(post.getCoverImageUrl());
        }
        if (StringUtils.hasText(post.getContent())) {
            urls.addAll(extractImageUrls(post.getContent()));
        }

        urls.forEach(this::deleteFileSilently);
    }

    private List<String> extractImageUrls(String content) {
        List<String> urls = new ArrayList<>();
        if (!StringUtils.hasText(content)) {
            return urls;
        }
        Matcher matcher = IMAGE_URL_PATTERN.matcher(content);
        while (matcher.find()) {
            String url = matcher.group(1);
            if (StringUtils.hasText(url)) {
                urls.add(url.trim());
            }
        }
        return urls;
    }

    private void deleteFileSilently(String url) {
        if (!StringUtils.hasText(url)) {
            return;
        }

        try {
            String cleanedUrl = url.trim();
            // 处理 Markdown 中的引用 URL（可能包含多余的括号或引号）
            cleanedUrl = cleanedUrl.replaceAll("^[\"'()]+|[\"'()]+$", "");

            if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
                // 外部网络图片，不删除
                try {
                    URI uri = URI.create(cleanedUrl);
                    String path = uri.getPath();
                    if (StringUtils.hasText(path) && path.startsWith("/uploads/")) {
                        cleanedUrl = path;
                    } else {
                        return;
                    }
                } catch (Exception e) {
                    return;
                }
            }

            if (!cleanedUrl.startsWith("/uploads/")) {
                return; // 非本地上传文件，跳过
            }

            Path uploadBasePath = Paths.get(uploadPath);
            if (!uploadBasePath.isAbsolute()) {
                uploadBasePath = Paths.get(System.getProperty("user.dir"), uploadPath);
            }

            String relativePath = cleanedUrl.replaceFirst("^/uploads/?", "");
            Path filePath = uploadBasePath.resolve(relativePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (Exception ignored) {
            // 忽略删除失败，避免影响主流程
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PostDto> getById(Long id) {
        return postRepository.findByIdAndDeletedAtIsNull(id)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PostDto> getBySlug(String slug) {
        return postRepository.findBySlugAndStatusAndDeletedAtIsNull(slug, 
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> list(Pageable pageable) {
        return postRepository.findByDeletedAtIsNull(pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listByCategory(Long categoryId, Pageable pageable) {
        return postRepository.findByCategory_IdAndDeletedAtIsNull(categoryId, pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listByTag(Long tagId, Pageable pageable) {
        return postRepository.findByTags_IdAndDeletedAtIsNull(tagId, pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> searchByKeyword(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return postRepository.findByDeletedAtIsNull(pageable)
                    .map(this::convertToDto);
        }
        return postRepository.findByKeywordAndDeletedAtIsNull(keyword.trim(), pageable)
                .map(this::convertToDto);
    }

    // ========== 用户端专用方法实现 ==========
    
    /**
     * 获取用户端可见的文章可见性类型（公开和密码保护）
     */
    private java.util.List<com.xingmiao.blog.common.domain.enums.Visibility> getUserVisibleVisibilities() {
        return java.util.Arrays.asList(
                com.xingmiao.blog.common.domain.enums.Visibility.PUBLIC,
                com.xingmiao.blog.common.domain.enums.Visibility.PASSWORD
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listPublishedPosts(Pageable pageable) {
        return postRepository.findByStatusAndVisibilityInAndDeletedAtIsNull(
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED, 
                getUserVisibleVisibilities(), 
                pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listPublishedPostsByCategory(Long categoryId, Pageable pageable) {
        return postRepository.findByCategory_IdAndStatusAndVisibilityInAndDeletedAtIsNull(
                categoryId,
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED, 
                getUserVisibleVisibilities(), 
                pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listPublishedPostsByTag(Long tagId, Pageable pageable) {
        return postRepository.findByTags_IdAndStatusAndVisibilityInAndDeletedAtIsNull(
                tagId,
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED, 
                getUserVisibleVisibilities(), 
                pageable)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> searchPublishedPosts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return listPublishedPosts(pageable);
        }
        return postRepository.findByKeywordAndStatusAndVisibilityInAndDeletedAtIsNull(
                keyword.trim(),
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED, 
                getUserVisibleVisibilities(), 
                pageable)
                .map(this::convertToDto);
    }

    // ========== 统计方法实现 ==========
    
    @Override
    public long countAllPosts() {
        return postRepository.countByDeletedAtIsNull();
    }

    @Override
    public long countPublishedPosts() {
        return postRepository.countByStatusAndDeletedAtIsNull(
                com.xingmiao.blog.common.domain.enums.PostStatus.PUBLISHED);
    }

    @Override
    public long countDraftPosts() {
        return postRepository.countByStatusAndDeletedAtIsNull(
                com.xingmiao.blog.common.domain.enums.PostStatus.DRAFT);
    }

    private Set<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }
        return tagRepository.findAllById(tagIds).stream().collect(Collectors.toSet());
    }

    private void refreshTagPostCounts(Set<Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return;
        }
        for (Tag tag : tags) {
            long count = postRepository.countByTags_IdAndDeletedAtIsNull(tag.getId());
            tag.setPostCount((int) count);
            tagRepository.save(tag);
        }
    }

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
                .tags(post.getTags() == null ? null : post.getTags().stream().map(tag ->
                        com.xingmiao.blog.common.dto.TagDto.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .slug(tag.getSlug())
                                .color(tag.getColor())
                                .postCount(tag.getPostCount())
                                .createdAt(tag.getCreatedAt())
                                .updatedAt(tag.getUpdatedAt())
                                .build()
                ).collect(java.util.stream.Collectors.toList()))
                .build();
    }

    @Override
    public boolean existsById(Long id) {
        return postRepository.existsById(id);
    }

    @Override
    public void incrementViewCount(Long id) {
        postRepository.incrementViewCount(id);
    }
}
