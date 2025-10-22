# Docker 部署指南 - Blog-Spring_AI 项目

本指南将详细介绍如何在 Debian 12 服务器上使用 Docker 和 Docker Compose 部署 Blog-Spring_AI 项目。

**前置条件**：Docker、Docker Compose、Git 已安装，项目代码已上传到 GitHub

---

## 一、部署前的准备工作

### 1. 在本地构建前端（重要！）

在你的电脑上执行：

```bash
cd frontend
npm install
npm run build
cd ..
```

这会生成 `frontend/dist/` 文件夹，包含生产环境的前端静态文件。

### 2. 提交前端文件到 GitHub

```bash
git add frontend/dist
git commit -m "build: frontend production build"
git push
```

**为什么**：服务器通过 Git 克隆项目，前端构建文件必须在 GitHub 上。

### 3. 生成敏感信息

生成以下信息供后续使用（**不要在 GitHub 中提交这些**）：

```bash
# 生成 JWT Secret（复制输出结果）
openssl rand -base64 32

# 生成强密码（示例）
# MySQL 密码：A2b3C4d5E6f7_G8h9I0j
# 管理员密码：P1q2R3s4_T5u6V7w8X9y0
```

### 4. 验证项目结构

确保项目中包含以下文件：

```
Blog-Spring_AI/
├── Dockerfile ✓
├── docker-compose.yml ✓
├── init.sql ✓
├── mysql/custom.cnf ✓
├── nginx/nginx.conf ✓
├── frontend/dist/ ✓（需要构建）
├── backend/blog-air/blog-system/ ✓
```

---

## 二、服务器端部署步骤

### 步骤 1：连接到服务器并验证环境

```bash
# SSH 连接到服务器
ssh root@your_server_ip

# 验证 Docker 已安装
docker --version
# 预期输出：Docker version 24.x.x 或更高

# 验证 Docker Compose 已安装
docker compose version
# 预期输出：Docker Compose version 2.x.x 或更高

# 验证 Git 已安装
git --version

# 检查磁盘空间（至少需要 10GB）
df -h /opt
```

### 步骤 2：创建项目目录并克隆代码

```bash
# 创建项目目录
mkdir -p /opt
cd /opt

# 克隆项目代码（替换为你的仓库地址）
git clone https://github.com/YOUR_USERNAME/Blog-Spring_AI.git
cd Blog-Spring_AI

# 验证项目结构
ls -la
```

### 步骤 3：创建 .env 环境配置文件

这个文件包含所有敏感信息，**不要提交到 Git**。

```bash
# 创建 .env 文件
cat > .env << 'EOF'
# ============================
# 数据库配置
# ============================
MYSQL_ROOT_PASSWORD=your_strong_mysql_root_password_here
MYSQL_PASSWORD=your_strong_mysql_user_password_here

# ============================
# 应用核心配置
# ============================
# JWT 密钥，至少 32 位随机字符串
BLOG_JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_here

# 博客后台管理员的初始登录密码
MANAGE_PASSWORD=

# ============================
# API 密钥（可选）
# ============================
# 用于获取 GitHub 贡献图的 Token
GITHUB_TOKEN=

# DeepSeek 或其他兼容 OpenAI 格式的 AI 服务 API Key
DEEPSEEK_KEY=
EOF

# 验证文件已创建
cat .env

# 设置文件权限（安全最佳实践）
chmod 600 .env
```

**配置说明**：

- **MYSQL_ROOT_PASSWORD** 和 **MYSQL_PASSWORD**：使用强密码（16+ 字符，包含大小写字母、数字、特殊符号）
- **BLOG_JWT_SECRET**：使用 `openssl rand -base64 32` 生成
- **MANAGE_PASSWORD**：管理后台登录密码（当前设置为：`zalaohuang66`）
- **GITHUB_TOKEN**：已配置为你的 GitHub Token
- **DEEPSEEK_KEY**：已配置为你的 DeepSeek API Key

### 步骤 4：构建前端（如果还没构建）

如果本地已构建并通过 Git 上传，可以跳过此步骤。

