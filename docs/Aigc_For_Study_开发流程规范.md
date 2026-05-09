# Aigc For Study 开发流程规范

**版本:** v2.0  
**制定日期:** 2025-05-07  
**最后更新:** 2026-05-09  
**适用范围:** MVP外包开发阶段

---

## 1. 项目概述

### 1.1 项目目标

在14天内完成Aigc For Study产品的MVP版本开发，包含核心功能：
- 用户系统（学生/教师角色）
- 课程/班级管理系统
- AI学习方案生成
- 作业系统（发布/提交/AI批改）
- 基础监控和运维

### 1.2 当前开发进度 (2026-05-09)

| 模块 | 状态 | 端点数 | 备注 |
|------|------|--------|------|
| 认证模块 | ✅ 完成 | 3 | 支持用户名/邮箱登录 |
| 用户模块 | ✅ 完成 | 5 | - |
| 职业目标模块 | ✅ 完成 | 3 | - |
| 学习方案模块 | ✅ 完成 | 5 | AI生成方案 |
| 打卡模块 | ✅ 完成 | 4 | - |
| 练习题模块 | ✅ 完成 | 5 | AI生成/批改 |
| 作业模块 | ✅ 完成 | 7 | - |
| 课程模块 | ✅ 完成 | 7 | - |
| **班级模块** | ✅ 完成 | 5 | **新增：邀请码功能** |
| 作业管理模块 | ✅ 完成 | 9 | - |
| 统计分析模块 | ✅ 完成 | 4 | AI学习分析 |
| **总计** | **✅** | **57** | - |

### 1.3 测试状态

| 测试套件 | 测试数 | 通过率 |
|---------|-------|--------|
| 基础API测试 | 18 | 100% |
| 学生-老师绑定测试 | 24 | 100% |
| AI功能测试 | 26 | 100% |
| **总计** | **68** | **100%** |

---

## 2. 技术栈

### 2.1 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.11+ | 编程语言 |
| FastAPI | latest | Web框架 |
| SQLAlchemy | latest | ORM |
| PostgreSQL | 15+ | 数据库 |
| Redis | 7+ | 缓存 |
| Alembic | latest | 数据库迁移 |
| DeepSeek API | - | AI服务 |
| JWT | - | 认证 |

### 2.2 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18+ | UI框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具 |
| React Router | 6+ | 路由 |
| Tailwind CSS | 3+ | 样式 |

---

## 3. API规范

### 3.1 基础信息

- **Base URL**: `http://localhost:38000/api/v1`
- **认证方式**: JWT Bearer Token
- **登录格式**: `application/x-www-form-urlencoded` (仅登录)
- **其他API格式**: `application/json`

### 3.2 登录接口特殊说明

登录接口使用 `application/x-www-form-urlencoded` 格式：

```bash
curl -X POST http://localhost:38000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your_username_or_email&password=your_password"
```

登录支持用户名或邮箱两种方式。

### 3.3 API端点汇总

```
认证 (Auth)           - 3个端点
用户 (Users)          - 5个端点
职业目标 (Careers)     - 3个端点
学习方案 (Learning)    - 5个端点
打卡 (Check-ins)      - 4个端点
练习题 (Exercises)    - 5个端点
作业 (Assignments)    - 7个端点
课程 (Courses)        - 7个端点
班级 (Classes)        - 5个端点  ← 新增
作业管理 (Homework)   - 9个端点
统计 (Analytics)      - 4个端点
─────────────────────────────
总计                  - 57个端点
```

---

## 4. 数据库设计

### 4.1 核心表结构

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| users | 用户表 | id, username, email, role, status |
| careers | 职业目标 | id, name, description, skills_required |
| learning_plans | 学习方案 | id, user_id, career_goal_id, title, plan_data |
| check_ins | 打卡记录 | id, user_id, duration_minutes, check_in_date |
| exercises | 练习题 | id, student_id, topic, content, result |
| courses | 课程表 | id, teacher_id, title, description |
| course_enrollments | 课程报名 | id, course_id, student_id |
| homeworks | 作业表 | id, course_id, title, deadline |
| homework_submissions | 作业提交 | id, homework_id, student_id, content, score |
| **classes** | 班级表 | id, teacher_id, name, **invite_code** |
| **class_members** | 班级成员 | id, class_id, student_id, role |

### 4.2 班级功能说明

**邀请码生成规则**:
- 长度: 8位
- 字符: 大写字母 + 数字
- 唯一性: 数据库唯一索引 + 代码重试机制

```python
def generate_invite_code(length: int = 8) -> str:
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))
```

---

## 5. 项目结构

