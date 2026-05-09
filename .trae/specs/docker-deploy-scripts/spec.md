# Docker双架构构建与部署脚本规范

## 1. 概述

本文档定义了Aigc For Study项目的Docker双架构构建与部署脚本的设计规范，基于《Docker双架构构建指南》实现自动化构建与部署流程。

## 2. 为什么需要这些脚本

当前项目需要支持：
- **多架构构建**：同时构建amd64和arm64架构的Docker镜像
- **多环境部署**：支持测试环境和生产环境的独立部署
- **端口隔离**：测试环境使用38000端口，生产环境使用38001端口
- **自动化流程**：减少手动操作，提高部署效率

## 3. 端口配置

| 服务 | 容器端口 | 测试环境主机 | 生产环境主机 |
|------|----------|-------------|-------------|
| API | 38000 | 38000 | 38001 |
| Web | 80 | 38010 | 38002 |
| PostgreSQL | 5432 | 5433 | 5434 |
| Redis | 6379 | 6380 | 6381 |

## 4. 脚本清单

### 4.1 scripts/build-docker.sh
多架构Docker镜像构建脚本

**功能**：
- 支持单架构和双架构构建
- 支持推送到Docker Hub或阿里云
- 支持自定义镜像名称和标签
- 支持构建缓存加速

**参数**：
| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--platforms` | 目标平台 | linux/amd64,linux/arm64 |
| `--registry` | 镜像仓库地址 | (本地) |
| `--name` | 镜像名称 | aigc-api |
| `--tag` | 镜像标签 | latest |
| `--context` | 构建上下文路径 | ./backend |
| `--push` | 构建后是否推送 | false |

### 4.2 scripts/deploy.sh
服务器部署脚本

**功能**：
- 自动构建并推送Docker镜像
- 自动部署到指定环境（测试/生产）
- 支持回滚到指定版本
- 自动执行健康检查

**参数**：
| 参数 | 说明 | 选项 |
|------|------|------|
| `--env` | 部署环境 | staging/production |
| `--version` | 部署版本 | (tag名称) |
| `--registry` | 镜像仓库 | (必填) |

### 4.3 scripts/init-server.sh
服务器初始化脚本

**功能**：
- 安装Docker和Docker Compose
- 创建应用目录结构
- 配置防火墙规则
- 克隆代码仓库

## 5. 目录结构

```
Aigc-For-Study/
├── scripts/
│   ├── build-docker.sh     # Docker镜像构建脚本
│   ├── deploy.sh           # 部署脚本
│   ├── init-server.sh      # 服务器初始化脚本
│   └── backup.sh           # 备份脚本 (可选)
├── backend/
│   └── Dockerfile          # 多阶段Dockerfile (端口38000)
└── docker-compose.*.yml    # 各环境配置
```

## 6. 环境要求

- Docker 19.03+
- Docker Compose 2.20+
- bash 4.0+
- 网络连接（用于拉取镜像）

## 7. 使用流程

```
1. 本地构建 (可选)
   ./scripts/build-docker.sh --tag v1.0.0

2. 推送到仓库
   ./scripts/build-docker.sh --registry registry.cn-hangzhou.aliyuncs.com \
       --name namespace/aigc-api --tag v1.0.0 --push

3. 部署到测试环境
   ./scripts/deploy.sh --env staging --version v1.0.0 \
       --registry registry.cn-hangzhou.aliyuncs.com

4. 部署到生产环境
   ./scripts/deploy.sh --env production --version v1.0.0 \
       --registry registry.cn-hangzhou.aliyuncs.com
```

## 8. 验收标准

- 构建脚本支持amd64和arm64双架构构建
- 部署脚本支持测试和生产环境隔离
- 脚本执行后服务端口与配置一致
- 健康检查返回正常状态
