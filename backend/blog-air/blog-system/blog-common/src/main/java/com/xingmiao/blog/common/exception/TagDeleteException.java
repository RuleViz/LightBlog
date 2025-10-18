package com.xingmiao.blog.common.exception;

public class TagDeleteException extends RuntimeException {

    private final long postCount;

    public TagDeleteException(long postCount) {
        super("无法删除标签，该标签下还有 " + postCount + " 篇未删除的文章。请先将文章移入回收站后再删除标签。");
        this.postCount = postCount;
    }

    public long getPostCount() {
        return postCount;
    }
}
