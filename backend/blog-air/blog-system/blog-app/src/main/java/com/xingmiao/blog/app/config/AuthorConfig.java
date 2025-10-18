package com.xingmiao.blog.app.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 博客作者配置类
 * 
 * <p>从配置文件中读取博客作者信息，简单直接。</p>
 * 
 * @author 星喵博客系统
 * @version 1.0.0
 * @since 2024-01-01
 */
@Data
@Component
@ConfigurationProperties(prefix = "blog.author")
public class AuthorConfig {
    
    /**
     * 作者用户名
     */
    private String username;
    
    /**
     * 作者昵称
     */
    private String nickname;
    
    /**
     * 作者简介
     */
    private String bio;
    
    /**
     * 作者头像URL
     */
    private String avatarUrl;
    
    /**
     * 作者邮箱
     */
    private String email;
    
    /**
     * 作者网站
     */
    private String website;
    
    /**
     * 作者密码（明文，仅用于简单验证）
     */
    private String password;
    
    /**
     * 是否启用密码验证
     */
    private boolean passwordEnabled = true;
    
    /**
     * GitHub 用户名
     */
    private String githubUsername;
}
