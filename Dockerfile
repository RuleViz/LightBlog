# 第一阶段：编译构建
FROM maven:3.9.4-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# 复制 pom.xml 和项目文件
COPY backend/blog-air/blog-system ./

# 构建项目
RUN mvn clean package -DskipTests=true

# 第二阶段：运行镜像
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/blog-app/target/*.jar app.jar

# 创建上传文件夹和日志文件夹
RUN mkdir -p /app/uploads /app/logs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
