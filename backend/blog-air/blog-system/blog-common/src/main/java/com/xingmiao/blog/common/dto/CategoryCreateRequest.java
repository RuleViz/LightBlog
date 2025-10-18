package com.xingmiao.blog.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100个字符")
    private String name;

    @NotBlank(message = "分类别名不能为空")
    @Size(max = 100, message = "分类别名长度不能超过100个字符")
    private String slug;

    private Long parentId;

    private Integer sortOrder;

    @Size(max = 1000, message = "分类描述长度不能超过1000个字符")
    private String description;
}


