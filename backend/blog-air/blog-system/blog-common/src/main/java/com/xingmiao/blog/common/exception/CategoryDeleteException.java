package com.xingmiao.blog.common.exception;

/**
 * 自定义异常：删除分类失败。
 */
public class CategoryDeleteException extends RuntimeException {

    private final long postCount;

    public CategoryDeleteException(long postCount) {
        super("无法删除分类，该分类下还有 " + postCount + " 篇未删除的文章。请先将文章移入回收站后再删除分类。");
        this.postCount = postCount;
    }

    public long getPostCount() {
        return postCount;
    }
}