```bash
# 检查前端是否已构建
ls -la frontend/dist/

# 如果不存在，需要在服务器上构建
# 1. 安装 Node.js（如果还没安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt update
apt install -y nodejs

# 2. 验证 Node.js 已安装
node --version
npm --version

# 3. 构建前端
cd frontend
npm install
npm run build
cd ..

# 4. 验证构建完成
ls -la frontend/dist/
# 应该看到 index.html 和 assets 文件夹
```

### 步骤 5：验证所有必需文件

```bash
# 在项目根目录执行
cd /opt/Blog-Spring_AI

# 检查所有必需的文件
echo "检查必需的文件..."

required_files=(
  "Dockerfile"
  "docker-compose.yml"
  "init.sql"
  "mysql/custom.cnf"
  "nginx/nginx.conf"
  "frontend/dist/index.html"
  "backend/blog-air/blog-system/pom.xml"
  ".env"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (缺失！)"
  fi
done
```

### 步骤 6：启动 Docker 容器

```bash
# 确保在项目根目录
cd /opt/Blog-Spring_AI

# 构建并启动所有容器（-d 表示后台运行）
docker compose up -d

# 查看容器启动进度
docker compose ps

# 应该看到类似的输出：
# NAME              IMAGE                          STATUS
# blog-mysql        mysql:8.0                      Up (health: starting)
# blog-backend      blog-spring_ai-backend:latest  Up (health: starting)
# blog-nginx        nginx:alpine                   Up
```

### 步骤 7：等待服务完全启动

```bash
# 等待 30-60 秒，让服务完全初始化
sleep 30

# 再次检查容器状态
docker compose ps

# 查看日志检查是否有错误
docker compose logs

# 特别查看后端启动日志
docker compose logs backend

# 预期看到：Spring Boot 应用启动成功的日志
```

### 步骤 8：验证部署结果

```bash
# 1. 查看所有容器的详细状态
docker compose ps -a

# 2. 检查 MySQL 是否正常
docker compose logs mysql | tail -20

# 3. 检查后端服务是否正常
docker compose logs backend | tail -30

# 4. 测试 API 可用性
curl http://localhost/api/health
# 或从本地测试（替换 your_server_ip）
curl http://your_server_ip/api/health
```

### 步骤 9：在浏览器中访问应用

用浏览器访问以下地址（替换 `your_server_ip` 为实际的服务器 IP）：

| 地址 | 说明 |
|------|------|
| `http://your_server_ip` | 博客首页 |
| `http://your_server_ip/admin` | 管理后台 |
| `http://your_server_ip/api/doc.html` | API 文档 |

**管理员登录信息**：
- 用户名：`admin`
- 密码：你在 `.env` 中设置的 `MANAGE_PASSWORD` （当前为：`zalaohuang66`）

---

## 三、常用管理命令

### 查看服务状态

```bash
# 查看所有容器状态
docker compose ps

# 查看特定容器的状态
docker compose ps mysql
docker compose ps backend
docker compose ps nginx

# 查看容器实时统计信息
docker compose stats
```

### 查看日志

```bash
# 查看所有服务的日志
docker compose logs

# 实时跟踪所有服务的日志
docker compose logs -f

# 查看特定服务的日志
docker compose logs backend
docker compose logs mysql
docker compose logs nginx

# 查看最后 50 行日志
docker compose logs backend | tail -50

# 实时跟踪后端日志
docker compose logs -f backend
```

### 启动/停止/重启

```bash
# 启动所有容器（后台模式）
docker compose up -d

# 停止所有容器（保留容器，保留数据）
docker compose stop

# 启动已停止的容器
docker compose start

# 重启所有容器
docker compose restart

# 重启特定容器
docker compose restart backend
docker compose restart mysql

# 停止并删除所有容器（保留数据）
docker compose down

# 停止、删除容器和数据卷（危险：会删除所有数据库数据！）
docker compose down -v
```

### 进入容器执行命令

```bash
# 进入后端容器的 shell
docker compose exec backend sh

# 进入 MySQL 容器的 shell
docker compose exec mysql bash

# 连接到 MySQL 数据库（需要输入密码）
docker compose exec mysql mysql -u bloguser -p

# 在 MySQL 中执行命令
docker compose exec mysql mysql -u bloguser -pYOUR_PASSWORD blog -e "show tables;"
```

