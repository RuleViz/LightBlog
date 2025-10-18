package com.xingmiao.blog.app.service;

import com.xingmiao.blog.common.dto.GithubContributionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class GithubService {

    private final HttpClient httpClient;
    private static final String GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

    @Value("${github.token:}")
    private String githubToken;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GithubService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }



    public List<GithubContributionResponse.ContributionData> getContributionsData(String username, String from, String to) {
        try {
            return fetchContributionsDataGraphQL(username, from, to);
        } catch (Exception e) {
            log.error("获取贡献数据失败: {}", e.getMessage(), e);
            throw new RuntimeException("获取贡献数据失败: " + e.getMessage());
        }
    }

    private List<GithubContributionResponse.ContributionData> fetchContributionsDataGraphQL(String username, String from, String to) throws IOException, InterruptedException {
        if (githubToken == null || githubToken.isBlank()) {
            throw new RuntimeException("未配置GitHub Token，请在配置中设置 github.token 或环境变量 GITHUB_TOKEN");
        }

        String query = "query($login:String!, $from:DateTime, $to:DateTime){" +
                "user(login:$login){" +
                "contributionsCollection(from:$from, to:$to){" +
                "contributionCalendar{weeks{contributionDays{date contributionCount color}}}}}}";

        String variables = String.format("{\"login\":\"%s\"%s%s}",
                username,
                from != null ? ",\"from\":\"" + from + "T00:00:00Z\"" : "",
                to != null ? ",\"to\":\"" + to + "T23:59:59Z\"" : "");

        String bodyJson = String.format("{\"query\":\"%s\",\"variables\":%s}",
                query.replace("\"", "\\\""), variables);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GITHUB_GRAPHQL_URL))
                .header("Authorization", "Bearer " + githubToken)
                .header("User-Agent", "xm-blog/1.0")
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("GitHub GraphQL 状态码:" + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        if (root.has("errors")) {
            String msg = root.get("errors").toString();
            throw new RuntimeException("GitHub GraphQL 错误:" + msg);
        }

        List<GithubContributionResponse.ContributionData> data = new ArrayList<>();
        JsonNode weeks = root.path("data").path("user").path("contributionsCollection").path("contributionCalendar").path("weeks");
        if (weeks.isMissingNode()) {
            return data;
        }
        for (JsonNode week : weeks) {
            for (JsonNode day : week.path("contributionDays")) {
                String date = day.path("date").asText("");
                if (!date.isEmpty()) {
                    int count = day.path("contributionCount").asInt(0);
                    // 根据贡献数粗略映射 level（0..4）
                    int level = count == 0 ? 0 : (count <= 2 ? 1 : (count <= 5 ? 2 : (count <= 10 ? 3 : 4)));
                    data.add(GithubContributionResponse.ContributionData.builder()
                            .date(date)
                            .count(count)
                            .level(level)
                            .build());
                }
            }
        }
        return data;
    }



}
