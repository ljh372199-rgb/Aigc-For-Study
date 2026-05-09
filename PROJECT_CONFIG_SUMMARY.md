# Aigc For Study - 项目配置总结

## 📋 概述

本项目是一个基于 AI 的在线学习平台，集成了 DeepSeek API 提供智能学习方案生成、作业批改、练习题生成等功能。

**DeepSeek API Key**: `sk-c73424d776c548ebb315106c1b1e247b`

---

## 🏗️ 项目架构

```
┌─────────────────────────────────────────────────────┐
│                  前端 (React + Vite)                │
│         http://124.223.78.206:38010 (测试)         │
│         http://124.223.78.206:38002 (生产)         │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  后端 (FastAPI)                    │
│         http://124.223.78.206:38000 (测试)         │
│         http://124.223.78.206:38001 (生产)         │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │           AI 服务层 (DeepSeek)                │ │
│  │  - 学习方案生成                               │ │
│  │  - 练习题生成                                 │ │
│  │  - 作业批改                                   │ │
│  │  - 学习进度分析                               │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────┐           ┌─────────────────┐
│   PostgreSQL    │           │     Redis       │
│   (数据库)       │           │   (缓存)        │
└─────────────────┘           └─────────────────┘
```

---

## 🔑 核心配置

### 1. DeepSeek API 配置

**环境变量**:
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-c73424d776c548ebb315106c1b1e247b
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

**配置位置**:
- 本地: `backend/.env`
- GitHub Secrets: `DEEPSEEK_API_KEY`
- 服务器: `/app/aigc-for-study/.env`

### 2. 端口配置

| 服务 | 环境 | 主机端口 | 容器端口 |
|------|------|---------|---------|
| **API** | 测试 | **38000** | 8000 |
| **Web** | 测试 | 38010 | 80 |
| **API** | 生产 | **38001** | 8000 |
| **Web** | 生产 | 38002 | 80 |

### 3. 数据库配置

**测试环境**:
```env
DATABASE_URL=postgresql://aigc:aigc@db:5432/aigc_staging
POSTGRES_USER=aigc
POSTGRES_PASSWORD=aigc
```

**生产环境**:
```env
DATABASE_URL=postgresql://aigc:your-password@db:5432/aigc_prod
```

---

## 📁 关键文件结构

```
Aigc-For-Study/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # API 端点
│   │   │   ├── auth.py          # 认证接口
│   │   │   ├── users.py         # 用户管理
│   │   │   ├── careers.py       # 职业规划
│   │   │   ├── learning_plan.py # 学习方案
│   │   │   ├── exercises.py      # 练习题
│   │   │   └── homework.py       # 作业
│   │   ├── core/
│   │   │   └── config.py        # 配置管理 ✓ DeepSeek 配置
│   │   ├── services/
│   │   │   ├── ai_service.py    # AI 服务入口
│   │   │   └── ai/
│   │   │       ├── base.py              # AI 接口定义 ✓
│   │   │       ├── deepseek_service.py  # DeepSeek 实现 ✓
│   │   │       ├── openai_service.py    # OpenAI 实现
│   │   │       └── anthropic_service.py # Claude 实现
│   │   ├── models/              # 数据模型
│   │   └── schemas/             # Pydantic 模型
│   ├── tests/
│   │   ├── api_test.py          # API 测试脚本 ✓
│   │   └── test_*.py            # 单元测试
│   ├── .env.example              # 环境变量示例 ✓ 已更新
│   └── requirements.txt          # Python 依赖
│
├── frontend/                     # React 前端
│   ├── src/
│   │   ├── components/          # 组件
│   │   ├── pages/              # 页面
│   │   └── services/           # API 服务
│   └── Dockerfile              # 前端构建
│
├── .github/workflows/
│   ├── ci.yml                  # CI 流程 ✓ DeepSeek 测试
│   ├── deploy-staging.yml      # 测试环境部署 ✓ DeepSeek Secrets
│   └── deploy-production.yml    # 生产环境部署 ✓ DeepSeek Secrets
│
├── docker-compose.yml           # 本地开发
├── docker-compose.staging.yml  # 测试环境 ✓ DeepSeek 配置
├── docker-compose.production.yml # 生产环境 ✓ DeepSeek 配置
│
├── scripts/                    # 部署脚本
│   ├── build-docker.sh         # Docker 镜像构建
│   ├── deploy.sh              # 服务器部署
│   └── init-server.sh         # 服务器初始化
│
└── docs/
    ├── DeepSeek_API_Configuration_Guide.md  # DeepSeek 配置指南 ✓
    ├── 环境配置文档.md
    └── CI/CD配置流程文档.md
```

