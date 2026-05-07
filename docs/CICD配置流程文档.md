# Aigc For Study CI/CD配置流程文档

**版本:** v1.0  
**更新日期:** 2025-05-07  
**适用范围:** MVP外包开发阶段

---

## 1. CI/CD概述

### 1.1 CI/CD目标

- **持续集成 (CI)**: 代码提交后自动构建、测试、检查代码质量
- **持续部署 (CD)**: 测试通过后自动部署到测试环境，手动触发生产部署
- **质量保障**: 自动化测试、代码扫描、安全检查

### 1.2 CI/CD流程图

```
代码提交
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                      CI 流程                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 代码检查  │→│ 单元测试  │→│ 构建镜像  │→│ 推送仓库  │    │
│  │ (Lint)   │  │  (Test)  │  │ (Build)  │  │ (Push)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                      CD 流程                                 │
│  ┌──────────┐                    ┌──────────┐              │
│  │ 自动部署  │ (develop分支)      │ 手动部署  │ (main分支)   │
│  │ 测试环境  │                    │ 生产环境  │              │
│  └──────────┘                    └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 技术选型

| 组件 | 工具 | 说明 |
|------|------|------|
| CI/CD平台 | GitHub Actions | 免费、与GitHub深度集成 |
| 容器镜像仓库 | Docker Hub / GitHub Container Registry | 镜像存储 |
| 代码质量 | SonarQube / Codecov | 代码扫描、测试覆盖率 |
| 部署方式 | SSH + Docker Compose | 简单可靠 |

---

## 2. GitHub Actions配置

### 2.1 工作流文件结构

```
.github/
├── workflows/
│   ├── ci.yml                    # 持续集成
│   ├── deploy-staging.yml        # 部署到测试环境
│   ├── deploy-production.yml     # 部署到生产环境
│   └── security-scan.yml         # 安全扫描
└── actions/
    └── setup/
        └── action.yml            # 自定义Action
```

### 2.2 持续集成工作流 (ci.yml)

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # 后端代码检查和测试
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with Black
        run: black --check .

      - name: Lint with isort
        run: isort --check-only .

      - name: Lint with flake8
        run: flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Run unit tests
        run: pytest tests/ -v --cov=app --cov-report=xml

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage.xml
          flags: backend

  # 前端代码检查和测试
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint with ESLint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Build
        run: npm run build

  # 构建Docker镜像
  build:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ghcr.io/${{ github.repository }}/api
            ghcr.io/${{ github.repository }}/web
          tags: |
            type=ref,event=branch
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository }}/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/${{ github.repository }}/web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 2.3 部署到测试环境 (deploy-staging.yml)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /app/aigc-for-study
            
            # 拉取最新代码
            git pull origin develop
            
            # 拉取最新镜像
            docker-compose pull
            
            # 重启服务
            docker-compose up -d
            
            # 执行数据库迁移
            docker-compose exec -T api alembic upgrade head
            
            # 健康检查
            sleep 10
            curl -f https://staging.aigcstudy.com/health || exit 1
            
            # 清理旧镜像
            docker image prune -f

      - name: Notify deployment status
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "Deployment to staging succeeded"
            # 可以添加钉钉/企业微信通知
          else
            echo "Deployment to staging failed"
            # 发送失败通知
          fi
```

### 2.4 部署到生产环境 (deploy-production.yml)

```yaml
name: Deploy to Production

on:
  release:
    types: [ published ]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy (e.g., v1.0.0)'
        required: true
        default: 'latest'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Verify version
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            VERSION="${{ github.event.inputs.version }}"
          else
            VERSION="${{ github.event.release.tag_name }}"
          fi
          echo "Deploying version: $VERSION"
          echo "VERSION=$VERSION" >> $GITHUB_ENV

      - name: Backup database
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            # 执行备份
            /app/scripts/backup.sh
            
            # 验证备份文件
            ls -la /backups/

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /app/aigc-for-study
            
            # 拉取指定版本
            git fetch --tags
            git checkout ${{ env.VERSION }}
            
            # 拉取镜像
            docker-compose pull
            
            # 滚动更新（先停止旧服务）
            docker-compose down
            
            # 启动新服务
            docker-compose up -d
            
            # 执行数据库迁移
            docker-compose exec -T api alembic upgrade head
            
            # 健康检查
            sleep 15
            curl -f https://aigcstudy.com/health || exit 1
            
            # 清理
            docker image prune -f

      - name: Verify deployment
        run: |
          # 验证服务可用性
          curl -f https://aigcstudy.com/health
          curl -f https://aigcstudy.com/api/v1/health

      - name: Notify deployment success
        if: success()
        run: |
          echo "Production deployment succeeded: ${{ env.VERSION }}"
          # 发送成功通知（钉钉/企业微信/邮件）

      - name: Rollback on failure
        if: failure()
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /app/aigc-for-study
            
            # 回滚到上一个版本
            git checkout HEAD~1
            docker-compose up -d
            
            # 恢复数据库
            # /app/scripts/restore.sh

      - name: Notify deployment failure
        if: failure()
        run: |
          echo "Production deployment failed, rollback executed"
          # 发送失败通知
```

