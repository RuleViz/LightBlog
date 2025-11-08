# 代码更新部署流程指南

本文档详细说明在修改后端和前端代码后，如何将代码提交到 GitHub 并完成服务器端的部署更新。

---

## 📋 部署流程概览

```
本地开发 → Git提交 → GitHub推送 → 服务器拉取 → Docker构建 → 服务重启
```

---

## 一、本地操作：提交代码到 GitHub

### 1.1 构建前端（必须）

在提交代码前，必须先构建前端生产版本：

```bash
# 进入前端目录
cd frontend

# 安装依赖（如果有新增依赖）
npm install

# 构建生产版本
npm run build

# 返回项目根目录
cd ..
```

**重要**：确保 `frontend/dist/` 目录已生成，包含 `index.html` 和 `assets/` 文件夹。

### 1.2 检查代码变更

```bash
# 查看所有变更
git status

# 查看具体变更内容
git diff
```

### 1.3 提交代码

```bash
# 添加所有变更（包括前端构建文件）
git add .

# 提交变更（使用有意义的提交信息）
git commit -m "feat: 修复PostDetail组件TypeScript错误并更新后端功能"

# 推送到 GitHub
git push origin main
# 或
git push origin master
```

**注意**：
- 如果 `.env` 文件有变更，**不要提交**（使用 `git restore --staged .env` 取消暂存）
- 确保 `frontend/dist/` 目录已提交（这是前端部署的关键）

---

## 二、服务器端操作：拉取代码并重新部署

### 2.1 SSH 连接到服务器

```bash
ssh root@your_server_ip
# 或使用其他用户
ssh username@your_server_ip
```

### 2.2 进入项目目录

```bash
# 假设项目在 /opt/Blog-Spring_AI
cd /opt/Blog-Spring_AI

# 或根据你的实际路径调整
```

### 2.3 拉取最新代码

```bash
# 拉取最新代码（不会影响正在运行的容器）
git pull origin main
# 或
git pull origin master

# 验证拉取成功
git log -1
```

### 2.4 检查变更内容

```bash
# 查看最近一次提交的变更
git show HEAD

# 检查前端构建文件是否存在
ls -la frontend/dist/

# 检查后端代码是否有变更
ls -la backend/blog-air/blog-system/blog-app/src/main/java/
```

---

## 三、重新构建和部署

### 3.1 前端处理

#### 情况 A：前端代码有变更（推荐在服务器重新构建）

如果前端代码有变更，建议在服务器上重新构建以确保一致性：

```bash
# 检查 Node.js 是否安装
node --version
npm --version

# 如果未安装 Node.js，先安装（Debian/Ubuntu）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt update
apt install -y nodejs

# 进入前端目录
cd frontend

# 安装依赖（如果有新增）
npm install

# 重新构建
npm run build

# 验证构建成功
ls -la dist/

# 返回项目根目录
cd ..
```

#### 情况 B：前端代码无变更（已通过 Git 拉取 dist）

如果前端代码没有变更，且 `frontend/dist/` 已通过 Git 拉取，可以跳过构建步骤。

### 3.2 后端处理：重新构建 Docker 镜像

**后端代码有变更时，必须重新构建 Docker 镜像**：

```bash
# 在项目根目录执行

# 方式 1：仅重新构建后端服务（推荐）
docker compose build backend

# 方式 2：强制重新构建（不使用缓存）
docker compose build --no-cache backend

# 查看构建进度（会显示详细的构建日志）
```

**构建时间**：首次构建可能需要 5-10 分钟，后续构建（使用缓存）通常 2-5 分钟。

### 3.3 Nginx 处理

#### 情况 A：Nginx 配置文件（nginx/nginx.conf）有变更

```bash
# 重新加载 Nginx 配置（推荐方式）
docker compose exec nginx nginx -s reload

# 或重启 Nginx 容器
docker compose restart nginx
```

**注意**：Nginx 使用官方镜像 `nginx:alpine`，配置文件通过 volume 挂载，**不需要重新构建镜像**。

#### 情况 B：Nginx 配置文件无变更

**如果 `nginx/nginx.conf` 没有变更，Nginx 不需要任何操作**。

**原因**：
- Nginx 容器使用官方镜像，不涉及代码构建
- 前端静态文件（`frontend/dist/`）通过 volume 挂载，文件更新后自动生效
- 如果只是前端代码更新，Nginx 会自动提供新的静态文件

### 3.4 重启服务

#### 仅后端有变更

```bash
# 停止旧的后端容器
docker compose stop backend

# 启动新的后端容器（使用新构建的镜像）
docker compose up -d backend

# 或使用一条命令（推荐）
docker compose up -d --build backend
```

#### 后端和前端都有变更

```bash
# 重新构建后端并启动
docker compose up -d --build backend

# 如果 Nginx 配置有变更，重启 Nginx
docker compose restart nginx
```

#### 完整重新部署（所有服务）

