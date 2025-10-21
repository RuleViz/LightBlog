# Docker 部署配置说明

## 一、必须修改的配置项

在部署到服务器之前，请按照以下步骤修改 `docker-compose.yml`：

### 1. MySQL 数据库密码

```yaml
MYSQL_ROOT_PASSWORD: root_password_change_me    # 修改为强密码，如: MyR00t@Pass2024!
MYSQL_PASSWORD: blog_password_change_me          # 修改为强密码，如: MyBl0g@Pass2024!
```

**注意**：修改后，同步修改下面的 `SPRING_DATASOURCE_PASSWORD`：
```yaml
SPRING_DATASOURCE_PASSWORD: blog_password_change_me  # 改成和上面 MYSQL_PASSWORD 一样的密码
```

### 2. JWT 密钥（至少 32 位）

```yaml
BLOG_JWT_SECRET: your_very_strong_jwt_secret_key_here_change_me
```

**建议**：使用随机生成的强密钥，例如：
```bash
# 在本地生成随机密钥（Linux/Mac）
openssl rand -base64 32

# 或使用在线工具生成 32 位以上的随机字符串
```

示例：`A7f9K2mN8pQ3rT5vW7xY9zA1bC3dE5fG7hI9jK1lM3nO`

### 3. 管理员密码

```yaml
MANAGE_PASSWORD: admin123_change_me  # 修改为强密码，如: MyAdm1n@Pass2024!
```

这是登录管理后台的密码。

### 4. GitHub Token（可选，但推荐配置）

```yaml
GITHUB_TOKEN: your_github_token_here
```

**用途**：用于在个人主页显示 GitHub 贡献图。

**获取方式**：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `read:user` 权限
4. 生成后复制 token 填入

### 5. DeepSeek AI API Key（可选）

```yaml
DEEPSEEK_KEY: your_deepseek_api_key_here
```

**用途**：用于 AI 助手功能（如智能文章摘要、内容生成等）。

**获取方式**：
1. 访问 https://platform.deepseek.com/
2. 注册账号并获取 API Key

**注意**：如果不使用 AI 功能，可以留空，但相关功能将不可用。

---

## 二、配置示例（完整）

```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: MyR00t@SecurePass2024!
      MYSQL_DATABASE: blog
      MYSQL_USER: bloguser
      MYSQL_PASSWORD: MyBl0g@SecurePass2024!
      TZ: Asia/Shanghai
  
  backend:
    environment:
      JAVA_OPTS: "-Xms256m -Xmx768m -XX:+UseG1GC"
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/blog?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: bloguser
      SPRING_DATASOURCE_PASSWORD: MyBl0g@SecurePass2024!  # 和上面 MYSQL_PASSWORD 一致
      BLOG_JWT_SECRET: A7f9K2mN8pQ3rT5vW7xY9zA1bC3dE5fG7hI9jK1lM3nO
      MANAGE_PASSWORD: MyAdm1n@SecurePass2024!
      GITHUB_TOKEN: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      DEEPSEEK_KEY: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 三、上传到服务器

### 方式一：使用 Git（推荐）

```bash
# 在服务器上
cd /opt
git clone https://github.com/RuleViz/LightBlog.git
cd LightBlog

# 编辑配置文件
nano docker-compose.yml
# 按照上面的说明修改配置
```

### 方式二：从本地上传

```bash
# 在本地 Windows PowerShell 中
cd E:\project\Java\Blog-Spring_AI

# 上传整个项目到服务器
scp -r . root@your-server-ip:/opt/LightBlog/
```

---

## 四、部署前检查清单

在执行 `docker-compose up -d` 之前，请确保：

- [ ] 已修改所有密码（不使用默认密码）
- [ ] JWT_SECRET 至少 32 位
- [ ] MySQL 密码和 SPRING_DATASOURCE_PASSWORD 一致
- [ ] 前端已构建（`cd frontend && npm install && npm run build`）
- [ ] 已创建必要的文件：
  - [ ] `docker-compose.yml`
  - [ ] `Dockerfile`
  - [ ] `init.sql`
  - [ ] `mysql/custom.cnf`
  - [ ] `nginx/nginx.conf`
  - [ ] `frontend/dist/` (构建后的前端文件)

---

## 五、快速部署命令

```bash
# 1. 进入项目目录
cd /opt/LightBlog

# 2. 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. 构建前端
cd frontend
npm install
npm run build
cd ..

# 4. 启动 Docker 容器
docker-compose up -d

# 5. 查看日志
docker-compose logs -f

# 6. 检查服务状态
docker-compose ps
```

---

## 六、访问应用

- **前端页面**: http://your-server-ip
- **管理后台**: http://your-server-ip/admin
- **API 文档**: http://your-server-ip/api/doc.html

**管理员登录信息**：
- 用户名: `admin`
- 密码: 您在 `MANAGE_PASSWORD` 中设置的密码

---

## 七、常见问题

### Q1: 忘记管理员密码怎么办？

修改 `docker-compose.yml` 中的 `MANAGE_PASSWORD`，然后重启容器：
```bash
docker-compose restart backend
```

### Q2: 如何修改端口？

编辑 `docker-compose.yml`：
```yaml
nginx:
  ports:
    - "8000:80"  # 将 80 改为 8000
```

### Q3: 如何查看数据库？

```bash
# 进入 MySQL 容器
docker-compose exec mysql mysql -u bloguser -p blog
# 输入您设置的 MYSQL_PASSWORD
```

### Q4: 如何备份数据？

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u bloguser -p blog > backup-$(date +%Y%m%d).sql

# 备份上传文件
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

---

## 八、安全建议

1. **使用强密码**：所有密码至少 16 位，包含大小写字母、数字和特殊字符
2. **定期备份**：建议每天自动备份数据库和上传文件
3. **配置 HTTPS**：生产环境建议配置 SSL 证书
4. **防火墙设置**：只开放必要的端口（80, 443）
5. **定期更新**：及时更新 Docker 镜像和应用代码

---

## 需要帮助？

如有问题，请查看 `Docker部署指南.md` 或提交 Issue。

