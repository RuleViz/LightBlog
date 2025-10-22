package com.xingmiao.blog.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private Boolean isActive;
    private String description;
    private Integer postCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