```bash
# 停止所有容器
docker compose down

# 重新构建并启动所有服务
docker compose up -d --build

# 或仅重新构建后端，其他服务使用现有镜像
docker compose up -d --build backend
```

---

## 四、验证部署结果

### 4.1 检查容器状态

```bash
# 查看所有容器状态
docker compose ps

# 预期输出示例：
# NAME              IMAGE                          STATUS
# blog-mysql        mysql:8.0                      Up (healthy)
# blog-backend      blog-spring_ai-backend:latest  Up (healthy)
# blog-nginx        nginx:alpine                   Up
```

**状态说明**：
- `Up (healthy)`：容器运行正常且健康检查通过
- `Up`：容器运行正常
- `Restarting`：容器不断重启，需要查看日志排查问题
- `Exit`：容器已停止，需要查看日志排查问题

### 4.2 查看服务日志

```bash
# 查看后端启动日志（最重要）
docker compose logs backend | tail -50

# 实时跟踪后端日志
docker compose logs -f backend

# 查看 Nginx 日志
docker compose logs nginx | tail -30

# 查看所有服务日志
docker compose logs | tail -100
```

**关键检查点**：
- 后端日志中应看到 Spring Boot 启动成功的消息
- 没有 `ERROR` 或 `Exception` 错误
- 数据库连接成功

### 4.3 测试服务可用性

```bash
# 测试后端 API（在服务器上）
curl http://localhost:8080/api/doc.html

# 测试 Nginx 代理（在服务器上）
curl http://localhost/

# 测试 API 接口（在服务器上）
curl http://localhost/api/posts
```

### 4.4 浏览器验证

在本地浏览器访问：

| 地址 | 说明 | 预期结果 |
|------|------|----------|
| `http://your_server_ip` | 博客首页 | 正常显示 |
| `http://your_server_ip/admin` | 管理后台 | 正常显示 |
| `http://your_server_ip/api/doc.html` | API 文档 | 正常显示 |

---

## 五、快速部署脚本（可选）

创建自动化部署脚本可以简化流程：

### 5.1 创建部署脚本

```bash
# 在服务器项目根目录创建 deploy.sh
cat > deploy.sh << 'EOF'
#!/bin/bash

set -e  # 遇到错误立即退出

echo "🚀 开始部署..."

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main || git pull origin master

# 2. 检查前端是否需要重新构建
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "🔨 构建前端..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# 3. 重新构建后端
echo "🐳 构建后端 Docker 镜像..."
docker compose build backend

# 4. 重启后端服务
echo "🔄 重启后端服务..."
docker compose up -d --build backend

# 5. 检查 Nginx 配置是否有变更
if git diff HEAD~1 HEAD --name-only | grep -q "nginx/nginx.conf"; then
    echo "🔄 重启 Nginx..."
    docker compose restart nginx
fi

# 6. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 7. 检查服务状态
echo "✅ 检查服务状态..."
docker compose ps

# 8. 查看后端日志
echo "📋 后端启动日志（最后20行）："
docker compose logs backend | tail -20

echo "✨ 部署完成！"
EOF

# 设置执行权限
chmod +x deploy.sh
```

### 5.2 使用部署脚本

```bash
# 执行部署脚本
./deploy.sh
```

---

## 六、常见场景处理

### 场景 1：仅修改了前端代码

```bash
# 1. 本地构建前端并提交
cd frontend && npm run build && cd ..
git add frontend/dist
git commit -m "feat: 更新前端功能"
git push

# 2. 服务器端操作
git pull
# 如果前端代码有变更，重新构建
cd frontend && npm install && npm run build && cd ..
# Nginx 会自动使用新的静态文件，无需重启
# 但如果想立即生效，可以重启 Nginx
docker compose restart nginx
```

### 场景 2：仅修改了后端代码

```bash
# 1. 本地提交
git add backend/
git commit -m "feat: 更新后端功能"
git push

# 2. 服务器端操作
git pull
docker compose build backend
docker compose up -d --build backend
# 查看日志确认启动成功
docker compose logs -f backend
```

### 场景 3：同时修改了前端和后端

```bash
# 1. 本地操作
cd frontend && npm run build && cd ..
git add .
git commit -m "feat: 同时更新前端和后端"
git push

# 2. 服务器端操作
git pull
# 重新构建前端（如果需要）
cd frontend && npm install && npm run build && cd ..
# 重新构建后端
docker compose build backend
docker compose up -d --build backend
# 如果 Nginx 配置有变更
docker compose restart nginx
```

### 场景 4：修改了 Nginx 配置

```bash
# 1. 本地提交
git add nginx/nginx.conf
git commit -m "config: 更新 Nginx 配置"
git push

# 2. 服务器端操作
git pull
# 重新加载 Nginx 配置（推荐）
docker compose exec nginx nginx -s reload
# 或重启 Nginx
docker compose restart nginx
```

