# Docker统一构建脚本规范

## 1. 概述

本文档定义了Aigc For Study项目的Docker统一构建脚本的设计规范，整合前端和后端的Docker镜像构建流程，实现一键构建全部镜像的目标。

## 2. 为什么需要统一构建脚本

当前项目包含前端和后端两个独立的服务，需要分别构建Docker镜像。统一构建脚本可以：
- 一键构建前后端所有镜像
- 支持单独构建前端或后端
- 统一管理镜像标签和版本
- 简化CI/CD流程配置

## 3. 脚本架构

### 3.1 现有脚本

| 脚本 | 说明 | 端口 |
|------|------|------|
| `build-docker.sh` | 后端Docker构建脚本 | 38000 |
| `build-frontend-docker.sh` | 前端Docker构建脚本 | 80/3000 |

### 3.2 新增脚本

| 脚本 | 说明 |
|------|------|
| `build-all.sh` | 统一构建脚本，一键构建前后端 |
| `build-services.sh` | 服务构建辅助脚本 |

## 4. 端口配置

### 4.1 后端服务

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| API | 8000 | 38000 | FastAPI后端服务 |
| PostgreSQL | 5432 | 5432 | 数据库 |
| Redis | 6379 | 6379 | 缓存 |

### 4.2 前端服务

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| Web | 80 | 3000/38010/38002 | Nginx静态服务 |

### 4.3 环境端口映射

| 环境 | API端口 | Web端口 | 数据库端口 | Redis端口 |
|------|---------|---------|-----------|-----------|
| 本地开发 | 38000 | 3000 | 5432 | 6379 |
| 测试环境 | 38000 | 38010 | 5433 | 6380 |
| 生产环境 | 38001 | 38002 | 5434 | 6381 |

## 5. 功能需求

### 5.1 统一构建脚本 (build-all.sh)

**核心功能**：
- 一键构建前端和后端镜像
- 支持单独构建前端或后端
- 支持多架构构建 (amd64/arm64)
- 支持推送到镜像仓库
- 统一的版本管理

**参数定义**：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--all` | 构建所有服务 | true |
| `--backend` | 仅构建后端 | false |
| `--frontend` | 仅构建前端 | false |
| `--platforms` | 目标平台 | linux/amd64,linux/arm64 |
| `--registry` | 镜像仓库地址 | (本地) |
| `--tag` | 镜像标签 | latest |
| `--push` | 构建后推送到仓库 | false |
| `--no-cache` | 不使用构建缓存 | false |

**输出格式**：
```
========================================
  Aigc For Study - 统一构建
========================================

[INFO] 构建后端镜像: aigc-api:latest
[INFO] 构建前端镜像: aigc-frontend:latest
[SUCCESS] 后端镜像构建成功！
[SUCCESS] 前端镜像构建成功！

========================================
  构建完成
========================================
镜像信息:
  后端: aigc-api:latest (linux/amd64, linux/arm64)
  前端: aigc-frontend:latest (linux/amd64, linux/arm64)
```

### 5.2 后端构建脚本 (build-docker.sh)

**已实现功能**：
- ✓ 多架构构建支持
- ✓ 镜像推送功能
- ✓ Builder自动配置
- ✓ 镜像验证

**需要增强**：
- 与统一脚本集成
- 统一版本号管理
- 日志输出优化

### 5.3 前端构建脚本 (build-frontend-docker.sh)

**已实现功能**：
- ✓ 多架构构建支持
- ✓ 自动构建dist目录
- ✓ Nginx多阶段构建
- ✓ 健康检查配置

**需要增强**：
- 与统一脚本集成
- 统一版本号管理
- 日志输出优化

## 6. 使用场景

### 场景1: 本地开发构建 (amd64)

```bash
# 快速构建用于本地测试
./build-all.sh --platforms linux/amd64 --tag dev
```

### 场景2: 发布前构建 (双架构)

```bash
# 构建双架构镜像准备发布
./build-all.sh --tag v1.0.0
```

### 场景3: 仅构建后端

```bash
# 后端代码更新后仅构建后端
./build-all.sh --backend --tag v1.0.0
```

### 场景4: 构建并推送

```bash
# 推送到阿里云
./build-all.sh \
    --registry registry.cn-hangzhou.aliyuncs.com \
    --tag v1.0.0 \
    --push
```

## 7. CI/CD集成

### 7.1 GitHub Actions工作流

```yaml
name: Build and Push All Services

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
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.REGISTRY }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      - name: Build all services
        run: |
          chmod +x scripts/build-all.sh
          ./scripts/build-all.sh \
            --all \
            --registry ${{ secrets.REGISTRY }} \
            --tag ${{ github.ref_name }} \
            --push
```

## 8. 验收标准

### 8.1 功能验收

- [ ] 统一脚本可以一键构建前后端所有镜像
- [ ] 支持单独构建前端或后端
- [ ] 支持amd64和arm64双架构构建
- [ ] 支持推送到镜像仓库
- [ ] 构建日志清晰易懂

### 8.2 性能验收

- [ ] 构建时间合理（使用缓存）
- [ ] 镜像体积优化
- [ ] 多架构并行构建

### 8.3 兼容性验收

- [ ] 在macOS上正常工作
- [ ] 在Linux服务器上正常工作
- [ ] 在GitHub Actions中正常工作

## 9. 错误处理

### 9.1 构建失败

```bash
# 检测构建错误
if ! eval $BUILD_CMD; then
    log_error "镜像构建失败"
    exit 1
fi
```

### 9.2 Builder未配置

```bash
# 自动创建builder
if ! docker buildx inspect "$BUILDER_NAME" &> /dev/null; then
    log_warn "Builder不存在，正在创建..."
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
fi
```

### 9.3 推送失败

```bash
# 验证推送状态
if [ "$PUSH" = true ]; then
    docker buildx imagetools inspect "$FULL_IMAGE_TAG" || {
        log_error "镜像推送失败"
        exit 1
    }
fi
```

## 10. 最佳实践

1. **使用缓存**：启用Buildx缓存加速构建
2. **多架构支持**：默认构建amd64和arm64
3. **版本管理**：使用Git tag作为镜像版本
4. **日志清晰**：详细的构建日志便于排查问题
5. **错误处理**：完善的错误处理和回滚机制
