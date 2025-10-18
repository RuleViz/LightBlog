package com.xingmiao.blog.app.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 文件上传控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
@Tag(name = "文件上传", description = "文件上传管理接口")
public class FileUploadController {

    @Value("${upload.path:uploads}")
    private String uploadPath;

    @Value("${upload.max-file-size:5MB}")
    private String maxFileSize;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    @PostMapping("/image")
    @Operation(summary = "上传图片", description = "上传文章封面图片或其他图片")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 验证文件
            validateFile(file);

            // 生成文件名和路径
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String fileName = generateFileName(extension);
            
            // 按日期创建目录
            String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            
            // 使用绝对路径，如果配置的是相对路径，则转换为项目根目录下的绝对路径
            Path uploadBasePath = Paths.get(uploadPath);
            if (!uploadBasePath.isAbsolute()) {
                // 获取项目根目录
                String projectRoot = System.getProperty("user.dir");
                uploadBasePath = Paths.get(projectRoot, uploadPath);
            }
            
            Path uploadDir = uploadBasePath.resolve(dateFolder);
            Files.createDirectories(uploadDir);

            // 保存文件
            Path filePath = uploadDir.resolve(fileName);
            file.transferTo(filePath.toFile());

            // 返回访问URL
            String fileUrl = "/uploads/" + dateFolder.replace("\\", "/") + "/" + fileName;
            
            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", fileName);
            response.put("originalName", originalFilename);
            response.put("size", file.getSize());
            
            log.info("文件上传成功: {} -> {}", fileUrl, filePath.toAbsolutePath());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("文件验证失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "文件上传失败"));
        }
    }

    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过5MB");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("只支持 JPG、PNG、WEBP、GIF 格式的图片");
        }

        // 验证文件扩展名
        String extension = getFileExtension(file.getOriginalFilename());
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("不支持的文件格式");
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return null;
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * 生成唯一文件名
     */
    private String generateFileName(String extension) {
        return UUID.randomUUID().toString().replace("-", "") + "." + extension;
    }
}

