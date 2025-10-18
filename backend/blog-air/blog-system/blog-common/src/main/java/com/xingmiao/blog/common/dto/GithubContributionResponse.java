package com.xingmiao.blog.common.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GithubContributionResponse {
    
    private boolean success;
    private String username;
    private String svg;
    private List<ContributionData> data;
    private String error;
    
    @Data
    @Builder
    public static class ContributionData {
        private String date;
        private int count;
        private int level;
    }
}
