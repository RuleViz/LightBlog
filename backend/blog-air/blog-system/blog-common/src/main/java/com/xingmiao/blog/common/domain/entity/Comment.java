package com.xingmiao.blog.common.domain.entity;

import com.xingmiao.blog.common.domain.enums.CommentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "comments",
       indexes = {
               @Index(name = "idx_post_id", columnList = "post_id"),
               @Index(name = "idx_parent_id", columnList = "parent_id"),
               @Index(name = "idx_status", columnList = "status"),
               @Index(name = "idx_created_at", columnList = "created_at")
       })
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private CommentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_comments_post_id"))
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id",
            foreignKey = @ForeignKey(name = "fk_comments_parent_id"))
    private Comment parent;

    @Column(name = "author_name", length = 100, nullable = false)
    private String authorName;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}