### 更新代码和重新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 如果前端有更新
cd frontend
npm install
npm run build
cd ..

# 3. 重新构建后端镜像并启动
docker compose up -d --build backend

# 4. 如果 Nginx 配置有更新
docker compose restart nginx

# 5. 检查是否成功
docker compose ps
docker compose logs backend
```

---

## 四、数据备份和恢复

### 备份数据库

```bash
# 获取 .env 中的密码后执行备份
# 假设 MYSQL_PASSWORD=your_password

docker compose exec -T mysql mysqldump -u bloguser -pyour_password blog > backup-$(date +%Y%m%d-%H%M%S).sql

# 验证备份文件
ls -lh backup-*.sql
```

### 备份上传的文件

```bash
# 压缩上传文件
tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/uploads/

# 验证备份文件
ls -lh uploads-backup-*.tar.gz
```

### 将备份下载到本地

```bash
# 在本地电脑执行（不是在服务器上）
scp root@your_server_ip:/opt/Blog-Spring_AI/backup-*.sql ./
scp root@your_server_ip:/opt/Blog-Spring_AI/uploads-backup-*.tar.gz ./
```

### 从备份恢复数据库

```bash
# 恢复数据库（替换文件名和密码）
cat backup-20240115-143022.sql | docker compose exec -T mysql mysql -u bloguser -pyour_password blog

# 验证恢复成功
docker compose exec mysql mysql -u bloguser -pyour_password blog -e "show tables;"
```

---

## 五、常见问题排查

### 问题 1：容器无法启动

**症状**：`docker compose ps` 显示容器 `Exit` 或 `Restarting`

**排查步骤**：

```bash
# 1. 查看容器日志
docker compose logs backend

# 2. 常见原因及解决方案：

# MySQL 密码不匹配
# 解决：检查 .env 中的 MYSQL_PASSWORD 和 SPRING_DATASOURCE_PASSWORD 是否相同

# 前端文件未构建
# 解决：cd frontend && npm install && npm run build && cd ..

# 内存不足
# 解决：修改 docker-compose.yml 中的 JAVA_OPTS，减小 -Xmx 值

# 3. 重新启动服务
docker compose restart

# 4. 如果问题持续，完全重新部署
docker compose down
docker compose up -d
```

### 问题 2：MySQL 连接失败

**症状**：后端日志显示 "Can't connect to MySQL"

**排查步骤**：

```bash
# 1. 检查 MySQL 容器是否运行
docker compose ps mysql

# 2. 检查 MySQL 日志
docker compose logs mysql

# 3. 进入 MySQL 容器测试
docker compose exec mysql mysql -u root -p -e "SELECT 1;"

# 4. 检查数据库和用户是否创建
docker compose exec mysql mysql -u root -p -e "SELECT user, host FROM mysql.user;"

# 5. 查看 .env 中的密码配置
cat .env | grep MYSQL

# 6. 重启 MySQL 服务
docker compose restart mysql
```

### 问题 3：无法访问网站

**症状**：浏览器无法打开 `http://your_server_ip`

**排查步骤**：

```bash
# 1. 检查 Nginx 容器是否运行
docker compose ps nginx

# 2. 检查 Nginx 日志
docker compose logs nginx

# 3. 检查端口是否开放
netstat -tlnp | grep 80
# 或
ss -tlnp | grep 80

# 4. 测试连接
curl http://localhost/
curl http://your_server_ip/

# 5. 检查防火墙
sudo ufw status
# 如需开放 80 端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 6. 重启 Nginx
docker compose restart nginx
```

### 问题 4：前端出现 404 错误

**症状**：访问首页显示 404 Not Found

**排查步骤**：

```bash
# 1. 检查前端文件是否存在
ls -la frontend/dist/

# 2. 进入 Nginx 容器检查
docker compose exec nginx ls -la /usr/share/nginx/html/

# 3. 重新构建前端
cd frontend
npm install
npm run build
cd ..

# 4. 重启 Nginx
docker compose restart nginx

# 5. 清除浏览器缓存，重新访问
```

### 问题 5：后端 API 返回 500 错误

**症状**：API 返回 `500 Internal Server Error`

**排查步骤**：

