package com.xingmiao.blog.app.service.impl;

import com.xingmiao.blog.common.domain.entity.Like;
import com.xingmiao.blog.common.domain.enums.LikeTargetType;
import com.xingmiao.blog.app.repository.LikeRepository;
import com.xingmiao.blog.app.repository.PostRepository;
import com.xingmiao.blog.app.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public void like(LikeTargetType targetType, Long targetId, String ipAddress, String userAgent) {
        if (likeRepository.existsByIpAddressAndTargetTypeAndTargetId(ipAddress, targetType, targetId)) {
            return;
        }
        Like like = Like.builder()
                .targetType(targetType)
                .targetId(targetId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .build();
        likeRepository.save(like);
        
        // 如果是文章点赞，更新文章的点赞数
        if (targetType == LikeTargetType.POST) {
            postRepository.findById(targetId).ifPresent(post -> {
                post.setLikeCount((post.getLikeCount() != null ? post.getLikeCount() : 0L) + 1);
                postRepository.save(post);
            });
        }
    }

    @Override
    @Transactional
    public void unlike(LikeTargetType targetType, Long targetId, String ipAddress) {
        likeRepository.findByIpAddressAndTargetTypeAndTargetId(ipAddress, targetType, targetId)
                .ifPresent(like -> {
                    likeRepository.delete(like);
                    
                    // 如果是文章取消点赞，更新文章的点赞数
                    if (targetType == LikeTargetType.POST) {
                        postRepository.findById(targetId).ifPresent(post -> {
                            Long currentLikeCount = post.getLikeCount() != null ? post.getLikeCount() : 0L;
                            post.setLikeCount(Math.max(0L, currentLikeCount - 1));
                            postRepository.save(post);
                        });
                    }
                });
    }

    @Override
    @Transactional(readOnly = true)
    public long count(LikeTargetType targetType, Long targetId) {
        return likeRepository.countByTargetTypeAndTargetId(targetType, targetId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLiked(LikeTargetType targetType, Long targetId, String ipAddress) {
        return likeRepository.existsByIpAddressAndTargetTypeAndTargetId(ipAddress, targetType, targetId);
    }

}