### 场景 5：修改了 Dockerfile 或 docker-compose.yml

```bash
# 1. 本地提交
git add Dockerfile docker-compose.yml
git commit -m "config: 更新 Docker 配置"
git push

# 2. 服务器端操作
git pull
# 必须重新构建
docker compose build --no-cache backend
docker compose up -d --build
```

---

## 七、Nginx 是否需要重新构建？

### ✅ 不需要重新构建的情况

1. **仅修改了前端代码**：Nginx 通过 volume 挂载 `frontend/dist/`，文件更新后自动生效
2. **仅修改了后端代码**：后端和 Nginx 是独立的服务
3. **修改了 Nginx 配置文件**：配置文件通过 volume 挂载，只需重新加载配置或重启容器

### ❌ 需要重新构建的情况

**实际上，Nginx 使用官方镜像，永远不需要重新构建**。

如果：
- 需要自定义 Nginx 模块
- 需要修改 Nginx 基础镜像
- 需要添加额外的 Nginx 插件

那么需要创建自定义 Dockerfile 来构建 Nginx 镜像，但当前项目使用的是官方镜像，**不需要重新构建**。

### 🔄 Nginx 操作总结

| 变更类型 | 操作 | 命令 |
|---------|------|------|
| 前端代码更新 | 无需操作（自动生效）或重启容器 | `docker compose restart nginx` |
| Nginx 配置更新 | 重新加载配置（推荐） | `docker compose exec nginx nginx -s reload` |
| Nginx 配置更新 | 或重启容器 | `docker compose restart nginx` |
| 仅后端更新 | 无需操作 | - |

---

## 八、故障排查

### 问题 1：后端容器无法启动

```bash
# 查看详细错误日志
docker compose logs backend

# 常见原因：
# 1. 代码编译错误 → 检查构建日志
# 2. 数据库连接失败 → 检查 .env 配置
# 3. 端口被占用 → 检查端口占用情况

# 解决方案：
docker compose build --no-cache backend
docker compose up -d backend
docker compose logs -f backend
```

### 问题 2：前端页面显示旧内容

```bash
# 1. 检查前端文件是否更新
ls -la frontend/dist/

# 2. 检查 Nginx 挂载是否正确
docker compose exec nginx ls -la /usr/share/nginx/html/

# 3. 清除浏览器缓存
# 4. 重启 Nginx
docker compose restart nginx
```

### 问题 3：API 请求失败

```bash
# 1. 检查后端是否运行
docker compose ps backend

# 2. 检查后端日志
docker compose logs backend | tail -50

# 3. 测试后端直接访问
curl http://localhost:8080/api/doc.html

# 4. 检查 Nginx 代理配置
docker compose exec nginx cat /etc/nginx/conf.d/default.conf
```

---

## 九、最佳实践

### ✅ 推荐做法

1. **每次部署前备份数据库**
   ```bash
   docker compose exec -T mysql mysqldump -u bloguser -p blog > backup-$(date +%Y%m%d).sql
   ```

2. **使用有意义的 Git 提交信息**
   ```bash
   git commit -m "feat: 添加新功能"  # 新功能
   git commit -m "fix: 修复bug"      # 修复bug
   git commit -m "refactor: 重构代码" # 重构
   ```

3. **分步验证部署**
   - 先验证后端启动成功
   - 再验证前端访问正常
   - 最后测试完整功能

4. **保留部署日志**
   ```bash
   # 记录部署时间
   echo "$(date): 部署完成" >> deploy.log
   ```

### ❌ 避免的做法

1. **不要在生产环境直接修改代码**
2. **不要跳过前端构建步骤**
3. **不要在容器运行时删除镜像**
4. **不要忽略错误日志**

---

## 十、完整部署命令速查表

```bash
# ============================================
# 本地操作
# ============================================
cd frontend && npm run build && cd ..
git add .
git commit -m "feat: 更新功能"
git push

# ============================================
# 服务器操作（完整流程）
# ============================================
cd /opt/Blog-Spring_AI
git pull

# 前端重新构建（如果前端代码有变更）
cd frontend && npm install && npm run build && cd ..

# 后端重新构建并启动
docker compose build backend
docker compose up -d --build backend

# Nginx 重启（如果配置有变更）
docker compose restart nginx

# 验证部署
docker compose ps
docker compose logs backend | tail -30
```

---

## 📝 总结

1. **前端更新**：需要重新构建 `frontend/dist/`，Nginx 会自动使用新文件
2. **后端更新**：需要重新构建 Docker 镜像并重启后端容器
3. **Nginx 配置更新**：只需重新加载配置或重启容器，**不需要重新构建镜像**
4. **Nginx 使用官方镜像**：通过 volume 挂载配置和静态文件，**永远不需要重新构建**

**记住**：Nginx 容器本身不需要重新构建，只需要在配置变更时重新加载或重启即可！

---

**祝你部署顺利！🚀**

