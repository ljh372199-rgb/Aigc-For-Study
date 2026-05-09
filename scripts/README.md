# Aigc For Study - 部署脚本

本目录包含用于构建、部署和管理 Aigc For Study 应用的脚本工具。

## 脚本清单

| 脚本 | 说明 |
|------|------|
| `build-all.sh` | 统一构建脚本（前后端一键构建） |
| `build-docker.sh` | 后端 Docker 多架构构建脚本 |
| `build-frontend-docker.sh` | 前端 Docker 多架构构建脚本 |
| `deploy.sh` | 服务器部署脚本 |
| `init-server.sh` | 服务器初始化脚本 |
| `backup.sh` | 数据库和文件备份脚本 |

## 快速开始

### 1. 构建 Docker 镜像（推荐）

**统一构建（一键构建前后端）**：
```bash
# 本地构建（amd64，仅测试用）
./build-all.sh --all --platforms linux/amd64 --tag dev

# 本地构建（双架构）
./build-all.sh --all --tag latest

# 构建并推送到阿里云
./build-all.sh --all \
    --registry registry.cn-hangzhou.aliyuncs.com \
    --tag v1.0.0 \
    --push
```

**单独构建**：
```bash
# 仅构建后端
./build-all.sh --backend --tag v1.0.0

# 仅构建前端
./build-all.sh --frontend --tag v1.0.0
```

### 2. 部署到服务器

```bash
# 部署到测试环境
./deploy.sh \
    --env staging \
    --version v1.0.0 \
    --registry registry.cn-hangzhou.aliyuncs.com/namespace/aigc-api

# 部署到生产环境
./deploy.sh \
    --env production \
    --version v1.0.0 \
    --registry registry.cn-hangzhou.aliyuncs.com/namespace/aigc-api
```

### 3. 服务器初始化

首次在服务器上运行时，需要执行初始化脚本：

```bash
# 完整安装
sudo ./init-server.sh

# 跳过防火墙配置
sudo ./init-server.sh --skip-firewall
```

### 4. 备份

```bash
# 备份所有环境
./backup.sh

# 备份测试环境数据库
./backup.sh --env staging --db-only

# 查看备份列表
./backup.sh --list
```

## 端口配置

### 测试环境 (Staging)

| 服务 | 端口 |
|------|------|
| API | 38000 |
| Web | 38010 |
| PostgreSQL | 5433 |
| Redis | 6380 |

### 生产环境 (Production)

| 服务 | 端口 |
|------|------|
| API | 38001 |
| Web | 38002 |
| PostgreSQL | 5434 |
| Redis | 6381 |

## 工作流程

```
┌─────────────────┐
│  本地开发       │
│  git commit     │
└────────┬────────┘
         │ push
         ▼
┌─────────────────┐
│  GitHub Actions │
│  CI 测试        │
└────────┬────────┘
         │ 通过
         ▼
┌─────────────────┐
│  本地构建       │
│  build-docker.sh│
└────────┬────────┘
         │ push
         ▼
┌─────────────────┐
│  镜像仓库       │
│  阿里云/DockerHub│
└────────┬────────┘
         │ 拉取
         ▼
┌─────────────────┐
│  服务器部署     │
│  deploy.sh      │
└─────────────────┘
```

## 详细参数

### build-docker.sh

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--platforms` | 目标平台 | linux/amd64,linux/arm64 |
| `--registry` | 镜像仓库 | (本地) |
| `--name` | 镜像名称 | aigc-api |
| `--tag` | 镜像标签 | latest |
| `--context` | 构建上下文 | ./backend |
| `--push` | 推送到仓库 | false |

### deploy.sh

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--env` | 部署环境 | staging |
| `--version` | 镜像版本 | latest |
| `--registry` | 镜像仓库 | (必填) |

### init-server.sh

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--app-dir` | 应用目录 | /app/aigc-for-study |
| `--git-repo` | Git仓库 | GitHub仓库地址 |
| `--app-user` | 应用用户 | ubuntu |
| `--skip-docker` | 跳过Docker安装 | false |
| `--skip-firewall` | 跳过防火墙配置 | false |

### backup.sh

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--env` | 备份环境 | all |
| `--backup-dir` | 备份目录 | ./backups |
| `--keep-days` | 保留天数 | 7 |
| `--db-only` | 仅备份数据库 | false |
| `--files-only` | 仅备份文件 | false |

## 故障排查

### 构建失败

```bash
# 检查 Docker 版本
docker --version

# 检查 Buildx
docker buildx version

# 清理 Builder 重新创建
docker buildx rm aigc-builder
docker buildx create --name aigc-builder --driver docker-container --bootstrap
```

### 部署失败

```bash
# 检查容器状态
docker ps -a

# 查看日志
docker-compose -f /app/aigc-for-study/docker-compose.staging.yml logs -f

# 检查端口占用
netstat -tlnp | grep 38000
```

### 备份失败

```bash
# 检查容器是否运行
docker ps | grep aigc-db

# 手动备份数据库
docker exec aigc-db-staging pg_dump -U aigc -d aigc_staging > backup.sql
```