### 2.5 安全扫描 (security-scan.yml)

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'  # 每周一凌晨2点

jobs:
  trivy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  dependency-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/python@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  codeql:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      matrix:
        language: [ 'python', 'javascript' ]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

---

## 3. Secrets配置

### 3.1 GitHub Secrets清单

| Secret名称 | 说明 | 使用场景 |
|------------|------|----------|
| `STAGING_HOST` | 测试服务器IP | 部署测试环境 |
| `STAGING_USER` | 测试服务器用户名 | 部署测试环境 |
| `STAGING_SSH_KEY` | 测试服务器SSH私钥 | 部署测试环境 |
| `PRODUCTION_HOST` | 生产服务器IP | 部署生产环境 |
| `PRODUCTION_USER` | 生产服务器用户名 | 部署生产环境 |
| `PRODUCTION_SSH_KEY` | 生产服务器SSH私钥 | 部署生产环境 |
| `OPENAI_API_KEY` | OpenAI API密钥 | 应用运行 |
| `CLAUDE_API_KEY` | Claude API密钥 | 应用运行 |
| `JWT_SECRET_KEY` | JWT签名密钥 | 应用运行 |
| `DB_PASSWORD` | 数据库密码 | 应用运行 |
| `SNYK_TOKEN` | Snyk令牌 | 安全扫描 |

### 3.2 配置Secrets步骤

1. 进入GitHub仓库 -> Settings -> Secrets and variables -> Actions
2. 点击 "New repository secret"
3. 输入名称和值
4. 点击 "Add secret"

### 3.3 SSH密钥配置

```bash
# 生成SSH密钥对
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key

# 将公钥添加到服务器
ssh-copy-id -i github-actions-key.pub user@server-ip

# 将私钥添加到GitHub Secrets
cat github-actions-key
# 复制内容到 STAGING_SSH_KEY 或 PRODUCTION_SSH_KEY
```

---

## 4. 服务器端配置

### 4.1 服务器初始化脚本

**init-server.sh**

```bash
#!/bin/bash

# 更新系统
apt update && apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 安装Git
apt install -y git

# 创建应用目录
mkdir -p /app/aigc-for-study
mkdir -p /app/scripts
mkdir -p /backups
mkdir -p /logs

# 克隆代码
cd /app/aigc-for-study
git clone https://github.com/xxx/aigc-for-study.git .

# 设置权限
chown -R $USER:$USER /app
chmod +x /app/scripts/*.sh

# 配置防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

echo "Server initialization completed!"
```

### 4.2 部署前检查脚本

**pre-deploy-check.sh**

```bash
#!/bin/bash

echo "=== Pre-deployment Check ==="

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi
echo "Docker: OK"

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    exit 1
fi
echo "Docker Compose: OK"

# 检查磁盘空间
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi
echo "Disk usage: ${DISK_USAGE}%"

# 检查内存
MEMORY_USAGE=$(free | awk '/Mem/{printf("%.0f"), $3/$2*100}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi
echo "Memory usage: ${MEMORY_USAGE}%"

# 检查端口
if netstat -tuln | grep -q ":80 "; then
    echo "Port 80: In use"
else
    echo "Port 80: Available"
fi

if netstat -tuln | grep -q ":443 "; then
    echo "Port 443: In use"
else
    echo "Port 443: Available"
fi

echo "=== Check completed ==="
```

---

## 5. 部署流程

### 5.1 部署到测试环境