```bash
# 1. 查看后端详细日志
docker compose logs backend | tail -100

# 2. 检查数据库初始化
docker compose exec mysql mysql -u bloguser -p -e "use blog; show tables;"

# 3. 检查环境变量是否正确
docker compose exec backend env | grep BLOG

# 4. 重启后端服务
docker compose restart backend

# 5. 查看启动后的日志
docker compose logs -f backend
```

### 问题 6：登录失败

**症状**：管理后台登录提示密码错误

**排查步骤**：

```bash
# 1. 检查 .env 中的密码配置
cat .env | grep MANAGE_PASSWORD

# 2. 确保密码与 docker-compose.yml 中的 MANAGE_PASSWORD 配置相同

# 3. 修改密码后重启后端
docker compose restart backend

# 4. 验证更改
docker compose logs backend
```

---

## 六、性能优化（低内存服务器）

如果服务器内存小于 4GB，建议进行以下优化。

### 调整 JVM 内存

编辑 `docker-compose.yml`，修改 `backend` 服务的 `JAVA_OPTS`：

```yaml
services:
  backend:
    environment:
      JAVA_OPTS: "-Xms128m -Xmx512m -XX:+UseG1GC"
      # ...其他配置...
```

然后重新启动：

```bash
docker compose up -d --build backend
```

### 调整 MySQL 配置

`mysql/custom.cnf` 文件已配置，如需进一步调整：

```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_type = 0
query_cache_size = 0
```

然后重启：

```bash
docker compose restart mysql
```

---

## 七、安全建议

### 必须做的

- ✅ 使用强密码（16+ 字符，包含大小写字母、数字、特殊符号）
- ✅ `.env` 文件权限设置为 600：`chmod 600 .env`
- ✅ 不要在 GitHub 中提交 `.env` 文件
- ✅ 定期备份数据库和上传文件
- ✅ 生产环境配置 HTTPS（使用 Let's Encrypt）

### 千万不要做的

- ❌ 使用简单或默认密码
- ❌ 在 GitHub 中提交敏感信息
- ❌ 删除或重启 mysql 容器而不备份数据
- ❌ 在生产环境使用 HTTP
- ❌ 在 docker-compose.yml 中硬编码敏感信息

---

## 八、配置 HTTPS（生产环境推荐）

### 使用 Let's Encrypt 获取免费证书

```bash
# 1. 安装 Certbot
apt update
apt install -y certbot python3-certbot-nginx

# 2. 获取证书（替换邮箱和域名）
certbot certonly --standalone -d your_domain.com -d www.your_domain.com

# 3. 证书位置
ls -la /etc/letsencrypt/live/your_domain.com/

# 4. 在 Nginx 配置中使用证书
# 修改 nginx/nginx.conf，使用 SSL 证书

# 5. 重启 Nginx
docker compose restart nginx

# 6. 设置证书自动更新
certbot renew --dry-run
```

---

## 九、总结检查清单

在部署前和部署后，请检查以下项目：

### 部署前

- [ ] 本地构建了前端（`frontend/dist/` 存在）
- [ ] 前端文件已推送到 GitHub
- [ ] 生成了 MySQL 密码
- [ ] 生成了 JWT Secret
- [ ] 生成了管理员密码（MANAGE_PASSWORD）
- [ ] 验证了项目结构完整

### 部署中

- [ ] SSH 连接到服务器
- [ ] 克隆了项目代码
- [ ] 创建了 `.env` 文件
- [ ] 验证了所有必需文件
- [ ] 启动了 Docker 容器
- [ ] 容器状态都是 running

### 部署后

- [ ] 访问博客首页成功
- [ ] 访问管理后台成功
- [ ] 用 admin 账户登录成功
- [ ] API 文档可访问
- [ ] 数据库已初始化
- [ ] 备份了初始数据库

---

## 十、快速命令参考

```bash
# 启动服务
docker compose up -d

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f backend

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 更新部署
git pull && docker compose up -d --build

# 进入容器
docker compose exec backend sh

# 备份数据库
docker compose exec -T mysql mysqldump -u bloguser -p blog > backup.sql

# 查看实时统计
docker compose stats
```

---

**祝你部署顺利！🚀**

如有任何问题，请查看"常见问题排查"部分，或根据 `docker compose logs` 输出进行调试。
