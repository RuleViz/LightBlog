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
public class UserUpdateRequest {

    @Size(max = 50, message = "昵称长度不能超过50个字符")
    private String nickname;

    @Size(max = 500, message = "头像地址长度不能超过500个字符")
    private String avatarUrl;

    private Boolean isActive;
}


