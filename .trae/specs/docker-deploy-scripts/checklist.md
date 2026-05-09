# Docker双架构构建与部署脚本验证清单

## 脚本创建验证

- [ ] scripts/build-docker.sh 文件已创建
- [ ] scripts/deploy.sh 文件已创建
- [ ] scripts/init-server.sh 文件已创建
- [ ] scripts/backup.sh 文件已创建

## 脚本权限验证

- [ ] build-docker.sh 具有执行权限 (chmod +x)
- [ ] deploy.sh 具有执行权限 (chmod +x)
- [ ] init-server.sh 具有执行权限 (chmod +x)
- [ ] backup.sh 具有执行权限 (chmod +x)

## 构建脚本验证 (build-docker.sh)

- [ ] 支持 --help 参数，显示帮助信息
- [ ] 支持 --platforms 参数指定架构
- [ ] 支持 --registry 参数指定镜像仓库
- [ ] 支持 --name 参数指定镜像名称
- [ ] 支持 --tag 参数指定镜像标签
- [ ] 支持 --context 参数指定构建上下文
- [ ] 支持 --push 参数推送到仓库
- [ ] 默认构建 amd64 和 arm64 双架构
- [ ] Docker Buildx builder 已创建或复用

## 部署脚本验证 (deploy.sh)

- [ ] 支持 --help 参数，显示帮助信息
- [ ] 支持 --env 参数指定环境 (staging/production)
- [ ] 支持 --version 参数指定版本
- [ ] 支持 --registry 参数指定镜像仓库
- [ ] 测试环境端口正确 (API:38000, Web:38010)
- [ ] 生产环境端口正确 (API:38001, Web:38002)
- [ ] 健康检查逻辑正确
- [ ] 回滚功能逻辑正确

## 初始化脚本验证 (init-server.sh)

- [ ] 支持 --help 参数，显示帮助信息
- [ ] Docker 安装逻辑正确
- [ ] Docker Compose 安装逻辑正确
- [ ] 应用目录创建逻辑正确
- [ ] 防火墙配置逻辑正确
- [ ] Git 安装逻辑正确

## 功能验证

- [ ] 构建脚本可成功构建Docker镜像
- [ ] 部署脚本可成功拉取镜像
- [ ] 部署脚本可启动Docker Compose服务
- [ ] 健康检查可正确检测服务状态
- [ ] 备份脚本可成功备份数据库

## 文档验证

- [ ] scripts/README.md 已创建
- [ ] 使用说明清晰完整
- [ ] 示例命令正确可执行
