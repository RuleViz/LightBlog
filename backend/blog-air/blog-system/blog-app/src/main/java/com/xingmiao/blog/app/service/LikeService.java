package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.domain.enums.LikeTargetType;

public interface LikeService {

    void like(LikeTargetType targetType, Long targetId, String ipAddress, String userAgent);

    void unlike(LikeTargetType targetType, Long targetId, String ipAddress);

    long count(LikeTargetType targetType, Long targetId);

    boolean isLiked(LikeTargetType targetType, Long targetId, String ipAddress);
}


