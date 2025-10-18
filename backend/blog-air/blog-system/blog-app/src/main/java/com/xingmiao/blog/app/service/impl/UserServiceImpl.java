package com.xingmiao.blog.app.service.impl;

import com.xingmiao.blog.common.domain.entity.User;
import com.xingmiao.blog.common.dto.UserCreateRequest;
import com.xingmiao.blog.common.dto.UserDto;
import com.xingmiao.blog.common.dto.UserUpdateRequest;
import com.xingmiao.blog.app.repository.UserRepository;
import com.xingmiao.blog.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserDto create(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在: " + request.getUsername());
        }
        User user = User.builder()
                .username(request.getUsername())
                .nickname(request.getNickname())
                .avatarUrl(request.getAvatarUrl())
                .isActive(request.getIsActive())
                .build();
        return toDto(userRepository.save(user));
    }

    @Override
    public UserDto update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        return toDto(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getById(Long id) {
        return userRepository.findById(id).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getByUsername(String username) {
        return userRepository.findByUsername(username).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}


