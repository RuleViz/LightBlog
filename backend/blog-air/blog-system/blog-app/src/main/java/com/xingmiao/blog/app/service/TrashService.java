package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.PostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * 回收站服务接口
 * 
 * <p>提供回收站文章的恢复、删除和查询功能。</p>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
public interface TrashService {
    
    /**
     * 分页查询回收站中的文章
     * 
     * @param pageable 分页参数
     * @return 分页的文章列表
     */
    Page<PostDto> listPosts(Pageable pageable);
    
    /**
     * 获取回收站中的文章详情
     * 
     * @param id 文章ID
     * @return 文章详情，如果不存在返回空
     */
    Optional<PostDto> getPost(Long id);
    
    /**
     * 恢复文章（从回收站移出）
     * 
     * @param id 文章ID
     */
    void restorePost(Long id);
    
    /**
     * 硬删除文章（从回收站彻底删除）
     * 
     * @param id 文章ID
     */
    void hardDeletePost(Long id);
    
    /**
     * 批量恢复文章
     * 
     * @param ids 文章ID列表
     */
    void batchRestore(List<Long> ids);
    
    /**
     * 批量硬删除文章
     * 
     * @param ids 文章ID列表
     */
    void batchHardDelete(List<Long> ids);
}
