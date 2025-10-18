package com.xingmiao.blog.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.xingmiao.blog")
@EnableJpaRepositories(basePackages = "com.xingmiao.blog.app.repository")
@EntityScan(basePackages = "com.xingmiao.blog.common.domain.entity")
@EnableAsync
public class BlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }

}
