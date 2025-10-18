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
@Table(name = "categories",
       indexes = {
               @Index(name = "idx_parent_id", columnList = "parent_id"),
               @Index(name = "idx_level", columnList = "level")
       },
       uniqueConstraints = {
               @UniqueConstraint(name = "uk_categories_slug", columnNames = {"slug"})
       })
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, length = 100)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id",
            foreignKey = @ForeignKey(name = "fk_categories_parent_id"))
    private Category parent;

    @Column(name = "level", nullable = false)
    private Integer level;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

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
        if (level == null) {
            level = 1;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


