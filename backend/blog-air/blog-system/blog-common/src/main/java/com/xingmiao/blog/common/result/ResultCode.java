package com.xingmiao.blog.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 响应状态码枚举
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    // 成功
    SUCCESS(200, "操作成功"),

    // 客户端错误 4xx
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权访问"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    CONFLICT(409, "资源冲突"),
    VALIDATION_ERROR(422, "参数校验失败"),

    // 服务器错误 5xx
    ERROR(500, "系统内部错误"),
    SERVICE_UNAVAILABLE(503, "服务暂不可用"),

    // 业务错误 6xxx
    BUSINESS_ERROR(6000, "业务处理失败"),
    
    // 文章相关 61xx
    POST_NOT_FOUND(6101, "文章不存在"),
    POST_ALREADY_EXISTS(6102, "文章已存在"),
    POST_PERMISSION_DENIED(6103, "文章访问权限不足"),
    POST_PASSWORD_REQUIRED(6104, "文章需要密码访问"),
    POST_PASSWORD_INCORRECT(6105, "文章密码错误"),
    
    // 分类相关 62xx
    CATEGORY_NOT_FOUND(6201, "分类不存在"),
    CATEGORY_ALREADY_EXISTS(6202, "分类已存在"),
    CATEGORY_HAS_POSTS(6203, "分类下存在文章，无法删除"),
    
    // 标签相关 63xx
    TAG_NOT_FOUND(6301, "标签不存在"),
    TAG_ALREADY_EXISTS(6302, "标签已存在"),
    
    // 用户相关 64xx
    USER_NOT_FOUND(6401, "用户不存在"),
    USER_ALREADY_EXISTS(6402, "用户已存在"),
    USER_DISABLED(6403, "用户已被禁用"),
    
    // AI相关 65xx
    AI_SERVICE_ERROR(6501, "AI服务异常"),
    KNOWLEDGE_BASE_NOT_FOUND(6502, "知识库不存在"),
    KNOWLEDGE_BASE_SYNC_FAILED(6503, "知识库同步失败"),
    AI_QA_DISABLED(6504, "该分类未启用AI问答"),
    
    // 文件相关 66xx
    FILE_UPLOAD_ERROR(6601, "文件上传失败"),
    FILE_NOT_FOUND(6602, "文件不存在"),
    FILE_TYPE_NOT_ALLOWED(6603, "文件类型不支持"),
    FILE_SIZE_EXCEEDED(6604, "文件大小超出限制");

    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 消息
     */
    private final String message;
}