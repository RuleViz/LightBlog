package com.xingmiao.blog.common.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {

    @Size(max = 100, message = "分类名称长度不能超过100个字符")
    private String name;

    @Size(max = 100, message = "分类别名长度不能超过100个字符")
    private String slug;

    private Long parentId;

    private Integer sortOrder;

    private Integer level;

    @Size(max = 1000, message = "分类描述长度不能超过1000个字符")
    private String description;
}


