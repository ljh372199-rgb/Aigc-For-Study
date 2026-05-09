# Docker统一构建脚本验证清单

## 脚本创建验证

- [ ] scripts/build-all.sh 文件已创建
- [ ] scripts/build-services.sh 文件已创建（可选）
- [ ] scripts/build-all.sh 具有执行权限
- [ ] scripts/build-frontend-docker.sh 具有执行权限
- [ ] scripts/build-docker.sh 具有执行权限

## 构建脚本验证 (build-all.sh)

### 帮助信息验证
- [ ] 支持 `--help` 参数
- [ ] 支持 `--all` 参数
- [ ] 支持 `--backend` 参数
- [ ] 支持 `--frontend` 参数
- [ ] 支持 `--platforms` 参数
- [ ] 支持 `--registry` 参数
- [ ] 支持 `--tag` 参数
- [ ] 支持 `--push` 参数
- [ ] 支持 `--no-cache` 参数

### 功能验证
- [ ] `--all` 参数构建前后端所有镜像
- [ ] `--backend` 参数仅构建后端镜像
- [ ] `--frontend` 参数仅构建前端镜像
- [ ] `--push` 参数正确推送镜像到仓库
- [ ] `--no-cache` 参数禁用构建缓存
- [ ] 默认构建 amd64 和 arm64 双架构

### 输出验证
- [ ] 日志输出包含构建进度
- [ ] 错误信息清晰易懂
- [ ] 构建结果汇总完整

## 后端构建脚本验证 (build-docker.sh)

- [ ] 支持 `--help` 参数
- [ ] 支持 `--platforms` 参数
- [ ] 支持 `--registry` 参数
- [ ] 支持 `--name` 参数
- [ ] 支持 `--tag` 参数
- [ ] 支持 `--context` 参数
- [ ] 支持 `--push` 参数
- [ ] Docker Buildx 配置正确
- [ ] 镜像标签正确

## 前端构建脚本验证 (build-frontend-docker.sh)

- [ ] 支持 `--help` 参数
- [ ] 支持 `--registry` 参数
- [ ] 支持 `--name` 参数
- [ ] 支持 `--tag` 参数
- [ ] 支持 `--platforms` 参数
- [ ] 支持 `--context` 参数
- [ ] 支持 `--push` 参数
- [ ] 自动构建前端 dist 目录
- [ ] 多阶段构建正确

## Docker Compose 集成验证

- [ ] docker-compose.yml 正确配置前后端镜像
- [ ] docker-compose.staging.yml 正确配置测试环境
- [ ] docker-compose.production.yml 正确配置生产环境
- [ ] 端口映射正确 (API: 38000, Web: 38010/38002)
- [ ] 环境变量配置正确

## 镜像构建验证

### 后端镜像
- [ ] 后端镜像构建成功
- [ ] 后端镜像包含正确的工作目录
- [ ] 后端镜像包含健康检查
- [ ] 后端镜像支持 amd64 架构
- [ ] 后端镜像支持 arm64 架构

### 前端镜像
- [ ] 前端镜像构建成功
- [ ] 前端镜像包含 dist 目录
- [ ] 前端镜像包含 nginx 配置
- [ ] 前端镜像包含健康检查
- [ ] 前端镜像支持 amd64 架构
- [ ] 前端镜像支持 arm64 架构

## 功能测试

### 本地构建测试
- [ ] `build-all.sh --all --platforms linux/amd64` 构建成功
- [ ] `build-all.sh --backend` 后端构建成功
- [ ] `build-all.sh --frontend` 前端构建成功

### 镜像推送测试
- [ ] 推送到本地镜像仓库成功
- [ ] 镜像标签正确

### 镜像验证测试
- [ ] `docker buildx imagetools inspect` 查看镜像架构
- [ ] 拉取特定架构镜像成功
- [ ] 运行镜像成功

## 文档验证

- [ ] scripts/README.md 更新完成
- [ ] 包含所有脚本使用说明
- [ ] 包含常见问题解答
- [ ] 包含快速参考命令
