package com.xingmiao.blog.common.result;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 分页结果类
 * 
 * @param <T> 数据类型
 */
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResult<T> extends Result<List<T>> {

    /**
     * 当前页码
     */
    private Integer page;

    /**
     * 每页大小
     */
    private Integer size;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 总页数
     */
    private Integer pages;

    /**
     * 是否有下一页
     */
    private Boolean hasNext;

    /**
     * 是否有上一页
     */
    private Boolean hasPrevious;

    public PageResult() {
        super();
    }

    public PageResult(Integer code, String message) {
        super(code, message);
    }

    public PageResult(List<T> data, Integer page, Integer size, Long total) {
        super(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data);
        this.page = page;
        this.size = size;
        this.total = total;
        this.pages = (int) Math.ceil((double) total / size);
        this.hasNext = page < this.pages;
        this.hasPrevious = page > 1;
    }

    /**
     * 成功返回分页数据
     */
    public static <T> PageResult<T> success(List<T> data, Integer page, Integer size, Long total) {
        return new PageResult<>(data, page, size, total);
    }

    /**
     * 空分页数据
     */
    public static <T> PageResult<T> empty(Integer page, Integer size) {
        return new PageResult<>(List.of(), page, size, 0L);
    }

    /**
     * 失败返回
     */
    public static <T> PageResult<T> pageError(String message) {
        PageResult<T> result = new PageResult<>();
        result.setCode(ResultCode.ERROR.getCode());
        result.setMessage(message);
        return result;
    }

    /**
     * 失败返回（指定错误码）
     */
    public static <T> PageResult<T> pageError(ResultCode resultCode) {
        PageResult<T> result = new PageResult<>();
        result.setCode(resultCode.getCode());
        result.setMessage(resultCode.getMessage());
        return result;
    }
}