---

## 🚀 部署流程

### 1. 本地开发

```bash
# 1. 克隆代码
git clone https://github.com/ljh372199-rgb/Aigc-For-Study.git
cd Aigc-For-Study

# 2. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env，填入 DeepSeek API Key

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# API: http://localhost:38000/docs
# Web: http://localhost:3000
```

### 2. CI/CD 自动化部署

#### 测试环境（自动部署）
```bash
git checkout develop
git add .
git commit -m "feat: your changes"
git push origin develop
```

**自动流程**:
1. GitHub Actions 运行 CI 测试
2. 构建 Docker 镜像
3. 部署到 `124.223.78.206:38000`
4. 运行 API 测试验证 DeepSeek 功能
5. 发送部署通知

#### 生产环境（手动部署）
```bash
# 方式1: 创建 Release
git checkout main
git merge develop
gh release create v1.0.0 --title "v1.0.0"

# 方式2: 手动触发
# GitHub Actions → Deploy to Production → Run workflow
```

**自动流程**:
1. 拉取指定版本代码
2. 部署到 `124.223.78.206:38001`
3. 运行健康检查
4. 发送部署通知

### 3. GitHub Secrets 配置

必须配置以下 Secrets（使用 `gh secret set` 命令）:

| Secret | 说明 | 示例值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | `sk-c73424d776c548ebb315106c1b1e247b` |
| `STAGING_HOST` | 测试服务器地址 | `124.223.78.206` |
| `STAGING_USER` | 测试服务器用户 | `ubuntu` |
| `STAGING_SSH_KEY` | 测试服务器 SSH 私钥 | `-----BEGIN OPENSSH...` |
| `STAGING_DB_USER` | 测试数据库用户名 | `aigc` |
| `STAGING_DB_PASSWORD` | 测试数据库密码 | `aigc` |
| `STAGING_JWT_SECRET` | 测试环境 JWT 密钥 | `jwt-secret-key` |
| `PRODUCTION_HOST` | 生产服务器地址 | `124.223.78.206` |
| `PRODUCTION_USER` | 生产服务器用户 | `ubuntu` |
| `PRODUCTION_SSH_KEY` | 生产服务器 SSH 私钥 | `-----BEGIN OPENSSH...` |
| `PRODUCTION_DB_PASSWORD` | 生产数据库密码 | `your-password` |
| `PRODUCTION_JWT_SECRET` | 生产环境 JWT 密钥 | `your-jwt-secret` |

**配置命令**:
```bash
# 添加 DeepSeek API Key
gh secret set DEEPSEEK_API_KEY --body "sk-c73424d776c548ebb315106c1b1e247b" --repo ljh372199-rgb/Aigc-For-Study

# 添加其他 Secrets
gh secret set STAGING_HOST --body "124.223.78.206" --repo ljh372199-rgb/Aigc-For-Study
gh secret set PRODUCTION_HOST --body "124.223.78.206" --repo ljh372199-rgb/Aigc-For-Study
# ... 其他 Secrets
```

---

## 🧪 API 测试

### 本地测试

```bash
cd backend

# 安装测试依赖
pip install httpx pytest

# 运行 API 测试
python tests/api_test.py --base-url http://localhost:38000 --api-key "sk-c73424d776c548ebb315106c1b1e247b"
```

### 测试端点

