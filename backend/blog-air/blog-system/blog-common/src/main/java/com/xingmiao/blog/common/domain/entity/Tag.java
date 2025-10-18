package com.xingmiao.blog.common.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tags",
       indexes = {
               @Index(name = "idx_post_count", columnList = "post_count")
       },
       uniqueConstraints = {
               @UniqueConstraint(name = "uk_tags_name", columnNames = {"name"}),
               @UniqueConstraint(name = "uk_tags_slug", columnNames = {"slug"})
       })
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "slug", nullable = false, length = 50)
    private String slug;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "post_count")
    private Integer postCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (postCount == null) {
            postCount = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


