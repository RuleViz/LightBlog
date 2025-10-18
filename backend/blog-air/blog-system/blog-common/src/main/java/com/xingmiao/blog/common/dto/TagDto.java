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
public class TagDto {
    private Long id;
    private String name;
    private String slug;
    private String color;
    private Integer postCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
