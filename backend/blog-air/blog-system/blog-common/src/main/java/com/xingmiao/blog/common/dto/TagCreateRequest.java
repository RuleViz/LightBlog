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
public class TagCreateRequest {
    
    @NotBlank(message = "标签名称不能为空")
    @Size(max = 50, message = "标签名称长度不能超过50个字符")
    private String name;
    
    @NotBlank(message = "标签别名不能为空")
    @Size(max = 50, message = "标签别名长度不能超过50个字符")
    private String slug;
    
    @Size(max = 7, message = "颜色代码长度不能超过7个字符")
    private String color;
}