#### 认证接口
```bash
# 用户注册
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser",
  "role": "student"
}

# 用户登录
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### AI 功能接口
```bash
# 生成学习方案
POST /api/v1/ai/generate-learning-plan
{
  "career_goal": "前端工程师",
  "skills_required": ["HTML", "CSS", "JavaScript", "React"]
}

# 生成练习题
POST /api/v1/ai/generate-exercises
{
  "topic": "Python 基础",
  "count": 5,
  "difficulty": "medium"
}

# 作业批改
POST /api/v1/ai/grade-homework
{
  "title": "Python 作业",
  "description": "完成练习题",
  "content": "学生提交的作业内容"
}
```

### 验证 DeepSeek 集成

```bash
# 测试 DeepSeek API 连接
curl -X POST http://localhost:38000/api/v1/ai/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, DeepSeek!"}'

# 预期响应: AI 生成的内容
```

---

## 🔧 故障排查

### 1. DeepSeek API Key 无效

**症状**: 
```
Error: Invalid API key
```

**解决**:
```bash
# 检查环境变量
docker exec -it aigc-api-staging env | grep DEEPSEEK

# 验证 API Key
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-c73424d776c548ebb315106c1b1e247b"
```

### 2. 账户余额不足

**症状**:
```
Error: Insufficient credits
```

**解决**:
1. 登录 DeepSeek 控制台: https://platform.deepseek.com/
2. 检查账户余额
3. 充值或等待下月额度

### 3. 网络连接问题

**症状**:
```
Error: Connection timeout
```

**解决**:
```bash
# 测试网络连接
curl -v https://api.deepseek.com

# 检查服务器防火墙
sudo ufw status
sudo ufw allow 443/tcp
```

### 4. CI/CD 部署失败

**症状**:
```
Error: Deployment to staging failed
```

**解决**:
1. 检查 GitHub Secrets 是否正确配置
2. 验证 SSH 连接: `ssh -T ubuntu@124.223.78.206`
3. 查看 Actions 日志: GitHub → Actions → 失败的 workflow

---

## 📊 监控和维护

### 日志查看

```bash
# 实时查看日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs -f

# 查看特定服务日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs -f api

# 查看 DeepSeek 相关日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs | grep -i deepseek
```

### 数据库备份

```bash
# 备份数据库
cd /app/aigc-for-study
./scripts/backup.sh --env staging --db-only

# 查看备份
./scripts/backup.sh --list
```

### 服务重启

```bash
# 重启所有服务
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml restart

# 重启特定服务
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml restart api
```

---

## 🔒 安全建议

1. **API Key 管理**
   - ✓ 不将真实 API Key 提交到代码库
   - ✓ 使用 GitHub Secrets 存储敏感信息
   - ✓ 定期轮换 API Key

2. **服务器安全**
   - 使用 SSH 密钥登录，禁用密码登录
   - 配置防火墙，只开放必要端口
   - 定期更新系统和软件

3. **数据库安全**
   - 使用强密码
   - 限制数据库访问权限
   - 定期备份

---

## 📞 获取帮助

- **DeepSeek 文档**: https://platform.deepseek.com/docs
- **DeepSeek 控制台**: https://platform.deepseek.com/api_keys
- **GitHub Issues**: https://github.com/ljh372199-rgb/Aigc-For-Study/issues
- **项目 Wiki**: https://github.com/ljh372199-rgb/Aigc-For-Study/wiki

---

## ✅ 检查清单

部署前请确认以下项目:

- [ ] GitHub Secrets 配置完整（DEEPSEEK_API_KEY 等）
- [ ] 服务器 Docker 环境已安装
- [ ] 数据库已创建
- [ ] `.env` 文件已在服务器上创建
- [ ] 防火墙端口已开放（38000, 38001, 38010, 38002）
- [ ] DeepSeek API Key 有效且余额充足
- [ ] SSH 密钥已添加到 GitHub

---

**最后更新**: 2026-05-07
**版本**: 1.0.0
**维护者**: Aigc For Study Team
