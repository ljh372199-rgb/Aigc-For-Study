# DeepSeek API Key 配置指南

## 📋 概述

本文档说明如何为 Aigc For Study 配置 DeepSeek API Key，支持通过 CI/CD 流程部署到测试和生产环境。

## 🔑 DeepSeek API Key

**你的 API Key**: `sk-c73424d776c548ebb315106c1b1e247b`

这个 API Key 已集成到系统中，支持以下 AI 功能：
- 学习方案生成
- 练习题生成
- 作业批改
- 学习进度分析

## 🏠 本地开发配置

### 1. 创建 .env 文件

```bash
cd Aigc-For-Study/backend
cp .env.example .env
```

### 2. 编辑 .env 文件

```bash
# 编辑 .env 文件
nano .env
```

修改以下配置：

```env
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key

# DeepSeek AI 配置
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-c73424d776c548ebb315106c1b1e247b
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 其他配置保持默认...
```

### 3. 启动本地服务

```bash
# 方式1: 使用 Docker Compose
cd Aigc-For-Study
docker-compose up -d

# 方式2: 本地开发
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. 验证配置

访问 API 文档：http://localhost:8000/docs

测试 DeepSeek API：

```bash
curl -X POST http://localhost:8000/api/v1/ai/test \
  -H "Content-Type: application/json" \
  -d '{"test": "hello"}'
```

## ☁️ CI/CD 环境配置

### 方式1: GitHub Secrets（推荐）

#### 1. 添加 Secrets

```bash
# 添加 DeepSeek API Key
gh secret set DEEPSEEK_API_KEY --body "sk-c73424d776c548ebb315106c1b1e247b" --repo ljh372199-rgb/Aigc-For-Study

# 添加其他必要的 Secrets
gh secret set JWT_SECRET_KEY --body "your-production-jwt-secret" --repo ljh372199-rgb/Aigc-For-Study
gh secret set DATABASE_PASSWORD --body "your-db-password" --repo ljh372199-rgb/Aigc-For-Study
```

#### 2. 验证 Secrets

```bash
gh secret list --repo ljh372199-rgb/Aigc-For-Study
```

应该看到：

```
DEEPSEEK_API_KEY    ✓ Updated
DATABASE_PASSWORD   ✓ Updated
JWT_SECRET_KEY      ✓ Updated
```

### 方式2: 环境变量文件

在服务器上创建 `.env` 文件：

```bash
# SSH 到服务器
ssh ubuntu@124.223.78.206

# 创建环境配置文件
sudo nano /app/aigc-for-study/.env
```

添加以下内容：

```env
# AI 配置
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-c73424d776c548ebb315106c1b1e247b
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 数据库配置
DATABASE_URL=postgresql://aigc:your-password@db:5432/aigc_prod

# 安全配置
JWT_SECRET_KEY=your-production-jwt-secret
SECRET_KEY=your-production-secret-key
```

## 🚀 部署流程

### 测试环境部署

```bash
# 自动部署（推送到 develop 分支）
git checkout develop
git add .
git commit -m "feat: update code"
git push origin develop
```

GitHub Actions 会自动：
1. 运行 CI 测试
2. 拉取代码到服务器
3. 从 Secrets 读取 `DEEPSEEK_API_KEY`
4. 部署到测试环境（端口 38000）
5. 验证服务健康状态

### 生产环境部署

```bash
# 1. 合并到 main 分支
git checkout main
git merge develop
git push origin main

# 2. 创建 Release
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "Production release"
```

或者手动触发：

```bash
# 在 GitHub Actions 页面
# Actions → Deploy to Production → Run workflow
```

## 🔍 故障排查

### 1. 检查 API Key 是否正确加载

```bash
# 在容器内检查
docker exec -it aigc-api-staging env | grep DEEPSEEK

# 应该看到
DEEPSEEK_API_KEY=sk-c73424d776c548ebb315106c1b1e247b
```

### 2. 测试 API 连接

```bash
# 测试 API 调用
curl -X POST http://124.223.78.206:38000/api/v1/ai/generate-exercises \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python", "count": 3}'
```

### 3. 查看日志

```bash
# 查看容器日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs -f api

# 查看 DeepSeek 相关日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs -f | grep -i deepseek
```

### 4. 常见错误

**错误1: API Key 无效**
```
Error: Invalid API key
```
解决：检查 `DEEPSEEK_API_KEY` 是否正确配置

**错误2: 账户余额不足**
```
Error: Insufficient credits
```
解决：登录 DeepSeek 账户充值

**错误3: 网络连接问题**
```
Error: Connection timeout
```
解决：检查服务器网络配置

## 📊 环境配置对比

| 环境 | 端口 | API Key 来源 | 数据库 |
|------|------|-------------|--------|
| 本地开发 | 8000 | .env 文件 | localhost |
| 测试环境 | 38000 | GitHub Secrets | staging DB |
| 生产环境 | 38001 | GitHub Secrets | production DB |

## 🔒 安全建议

1. **永远不要**将真实 API Key 提交到代码仓库
2. **始终使用** GitHub Secrets 存储敏感信息
3. **定期轮换** API Key（DeepSeek 控制台可重置）
4. **监控使用量**，避免意外超额

## 📞 获取帮助

- DeepSeek API 文档: https://platform.deepseek.com/
- DeepSeek 控制台: https://platform.deepseek.com/api_keys
- 项目 Issues: https://github.com/ljh372199-rgb/Aigc-For-Study/issues
