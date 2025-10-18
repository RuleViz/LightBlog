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
public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(max = 50, message = "用户名长度不能超过50个字符")
    private String username;

    @Size(max = 50, message = "昵称长度不能超过50个字符")
    private String nickname;

    @Size(max = 500, message = "头像地址长度不能超过500个字符")
    private String avatarUrl;

    private Boolean isActive;
}


