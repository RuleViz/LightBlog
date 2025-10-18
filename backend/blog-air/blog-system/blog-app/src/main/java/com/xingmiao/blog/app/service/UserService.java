package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.UserCreateRequest;
import com.xingmiao.blog.common.dto.UserDto;
import com.xingmiao.blog.common.dto.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    UserDto create(UserCreateRequest request);
    UserDto update(Long id, UserUpdateRequest request);
    void delete(Long id);
    Optional<UserDto> getById(Long id);
    Optional<UserDto> getByUsername(String username);
    Page<UserDto> list(Pageable pageable);
}


