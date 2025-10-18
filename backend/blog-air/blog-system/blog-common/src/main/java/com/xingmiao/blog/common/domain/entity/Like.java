package com.xingmiao.blog.common.domain.entity;

import com.xingmiao.blog.common.domain.enums.LikeTargetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "likes",
       indexes = {
               @Index(name = "idx_target", columnList = "target_type,target_id"),
               @Index(name = "idx_ip_address", columnList = "ip_address"),
               @Index(name = "idx_created_at", columnList = "created_at")
       },
       uniqueConstraints = {
               @UniqueConstraint(name = "uk_ip_target", columnNames = {"ip_address", "target_type", "target_id"})
       })
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", length = 20, nullable = false)
    private LikeTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "ip_address", length = 45, nullable = false)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}


