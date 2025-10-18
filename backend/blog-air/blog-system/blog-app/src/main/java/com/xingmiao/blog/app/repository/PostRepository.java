package com.xingmiao.blog.app.repository;

import com.xingmiao.blog.common.domain.entity.Post;
import com.xingmiao.blog.common.domain.enums.PostStatus;
import com.xingmiao.blog.common.domain.enums.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findBySlug(String slug);
    Page<Post> findByCategory_Id(Long categoryId, Pageable pageable);
    Page<Post> findByStatusAndVisibility(PostStatus status, Visibility visibility, Pageable pageable);
    
    /**
     * 根据ID查询Post并预加载Category，避免懒加载问题
     */
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Post> findByIdWithCategory(@Param("id") Long id);
    
    // ========== 软删除相关查询方法 ==========
    
    /**
     * 查询未删除的文章（正常文章）
     */
    Page<Post> findByDeletedAtIsNull(Pageable pageable);
    
    /**
     * 查询回收站中的文章（已软删除）
     */
    Page<Post> findByDeletedAtIsNotNull(Pageable pageable);
    
    /**
     * 根据ID查询未删除的文章
     */
    Optional<Post> findByIdAndDeletedAtIsNull(Long id);
    
    /**
     * 根据ID查询回收站中的文章
     */
    Optional<Post> findByIdAndDeletedAtIsNotNull(Long id);
    
    /**
     * 根据slug查询未删除的文章
     */
    Optional<Post> findBySlugAndDeletedAtIsNull(String slug);
    
    /**
     * 按分类查询未删除的文章
     */
    Page<Post> findByCategory_IdAndDeletedAtIsNull(Long categoryId, Pageable pageable);
    
    /**
     * 按状态和可见性查询未删除的文章
     */
    Page<Post> findByStatusAndVisibilityAndDeletedAtIsNull(PostStatus status, Visibility visibility, Pageable pageable);
    
    /**
     * 统计指定分类下未删除的文章数量
     */
    long countByCategory_IdAndDeletedAtIsNull(Long categoryId);
    
    /**
     * 查找回收站中指定分类下的所有文章
     */
    List<Post> findByCategory_IdAndDeletedAtIsNotNull(Long categoryId);

    Page<Post> findByTags_IdAndDeletedAtIsNull(Long tagId, Pageable pageable);
    long countByTags_IdAndDeletedAtIsNull(Long tagId);

    /**
     * 浏览量自增 1（原子性更新）
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = COALESCE(p.viewCount, 0) + 1 WHERE p.id = :id")
    int incrementViewCount(@Param("id") Long id);

    /**
     * 根据关键词搜索文章（标题或内容包含关键词）
     */
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByKeywordAndDeletedAtIsNull(@Param("keyword") String keyword, Pageable pageable);

    // ========== 用户端专用查询方法（只显示已发布的文章） ==========
    
    /**
     * 根据分类查询用户端文章（只显示已发布的公开文章）
     */
    Page<Post> findByCategory_IdAndStatusAndVisibilityAndDeletedAtIsNull(Long categoryId, PostStatus status, Visibility visibility, Pageable pageable);
    
    /**
     * 根据标签查询用户端文章（只显示已发布的公开文章）
     */
    Page<Post> findByTags_IdAndStatusAndVisibilityAndDeletedAtIsNull(Long tagId, PostStatus status, Visibility visibility, Pageable pageable);
    
    /**
     * 根据关键词搜索用户端文章（只显示已发布的公开文章）
     */
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND p.status = :status AND p.visibility = :visibility AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByKeywordAndStatusAndVisibilityAndDeletedAtIsNull(@Param("keyword") String keyword, 
                                                                     @Param("status") PostStatus status, 
                                                                     @Param("visibility") Visibility visibility, 
                                                                     Pageable pageable);
    
    /**
     * 根据slug查询用户端文章（只显示已发布的文章，包括密码保护的）
     */
    Optional<Post> findBySlugAndStatusAndDeletedAtIsNull(String slug, PostStatus status);
    
    /**
     * 查询已发布的文章（包括公开和密码保护，排除私有）
     */
    Page<Post> findByStatusAndVisibilityInAndDeletedAtIsNull(PostStatus status, java.util.List<Visibility> visibilities, Pageable pageable);
    
    /**
     * 根据分类查询已发布的文章（包括公开和密码保护，排除私有）
     */
    Page<Post> findByCategory_IdAndStatusAndVisibilityInAndDeletedAtIsNull(Long categoryId, PostStatus status, java.util.List<Visibility> visibilities, Pageable pageable);
    
    /**
     * 根据标签查询已发布的文章（包括公开和密码保护，排除私有）
     */
    Page<Post> findByTags_IdAndStatusAndVisibilityInAndDeletedAtIsNull(Long tagId, PostStatus status, java.util.List<Visibility> visibilities, Pageable pageable);
    
    /**
     * 根据关键词搜索已发布的文章（包括公开和密码保护，排除私有）
     */
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND p.status = :status AND p.visibility IN :visibilities AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByKeywordAndStatusAndVisibilityInAndDeletedAtIsNull(@Param("keyword") String keyword, 
                                                                       @Param("status") PostStatus status, 
                                                                       @Param("visibilities") java.util.List<Visibility> visibilities, 
                                                                       Pageable pageable);
    
    // ========== 统计查询方法 ==========
    
    /**
     * 统计所有未删除的文章数量
     */
    long countByDeletedAtIsNull();
    
    /**
     * 统计已发布的文章数量
     */
    long countByStatusAndDeletedAtIsNull(PostStatus status);
    
    /**
     * 统计指定状态的文章数量
     */
    long countByStatusAndVisibilityAndDeletedAtIsNull(PostStatus status, Visibility visibility);
}


