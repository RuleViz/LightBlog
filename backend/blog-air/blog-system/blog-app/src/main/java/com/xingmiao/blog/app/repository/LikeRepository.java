package com.xingmiao.blog.app.repository;

import com.xingmiao.blog.common.domain.entity.Like;
import com.xingmiao.blog.common.domain.enums.LikeTargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    long countByTargetTypeAndTargetId(LikeTargetType targetType, Long targetId);

    boolean existsByIpAddressAndTargetTypeAndTargetId(String ipAddress, LikeTargetType targetType, Long targetId);

    Optional<Like> findByIpAddressAndTargetTypeAndTargetId(String ipAddress, LikeTargetType targetType, Long targetId);

}


