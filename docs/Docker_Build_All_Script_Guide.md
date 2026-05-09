# Aigc For Study - Docker 统一构建脚本详解

> **版本:** v2.0
> **更新日期:** 2026-05-07
> **适用范围:** MVP开发、测试、部署全流程

---

## 目录

1. [概述](#1-概述)
2. [快速开始](#2-快速开始)
3. [脚本架构](#3-脚本架构)
4. [详细参数说明](#4-详细参数说明)
5. [使用场景详解](#5-使用场景详解)
6. [前后端构建流程](#6-前后端构建流程)
7. [镜像管理](#7-镜像管理)
8. [CI/CD集成](#8-cicd集成)
9. [故障排查](#9-故障排查)
10. [最佳实践](#10-最佳实践)
11. [常见问题FAQ](#11-常见问题faq)

---

## 1. 概述

### 1.1 什么是统一构建脚本

`build-all.sh` 是一个一键构建脚本，可以同时构建 Aigc For Study 项目的前端和后端 Docker 镜像。它整合了原有的 `build-docker.sh`（后端构建）和 `build-frontend-docker.sh`（前端构建），提供统一的使用接口。

### 1.2 核心功能

| 功能 | 说明 |
|------|------|
| 一键构建 | 同时构建前后端所有镜像 |
| 独立构建 | 支持单独构建前端或后端 |
| 多架构支持 | 自动构建 amd64 和 arm64 双架构 |
| 镜像推送 | 支持推送到 Docker Hub、阿里云等仓库 |
| 缓存优化 | 支持构建缓存，加速重复构建 |
| 版本管理 | 统一的版本号管理 |

### 1.3 端口配置总览

```
┌─────────────────────────────────────────────────────────────┐
│                     Aigc For Study                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │   后端服务      │      │   前端服务      │              │
│  │   (FastAPI)     │      │   (React+Nginx) │              │
│  │                 │      │                 │              │
│  │  容器端口: 8000 │      │  容器端口: 80   │              │
│  │  主机端口: 38000│      │  主机端口: 3000 │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │              支持的架构                       │            │
│  │                                              │            │
│  │    linux/amd64    ←    传统服务器           │            │
│  │    linux/arm64    ←    ARM设备/Apple Silicon│            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 工作原理

```
build-all.sh 工作流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 参数解析
   ↓
2. 依赖检查 (Docker, Buildx)
   ↓
3. Builder 配置
   ↓
4. 根据参数选择构建路径
   ├─ --all      → 构建后端 + 构建前端
   ├─ --backend  → 仅构建后端
   └─ --frontend → 仅构建前端
   ↓
5. 执行构建
   ├─ 后端: 调用 build-docker.sh
   └─ 前端: 调用 build-frontend-docker.sh
   ↓
6. 结果汇总输出
   ↓
7. 完成
```

---

## 2. 快速开始

### 2.1 环境要求

```bash
# 检查 Docker 版本
docker --version
# Docker version 24.0.7+

# 检查 Buildx 版本
docker buildx version
# github.com/docker/buildx v0.11.2+
```

### 2.2 一分钟快速上手

```bash
# 1. 进入项目目录
cd /Users/prism/Program/Aigc\ For\ Study/Aigc-For-Study

# 2. 查看帮助
./scripts/build-all.sh --help

# 3. 本地构建（amd64，仅测试用）
./scripts/build-all.sh --all --platforms linux/amd64 --tag dev

# 4. 查看镜像
docker images | grep aigc
```

### 2.3 首次构建完整流程

```bash
# 完整流程示例
cd /Users/prism/Program/Aigc\ For\ Study/Aigc-For-Study

# 步骤1: 确保脚本有执行权限
chmod +x scripts/*.sh

# 步骤2: 构建双架构镜像
./scripts/build-all.sh \
    --all \
    --platforms linux/amd64,linux/arm64 \
    --tag v1.0.0

# 步骤3: 推送到阿里云
./scripts/build-all.sh \
    --all \
    --registry registry.cn-hangzhou.aliyuncs.com \
    --tag v1.0.0 \
    --push

# 步骤4: 验证镜像
docker buildx imagetools inspect \
    registry.cn-hangzhou.aliyuncs.com/aigc-api:v1.0.0
```

---

## 3. 脚本架构

### 3.1 脚本关系图

```
scripts/
├── build-all.sh              # 统一构建入口 ✅ 主脚本
├── build-docker.sh           # 后端构建脚本
├── build-frontend-docker.sh  # 前端构建脚本
├── deploy.sh                 # 部署脚本
├── init-server.sh           # 服务器初始化
└── backup.sh                 # 备份脚本

调用关系:
build-all.sh
    ├── 调用 build-docker.sh (后端)
    └── 调用 build-frontend-docker.sh (前端)
```

### 3.2 脚本职责

| 脚本 | 职责 | 端口 |
|------|------|------|
| `build-all.sh` | 统一入口，协调前后端构建 | - |
| `build-docker.sh` | 后端 Python/FastAPI 镜像构建 | 38000 |
| `build-frontend-docker.sh` | 前端 React/Nginx 镜像构建 | 3000/38010/38002 |

### 3.3 构建配置对比

| 配置项 | 后端 | 前端 |
|--------|------|------|
| **基础镜像** | python:3.11-slim | node:20-alpine + nginx:alpine |
| **容器端口** | 8000 | 80 |
| **多阶段构建** | 否 | 是 (builder + runtime) |
| **健康检查** | /health | / (nginx) |
| **工作目录** | /app | /usr/share/nginx/html |
| **启动命令** | uvicorn | nginx -g daemon off; |

---

## 4. 详细参数说明

### 4.1 完整参数列表

```bash
./scripts/build-all.sh [构建选项] [镜像配置] [高级选项]
```

#### 构建选项

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `--all` | 构建所有服务（前后端） | true | `--all` |
| `--backend` | 仅构建后端 | false | `--backend` |
| `--frontend` | 仅构建前端 | false | `--frontend` |

#### 镜像配置

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `--platforms` | 目标平台，多个用逗号分隔 | linux/amd64,linux/arm64 | `--platforms linux/amd64` |
| `--registry` | 镜像仓库地址 | (本地) | `--registry docker.io` |
| `--tag` | 镜像标签/版本 | latest | `--tag v1.0.0` |
| `--name` | 镜像名称（已内置） | aigc-api / aigc-frontend | - |

#### 高级选项

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `--push` | 构建后推送到仓库 | false | `--push` |
| `--no-cache` | 不使用构建缓存 | false | `--no-cache` |
| `--help` | 显示帮助信息 | - | `--help` |

### 4.2 参数优先级

```
命令行参数 > 环境变量 > 默认值

示例:
./build-all.sh --tag v2.0 --platforms linux/arm64

结果:
  tag = v2.0 (使用命令行参数)
  platforms = linux/arm64 (使用命令行参数)
  registry = (空，使用默认值)
```

### 4.3 镜像标签规则

| 场景 | 标签 | 示例 |
|------|------|------|
| 开发测试 | dev | `aigc-api:dev` |
| 最新构建 | latest | `aigc-api:latest` |
| 版本发布 | v1.0.0 | `aigc-api:v1.0.0` |
| Git commit | sha | `aigc-api:a1b2c3d4` |
| 日期版本 | YYYYMMDD | `aigc-api:20260507` |

---

## 5. 使用场景详解

### 场景1: 本地开发测试

**目标**: 快速构建用于本地测试

```bash
# 构建 amd64 镜像（最快速，适合 Intel/AMD 处理器）
./scripts/build-all.sh \
    --all \
    --platforms linux/amd64 \
    --tag dev

# 使用 Docker Compose 运行
docker-compose up -d

# 访问测试
# API: http://localhost:38000/docs
# Web: http://localhost:3000
```

**耗时预估**: 5-10 分钟（取决于网络和机器性能）

### 场景2: Apple Silicon Mac 开发

**目标**: 构建 arm64 镜像用于 M1/M2/M3 Mac

```bash
# 构建 arm64 镜像（Apple Silicon 原生）
./scripts/build-all.sh \
    --all \
    --platforms linux/arm64 \
    --tag dev-mac

# 拉取到本地
docker pull aigc-api:dev-mac
docker pull aigc-frontend:dev-mac
```

**优势**: 
- 构建速度更快
- 镜像直接本地运行，无需 QEMU 模拟

### 场景3: 发布前双架构构建

**目标**: 构建支持多平台的双架构镜像

```bash
# 构建双架构镜像
./scripts/build-all.sh \
    --all \
    --platforms linux/amd64,linux/arm64 \
    --tag v1.0.0

# 验证镜像架构
docker buildx imagetools inspect aigc-api:v1.0.0
docker buildx imagetools inspect aigc-frontend:v1.0.0

# 输出示例
# Name: docker.io/aigcstudy/aigc-api:v1.0.0
# Manifests:
#   Platform: linux/amd64
#   Platform: linux/arm64
```

**适用场景**:
- 服务器: amd64 (Intel/AMD)
- Apple Mac: arm64 (M系列)
- ARM 开发板: arm64
- 云服务器: amd64

### 场景4: 推送到 Docker Hub

**目标**: 分享镜像到 Docker Hub

```bash
# 构建并推送
./scripts/build-all.sh \
    --all \
    --registry docker.io \
    --name aigcstudy \
    --tag v1.0.0 \
    --push

# 镜像地址
# docker.io/aigcstudy/aigc-api:v1.0.0
# docker.io/aigcstudy/aigc-frontend:v1.0.0

# 其他开发者可以这样使用
docker pull aigcstudy/aigc-api:v1.0.0
```

### 场景5: 推送到阿里云

**目标**: 使用阿里云容器镜像服务

```bash
# 1. 创建阿里云命名空间和仓库
# 访问 https://cr.console.aliyun.com

# 2. 构建并推送
./scripts/build-all.sh \
    --all \
    --registry registry.cn-hangzhou.aliyuncs.com \
    --name your-namespace/aigc \
    --tag v1.0.0 \
    --push

# 镜像地址
# registry.cn-hangzhou.aliyuncs.com/your-namespace/aigc-api:v1.0.0
# registry.cn-hangzhou.aliyuncs.com/your-namespace/aigc-frontend:v1.0.0
```

### 场景6: 增量构建

**目标**: 仅更新修改的服务

```bash
# 修改了后端代码，仅构建后端
./scripts/build-all.sh \
    --backend \
    --tag hotfix

# 修改了前端样式，仅构建前端
./scripts/build-all.sh \
    --frontend \
    --tag hotfix
```

**节省时间**: 约 50-70%

---

## 6. 前后端构建流程

### 6.1 后端构建流程

```
build-docker.sh 执行流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 检查依赖
   └─ Docker, Buildx
   ↓
2. 配置 Builder
   └─ 创建/复用 aigc-builder
   └─ docker buildx use aigc-builder
   ↓
3. 准备构建上下文
   └─ 检查 backend/ 目录
   └─ 验证 Dockerfile
   ↓
4. 执行构建
   └─ docker buildx build
   └─ --platform linux/amd64,linux/arm64
   └─ --tag aigc-api:{tag}
   └─ --file backend/Dockerfile
   ↓
5. 加载镜像
   └─ --load (加载到本地 Docker)
   └─ 或 --push (推送到仓库)
   ↓
6. 验证镜像
   └─ docker buildx imagetools inspect
   ↓
7. 完成
```

**后端 Dockerfile 关键配置**:

```dockerfile
# 基础镜像
FROM python:3.11-slim

# 工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.2 前端构建流程

```
build-frontend-docker.sh 执行流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 检查依赖
   └─ Docker, Buildx
   ↓
2. 配置 Builder
   └─ 创建/复用 aigc-frontend-builder
   ↓
3. 构建前端 (如果 dist 不存在)
   └─ cd frontend
   └─ npm install
   └─ npm run build
   ↓
4. 执行多阶段构建
   ├─ Stage 1: Builder (Node.js)
   │   └─ npm install
   │   └─ npm run build
   │   └─ 输出 dist/
   │
   └─ Stage 2: Runtime (Nginx)
       └─ 复制 nginx.conf
       └─ 复制 dist/ 内容
       └─ 配置健康检查
   ↓
5. 加载/推送镜像
   ↓
6. 完成
```

**前端 Dockerfile 关键配置**:

```dockerfile
# ===============================================
# Stage 1: Builder - 构建阶段
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 构建参数
ARG VITE_API_BASE_URL=http://localhost:38000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建生产版本
RUN npm run build

# ===============================================
# Stage 2: Runtime - 运行阶段
# ===============================================
FROM nginx:alpine AS runtime

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s \
    CMD wget --quiet --tries=1 --spider http://localhost/

# 启动
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. 镜像管理

### 7.1 镜像命名规范

```
{registry}/{namespace}/{name}:{tag}

示例:
registry.cn-hangzhou.aliyuncs.com/aigcstudy/aigc-api:v1.0.0
```

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| registry | 镜像仓库地址 | docker.io, registry.cn-hangzhou.aliyuncs.com |
| namespace | 命名空间/账户 | aigcstudy, your-namespace |
| name | 镜像名称 | aigc-api, aigc-frontend |
| tag | 版本标签 | v1.0.0, latest, dev |

### 7.2 镜像版本策略

```bash
# 开发版本
./build-all.sh --all --tag dev

# 测试版本
./build-all.sh --all --tag beta

# 预发布版本
./build-all.sh --all --tag rc1

# 正式版本
./build-all.sh --all --tag v1.0.0

# 最新版本
./build-all.sh --all --tag latest
```

### 7.3 镜像清理

```bash
# 删除本地未使用的镜像
docker image prune -f

# 删除指定镜像
docker rmi aigc-api:dev

# 删除所有未打标签的镜像
docker image prune -a

# 删除构建缓存
docker buildx prune -f
```

### 7.4 镜像查看

```bash
# 查看所有 aigc 相关镜像
docker images | grep aigc

# 查看镜像详细信息
docker inspect aigc-api:v1.0.0

# 查看镜像层
docker history aigc-api:v1.0.0

# 查看多架构镜像
docker buildx imagetools inspect aigc-api:v1.0.0
```

---

## 8. CI/CD集成

### 8.1 GitHub Actions 示例

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, develop]
  tags:
    - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.REGISTRY }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      - name: Build and push all services
        run: |
          chmod +x scripts/build-all.sh
          ./scripts/build-all.sh \
            --all \
            --registry ${{ secrets.REGISTRY }} \
            --tag ${{ github.ref_name }} \
            --push

      - name: Build and push backend only
        if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
        run: |
          chmod +x scripts/build-all.sh
          ./scripts/build-all.sh \
            --backend \
            --registry ${{ secrets.REGISTRY }} \
            --tag develop \
            --push
```

### 8.2 GitLab CI 示例

```yaml
variables:
  REGISTRY: registry.cn-hangzhou.aliyuncs.com
  NAMESPACE: your-namespace
  IMAGE_TAG: $CI_COMMIT_TAG

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - chmod +x scripts/build-all.sh
    - ./scripts/build-all.sh \
        --all \
        --registry $REGISTRY \
        --name $NAMESPACE/aigc \
        --tag $IMAGE_TAG \
        --push
```

### 8.3 Jenkins 示例

```groovy
pipeline {
    agent any
    
    environment {
        REGISTRY = 'registry.cn-hangzhou.aliyuncs.com'
        NAMESPACE = 'your-namespace'
    }
    
    stages {
        stage('Build') {
            steps {
                sh '''
                    chmod +x scripts/build-all.sh
                    ./scripts/build-all.sh \
                        --all \
                        --registry ${REGISTRY} \
                        --name ${NAMESPACE}/aigc \
                        --tag ${env.BUILD_NUMBER} \
                        --push
                '''
            }
        }
    }
}
```

---

## 9. 故障排查

### 9.1 构建失败排查

#### 问题1: Docker 未安装

```bash
# 错误信息
[ERROR] Docker 未安装

# 解决方案
# Linux
curl -fsSL https://get.docker.com | sh

# macOS
# 下载 Docker Desktop: https://www.docker.com/products/docker-desktop
```

#### 问题2: Buildx 未安装

```bash
# 错误信息
[ERROR] Docker Buildx 未安装

# 解决方案
# Linux
sudo apt-get install docker-buildx-plugin

# macOS (Docker Desktop 已包含)
# 重启 Docker Desktop
```

#### 问题3: Builder 未配置

```bash
# 错误信息
[ERROR] Builder 不存在

# 解决方案
# 自动创建
docker buildx create --name aigc-builder --driver docker-container --bootstrap
docker buildx use aigc-builder

# 或使用脚本自动配置
./scripts/build-all.sh --help
# 脚本会自动检查和创建 Builder
```

#### 问题4: 磁盘空间不足

```bash
# 错误信息
# no space left on device

# 解决方案
# 1. 清理 Docker
docker system prune -a

# 2. 清理构建缓存
docker buildx prune -a

# 3. 清理未使用的镜像
docker image prune -a

# 4. 检查磁盘空间
df -h
```

### 9.2 推送失败排查

#### 问题1: 未登录镜像仓库

```bash
# 错误信息
# unauthorized: authentication required

# 解决方案
# Docker Hub
docker login

# 阿里云
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com
```

#### 问题2: 仓库地址错误

```bash
# 检查仓库地址
# 阿里云格式
registry.cn-hangzhou.aliyuncs.com/{namespace}/{repo}

# Docker Hub 格式
docker.io/{username}/{repo}

# 验证镜像
docker buildx imagetools inspect your-registry/image:tag
```

### 9.3 镜像运行失败排查

#### 问题1: 端口冲突

```bash
# 错误信息
# Bind for 0.0.0.0:38000 failed: port is already allocated

# 解决方案
# 1. 检查占用端口的进程
lsof -i :38000

# 2. 停止占用进程
docker stop $(docker ps -q --filter "publish=38000")

# 3. 使用不同端口
docker run -p 38001:8000 aigc-api:v1.0.0
```

#### 问题2: 环境变量缺失

```bash
# 错误信息
# Error: DATABASE_URL is not set

# 解决方案
# 设置环境变量
docker run -e DATABASE_URL=postgresql://user:pass@host:5432/db aigc-api:v1.0.0

# 或使用 .env 文件
docker run --env-file .env aigc-api:v1.0.0
```

### 9.4 构建日志分析

```bash
# 查看详细构建日志
./scripts/build-all.sh --all --tag debug 2>&1 | tee build.log

# 分析构建时间
docker buildx build --progress=plain ...

# 查看构建缓存使用情况
docker buildx ls
```

---

## 10. 最佳实践

### 10.1 构建优化

#### 使用构建缓存

```bash
# 启用构建缓存（CI/CD 推荐）
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --cache-from type=gha \
    --cache-to type=gha,mode=max \
    --push \
    ...

# 本地构建缓存
docker buildx build \
    --platform linux/amd64 \
    --cache-from type=local,src=/tmp/cache \
    --cache-to type=local,dest=/tmp/cache-new \
    ...
```

#### 优化 Dockerfile

```dockerfile
# 1. 使用多阶段构建减小镜像体积
# 2. 按需安装依赖
# 3. 合理安排 COPY 顺序利用缓存
# 4. 使用 .dockerignore 排除不必要文件

# 示例 .dockerignore
node_modules
.git
*.md
.env
__pycache__
*.pyc
```

### 10.2 版本管理

```bash
# 推荐版本命名
# 主版本.次版本.修订版本
v1.0.0  # 正式发布
v1.0.1  # 修订版本（Bug修复）
v1.1.0  # 次版本（新功能）
v2.0.0  # 主版本（Breaking Changes）

# Git tag 触发构建
git tag v1.0.0
git push origin v1.0.0
```

### 10.3 镜像安全

```bash
# 1. 定期更新基础镜像
# 2. 扫描镜像漏洞
docker scout cves aigc-api:v1.0.0

# 3. 使用最小化基础镜像
# 后端: python:3.11-slim
# 前端: alpine

# 4. 不在镜像中存储敏感信息
# 使用环境变量或密钥管理服务
```

### 10.4 自动化建议

```yaml
# 推荐的工作流程
# 1. develop 分支推送 → 自动构建并推送到测试环境
# 2. main 分支合并 → 自动构建并推送到预发布环境
# 3. Git tag 创建 → 自动构建并推送到生产环境
```

---

## 11. 常见问题FAQ

### Q1: 构建需要多长时间？

**答**: 取决于多个因素：
- 首次构建: 5-15 分钟（需要下载基础镜像和依赖）
- 增量构建: 1-5 分钟（利用缓存）
- 多架构构建: 时间约翻倍（需要构建两个平台）

### Q2: arm64 构建太慢怎么办？

**答**: 在 Apple Silicon Mac 上，直接构建 arm64 比通过 QEMU 模拟快得多：

```bash
# macOS (Apple Silicon)
./scripts/build-all.sh --all --platforms linux/arm64

# Linux (需要 QEMU 模拟)
# 建议仅构建 amd64，或使用远程构建服务
```

### Q3: 如何查看构建进度？

**答**: 使用 `--progress` 参数：

```bash
docker buildx build --progress=plain ...
```

### Q4: 可以同时构建多个版本吗？

**答**: 需要多次执行脚本：

```bash
./build-all.sh --all --tag v1.0.0 --push
./build-all.sh --all --tag v1.1.0 --push
./build-all.sh --all --tag latest --push
```

### Q5: 如何回滚到旧版本？

**答**:

```bash
# 拉取旧版本镜像
docker pull your-registry/aigc-api:old-version

# 使用 Docker Compose 回滚
# 编辑 docker-compose.yml 中的镜像版本
docker-compose down
docker-compose up -d
```

### Q6: 镜像可以跨平台使用吗？

**答**: 是的，使用多架构镜像：

```bash
# 构建时指定多架构
./build-all.sh --all --platforms linux/amd64,linux/arm64

# Docker 会自动选择对应平台的镜像
docker run your-registry/aigc-api:v1.0.0
# 在 amd64 机器上运行 amd64 镜像
# 在 arm64 机器上运行 arm64 镜像
```

### Q7: 如何调试构建失败？

**答**:

```bash
# 1. 使用详细日志
./build-all.sh --all --tag debug 2>&1 | tee build.log

# 2. 分步构建
./scripts/build-docker.sh --platforms linux/amd64 --tag debug
./scripts/build-frontend-docker.sh --platforms linux/amd64 --tag debug

# 3. 查看 Docker 构建日志
docker buildx build --progress=plain --no-cache ...
```

### Q8: 可以自定义镜像名称吗？

**答**: 目前脚本内置了镜像名称：
- 后端: `aigc-api`
- 前端: `aigc-frontend`

如需自定义，可以修改脚本中的 `IMAGE_NAME` 变量。

---

## 附录

### A. 相关文件

| 文件路径 | 说明 |
|---------|------|
| `scripts/build-all.sh` | 统一构建脚本 |
| `scripts/build-docker.sh` | 后端构建脚本 |
| `scripts/build-frontend-docker.sh` | 前端构建脚本 |
| `backend/Dockerfile` | 后端 Dockerfile |
| `frontend/Dockerfile` | 前端 Dockerfile |
| `docker-compose.yml` | 本地开发配置 |
| `docker-compose.staging.yml` | 测试环境配置 |
| `docker-compose.production.yml` | 生产环境配置 |

### B. 环境变量参考

| 变量 | 说明 | 后端示例 | 前端示例 |
|------|------|---------|---------|
| `DATABASE_URL` | 数据库连接 | `postgresql://...` | - |
| `REDIS_URL` | Redis 连接 | `redis://...` | - |
| `VITE_API_BASE_URL` | API 地址 | - | `http://localhost:38000/api/v1` |
| `DEEPSEEK_API_KEY` | DeepSeek API | `sk-xxx` | - |

### C. 快速命令参考

```bash
# 查看帮助
./scripts/build-all.sh --help

# 本地构建
./scripts/build-all.sh --all --platforms linux/amd64 --tag dev

# 双架构构建
./scripts/build-all.sh --all --tag v1.0.0

# 推送到仓库
./scripts/build-all.sh --all --registry YOUR_REGISTRY --tag v1.0.0 --push

# 仅构建后端
./scripts/build-all.sh --backend --tag v1.0.0

# 仅构建前端
./scripts/build-all.sh --frontend --tag v1.0.0
```

---

**文档版本**: v2.0
**最后更新**: 2026-05-07
**维护者**: Aigc For Study Team
**反馈**: https://github.com/ljh372199-rgb/Aigc-For-Study/issues