### 5.1 后端结构

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # 依赖注入
│   │   └── v1/
│   │       ├── auth.py      # 认证
│   │       ├── users.py     # 用户
│   │       ├── careers.py   # 职业
│   │       ├── learning_plan.py  # 学习方案
│   │       ├── check_ins.py     # 打卡
│   │       ├── exercises.py      # 练习题
│   │       ├── assignments.py   # 作业
│   │       ├── courses.py       # 课程
│   │       ├── classes.py       # 班级 ← 新增
│   │       ├── homework.py      # 作业管理
│   │       └── analytics.py     # 统计
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── models/
│   │   ├── user.py
│   │   ├── class_model.py   # 班级模型 ← 新增
│   │   └── ...
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── class_schema.py  # 班级Schema ← 新增
│   │   └── ...
│   ├── services/
│   │   └── ai/
│   │       ├── base.py
│   │       ├── deepseek_service.py
│   │       └── mock_service.py
│   └── main.py
├── migrations/
│   └── versions/
│       ├── 001_initial.py
│       ├── 002_add_courses_homework.py
│       └── 003_add_classes.py  ← 新增
├── tests/
│   ├── api_test.py
│   ├── test_teacher_student_binding.py
│   └── test_ai_features.py
├── Dockerfile
└── requirements.txt
```

### 5.2 前端结构

```
frontend/
├── src/
│   ├── api/                # API调用
│   ├── components/         # 组件
│   ├── pages/             # 页面
│   ├── hooks/             # Hooks
│   ├── stores/            # 状态管理
│   └── App.tsx
├── public/
├── Dockerfile
└── package.json
```

---

## 6. 开发环境

### 6.1 Docker服务

```bash
# 启动所有服务
cd Aigc-For-Study
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api
```

### 6.2 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| API | 38000 | 后端API |
| Web | 3000 | 前端页面 |
| DB | 5432 | PostgreSQL |
| Redis | 6379 | Redis |

### 6.3 健康检查

```bash
# API健康检查
curl http://localhost:38000/health

# 详细健康检查
curl http://localhost:38000/health/detailed
```

---

## 7. 代码规范

### 7.1 后端规范

- 遵循 PEP 8 规范
- 使用 Black 格式化代码
- 类型注解必须完整
- 异步优先

### 7.2 提交规范

```
<type>(<scope>): <subject>

feat(auth): 添加用户名邮箱登录支持
fix(api): 修复邀请码生成重复问题
docs(classes): 添加班级API文档
```

### 7.3 分支策略

```
main (生产分支)
  ↑
develop (开发分支)
  ↑
feature/* (功能分支)
  ↑
hotfix/* (热修分支)
```

---

## 8. 测试规范

### 8.1 测试覆盖

| 模块 | 测试用例数 | 状态 |
|------|-----------|------|
| 基础API | 18 | ✅ 通过 |
| 学生-老师绑定 | 24 | ✅ 通过 |
| AI功能 | 26 | ✅ 通过 |
| **总计** | **68** | **✅ 100%** |

### 8.2 运行测试

```bash
# 运行所有测试
cd backend
python3 tests/api_test.py
python3 tests/test_teacher_student_binding.py
python3 tests/test_ai_features.py
```

---

## 9. 部署说明

### 9.1 Docker构建

```bash
# 构建后端镜像
./scripts/build-docker.sh --tag dev

# 构建前端镜像
./scripts/build-frontend-docker.sh --tag dev

# 构建所有
./scripts/build-all.sh --all --tag dev
```

### 9.2 环境变量

```bash
# 后端
DATABASE_URL=postgresql://aigc:aigc@db:5432/aigc_dev
REDIS_URL=redis://redis:6379/0
DEEPSEEK_API_KEY=your-api-key
JWT_SECRET_KEY=your-secret-key

# 前端
VITE_API_BASE_URL=http://localhost:38000/api/v1
```

---

## 10. 文档清单

| 文档 | 路径 | 状态 |
|------|------|------|
| API参考文档 | docs/API_REFERENCE.md | ✅ 完成 |
| API测试文档 | docs/API_TEST_COMPLETE.md | ✅ 完成 |
| 前端集成指南 | docs/FRONTEND_INTEGRATION_GUIDE.md | ✅ 完成 |
| 前端开发提示词 | docs/FRONTEND_DEVELOPMENT_PROMPT.md | ✅ 完成 |
| Docker构建指南 | docs/Docker_Build_All_Script_Guide.md | ✅ 完成 |
| 环境配置文档 | docs/环境配置文档.md | ✅ 完成 |
| 开发流程规范 | docs/Aigc_For_Study_开发流程规范.md | ✅ 完成 |

---

## 附录

### A. 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 重启API
docker-compose restart api

# 执行数据库迁移
docker-compose exec api alembic upgrade head

# 运行测试
cd backend && python3 tests/api_test.py
```

### B. 快捷访问

- API文档: http://localhost:38000/docs
- 前端页面: http://localhost:3000
- 数据库: psql -U aigc -d aigc_dev

---

**文档版本**: v2.0
**最后更新**: 2026-05-09
**维护者**: Aigc For Study Team
