# Aigc For Study

> AI赋能学习，成就高效人生

## 产品愿景

加入AI辅助，引导用户正确使用AI，学习新时代下的新学习方式。

## 产品定位

- 学习通深度集成AI爆改版
- 学生自学平台

## 目标用户

- 高效学生与老师
- 有自学需求的学生

## 核心功能

### 学生端
- 🎯 职业选择与AI学习方案生成
- 📊 每日学习打卡与进度追踪
- ✨ AI生成个性化练习题
- ✅ AI智能批改与反馈

### 教师端
- 📝 作业发布与管理
- 🤖 AI自动批改作业
- 📋 学生学习方案定制
- 📈 学习数据分析与评估

## 技术栈

### 后端
- Python 3.11+
- FastAPI
- PostgreSQL
- Redis

### 前端
- React 18
- TypeScript
- Vite

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD

## 快速开始

### 环境要求

- Docker 24.0+
- Docker Compose 2.20+
- Python 3.11+
- Node.js 18+

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ljh372199-rgb/Aigc-For-Study.git
cd Aigc-For-Study

# 启动开发环境
docker-compose up -d
```

### API文档

启动后访问: http://localhost:8000/docs

## CI/CD

- **develop分支**: 自动部署到测试环境
- **main分支**: 手动触发部署到生产环境
- **Release**: 创建GitHub Release触发生产部署

## 开发规范

详见 [开发流程规范](docs/Aigc_For_Study_开发流程规范.md)

## 部署文档

详见 [环境配置文档](docs/环境配置文档.md) 和 [CI/CD配置流程文档](docs/CICD配置流程文档.md)

## 许可证

MIT License