**自动触发条件：**
- 代码推送到 `develop` 分支
- PR合并到 `develop` 分支

**手动触发：**
1. 进入GitHub仓库 -> Actions -> Deploy to Staging
2. 点击 "Run workflow"
3. 确认执行

**部署步骤：**
```
1. 拉取最新代码
2. 拉取最新镜像
3. 重启服务
4. 执行数据库迁移
5. 健康检查
6. 清理旧镜像
```

### 5.2 部署到生产环境

**触发条件：**
- 发布Release
- 手动触发（需指定版本号）

**手动触发：**
1. 进入GitHub仓库 -> Actions -> Deploy to Production
2. 点击 "Run workflow"
3. 输入版本号（如 v1.0.0）
4. 确认执行

**部署步骤：**
```
1. 备份数据库
2. 拉取指定版本代码
3. 拉取镜像
4. 停止旧服务
5. 启动新服务
6. 执行数据库迁移
7. 健康检查
8. 清理旧镜像
```

**回滚流程：**
```
如果部署失败：
1. 自动回滚到上一个版本
2. 恢复数据库（如需要）
3. 发送失败通知
```

---

## 6. 监控与告警

### 6.1 部署状态监控

**GitHub Actions通知：**
- 部署成功/失败发送邮件通知

### 6.2 部署日志

**查看部署日志：**
1. 进入GitHub仓库 -> Actions
2. 选择对应的工作流运行记录
3. 查看详细日志

**服务器端日志：**
```bash
# 查看服务日志
docker-compose logs -f api
docker-compose logs -f web

# 查看部署日志
tail -f /logs/deploy.log
```

---

## 7. 常见问题排查

### 7.1 部署失败

**问题：SSH连接失败**

```bash
# 检查SSH密钥权限
chmod 600 ~/.ssh/id_rsa

# 测试SSH连接
ssh -i ~/.ssh/id_rsa user@server-ip

# 检查服务器SSH配置
sudo vi /etc/ssh/sshd_config
```

**问题：Docker镜像拉取失败**

```bash
# 登录镜像仓库
docker login ghcr.io -u USERNAME -p TOKEN

# 手动拉取镜像
docker pull ghcr.io/xxx/aigc-api:latest
```

**问题：数据库迁移失败**

```bash
# 查看迁移状态
docker-compose exec api alembic current

# 回滚迁移
docker-compose exec api alembic downgrade -1

# 重新执行迁移
docker-compose exec api alembic upgrade head
```

### 7.2 服务异常

**问题：服务无法启动**

```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs api

# 检查端口占用
netstat -tuln | grep 8000
```

**问题：健康检查失败**

```bash
# 手动测试健康检查
curl http://localhost:8000/health

# 检查服务内部状态
docker-compose exec api curl localhost:8000/health
```

---

## 8. 最佳实践

### 8.1 部署前检查清单

- [ ] 代码已通过CI测试
- [ ] 数据库备份已完成
- [ ] Secrets配置正确
- [ ] 服务器资源充足
- [ ] 回滚方案已准备

### 8.2 部署后验证

- [ ] 健康检查通过
- [ ] 核心功能可用
- [ ] 监控指标正常
- [ ] 日志无错误

### 8.3 安全建议

1. **最小权限原则**
   - SSH用户仅授予必要权限
   - API密钥使用只读权限

2. **敏感信息保护**
   - 所有密钥存储在GitHub Secrets
   - 禁止在代码中硬编码

3. **审计日志**
   - 记录所有部署操作
   - 定期审查访问日志

---

## 附录

### A. 快速命令参考

```bash
# 手动触发部署
gh workflow run deploy-staging.yml
gh workflow run deploy-production.yml -f version=v1.0.0

# 查看工作流运行状态
gh run list

# 查看特定运行详情
gh run view RUN_ID

# 取消正在运行的工作流
gh run cancel RUN_ID

# 重新运行失败的工作流
gh run rerun RUN_ID
```

### B. Docker Compose常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service]

# 进入容器
docker-compose exec [service] bash

# 拉取镜像
docker-compose pull

# 构建镜像
docker-compose build
```

### C. 环境变量检查

```bash
# 检查所有环境变量
docker-compose config

# 检查特定服务环境变量
docker-compose exec api env

# 验证Secrets是否正确
gh secret list
```

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-05-07 | 初始版本 | |
