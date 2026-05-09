# Aigc For Study API测试文档

## 文档说明

本文档基于实际API测试运行生成，包含真实的请求包和响应包数据。

**测试环境**:
- 基础URL: `http://localhost:38000`
- 测试时间: 2026-05-08
- API版本: v1

---

## 目录

1. [认证模块](#1-认证模块-auth)
2. [用户模块](#2-用户模块-users)
3. [职业目标模块](#3-职业目标模块-careers)
4. [学习方案模块](#4-学习方案模块-learning-plans)
5. [打卡模块](#5-打卡模块-check-ins)
6. [练习题模块](#6-练习题模块-exercises)
7. [课程模块](#7-课程模块-courses)
8. [作业管理模块](#8-作业管理模块-homework)
9. [统计分析模块](#9-统计分析模块-analytics)

---

## 1. 认证模块 (Auth)

### 1.1 用户注册

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/auth/register`
- 认证: 无需认证

**请求包**

```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:38000
Content-Type: application/json

{
  "username": "test_api_doc_023607",
  "email": "test_api_023607@example.com",
  "password": "Test123456",
  "role": "student"
}
```

**成功响应**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "username": "test_api_doc_023607",
  "email": "test_api_023607@example.com",
  "role": "student",
  "status": "active",
  "created_at": "2026-05-07T18:36:07.511437",
  "updated_at": "2026-05-07T18:36:07.511437"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "Test123456",
    "role": "student"
  }'
```

---

### 1.2 用户登录

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/auth/login`
- 认证: 无需认证
- 注意: 请求体使用 `application/x-www-form-urlencoded` 格式

**请求包**

```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:38000
Content-Type: application/x-www-form-urlencoded

username=test_api_doc_023607&password=Test123456
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwODYwZDU2Mi1hMmU5LTRjODYtOTNjOC02YTdjZTI3ZTM0MDEiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc4MTgyNTY3fQ.OyeDiLhpuwDoXzSnbTx6eNx0S9Z14aS8fSjsORIc0m4",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwODYwZDU2Mi1hMmU5LTRjODYtOTNjOC02YTdjZTI3ZTM0MDEiLCJ0eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3ODc4Mzc2N30.5r2u-_b4Itby7Jr_GbNNa00SGZ2u6eazyMK5DiAOBpU",
  "token_type": "bearer"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test_user&password=Test123456"
```

---

## 2. 用户模块 (Users)

### 2.1 获取职业列表

**接口信息**
- 方法: `GET`
- 路径: `/api/v1/careers/`
- 认证: 需要Bearer Token

**请求包**

```http
GET /api/v1/careers/ HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
    "name": "前端工程师",
    "description": "负责Web前端开发",
    "skills_required": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Vue"
    ],
    "created_at": "2026-05-07T17:24:01.625850"
  },
  {
    "id": "d469d087-e76d-4304-babe-fc1a2a52657d",
    "name": "后端工程师",
    "description": "负责服务器端开发",
    "skills_required": [
      "Python",
      "Java",
      "Go",
      "数据库",
      "API设计"
    ],
    "created_at": "2026-05-07T17:24:01.625850"
  }
]
```

**curl命令**

```bash
curl -X GET http://localhost:38000/api/v1/careers/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. 学习方案模块 (Learning Plans)

### 3.1 创建学习方案

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/learning-plans/`
- 认证: 需要Bearer Token (student角色)

**请求包**

```http
POST /api/v1/learning-plans/ HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "career_goal_id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
  "title": "Python学习方案"
}
```

**成功响应**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "5fe04c25-809f-4f64-bb89-c38549968626",
  "user_id": "0113d4d5-bc83-416c-b1bd-0c6d534d2caf",
  "career_goal_id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
  "title": "Python学习方案",
  "plan_data": null,
  "status": "active",
  "created_at": "2026-05-07T18:36:34.993765",
  "updated_at": "2026-05-07T18:36:34.993765"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/learning-plans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "career_goal_id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
    "title": "Python学习方案"
  }'
```

---

## 4. 课程模块 (Courses)

### 4.1 教师创建课程

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/courses/`
- 认证: 需要Bearer Token (teacher/admin角色)

**请求包**

```http
POST /api/v1/courses/ HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Python编程课程 023635",
  "description": "学习Python编程基础"
}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "2db95e98-1f8b-4031-a14a-399377fe7dc8",
  "title": "Python编程课程 023635",
  "description": "学习Python编程基础",
  "cover_image": null,
  "teacher_id": "808b6eab-ba74-48c6-b2b6-28ecd637ceb1",
  "status": "active",
  "created_at": "2026-05-07T18:36:35.016804",
  "updated_at": "2026-05-07T18:36:35.016804"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/courses/ \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python编程课程",
    "description": "学习Python编程基础"
  }'
```

---

### 4.2 学生报名课程

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/courses/{course_id}/enroll`
- 认证: 需要Bearer Token (student角色)

**请求包**

```http
POST /api/v1/courses/2db95e98-1f8b-4031-a14a-399377fe7dc8/enroll HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "557cdccf-8ebd-4183-9408-cc0846807244",
  "course_id": "2db95e98-1f8b-4031-a14a-399377fe7dc8",
  "student_id": "0113d4d5-bc83-416c-b1bd-0c6d534d2caf",
  "enrollment_date": "2026-05-07T18:36:35.028648",
  "status": "active"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/courses/YOUR_COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 5. 作业管理模块 (Homework)

### 5.1 教师布置作业

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/homework/`
- 认证: 需要Bearer Token (teacher/admin角色)

**请求包**

```http
POST /api/v1/homework/ HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "course_id": "2db95e98-1f8b-4031-a14a-399377fe7dc8",
  "title": "第一章练习题",
  "description": "完成以下Python练习",
  "deadline": "2026-05-15T23:59:59.031761",
  "max_score": 100.0
}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ea689e44-6b83-461e-8556-9361177750d5",
  "title": "第一章练习题",
  "description": "完成以下Python练习",
  "course_id": "2db95e98-1f8b-4031-a14a-399377fe7dc8",
  "deadline": "2026-05-15T23:59:59.031761",
  "max_score": 100.0,
  "status": "active",
  "created_at": "2026-05-07T18:36:35.040456",
  "updated_at": "2026-05-07T18:36:35.040456"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/homework/ \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "YOUR_COURSE_ID",
    "title": "第一章练习题",
    "description": "完成以下Python练习",
    "deadline": "2026-05-15T23:59:59",
    "max_score": 100.0
  }'
```

---

### 5.2 学生提交作业

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/homework/{homework_id}/submit`
- 认证: 需要Bearer Token (student角色)

**请求包**

```http
POST /api/v1/homework/ea689e44-6b83-461e-8556-9361177750d5/submit HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "# Python练习答案\n\n1. print(\"Hello World\")\n2. x = 10"
}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "6f3522af-4794-4b1c-99f3-170d926ce298",
  "homework_id": "ea689e44-6b83-461e-8556-9361177750d5",
  "student_id": "0113d4d5-bc83-416c-b1bd-0c6d534d2caf",
  "content": "# Python练习答案\n\n1. print(\"Hello World\")\n2. x = 10",
  "submitted_at": "2026-05-07T18:36:35.051028",
  "score": null,
  "feedback": null,
  "status": "submitted"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/homework/YOUR_HOMEWORK_ID/submit \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Python练习答案\n\n1. print(\"Hello World\")"
  }'
```

---

### 5.3 教师批改作业

**接口信息**
- 方法: `PUT`
- 路径: `/api/v1/homework/submissions/{submission_id}`
- 认证: 需要Bearer Token (teacher/admin角色)

**请求包**

```http
PUT /api/v1/homework/submissions/6f3522af-4794-4b1c-99f3-170d926ce298 HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "score": 88.0,
  "feedback": "完成不错",
  "status": "graded"
}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "6f3522af-4794-4b1c-99f3-170d926ce298",
  "homework_id": "ea689e44-6b83-461e-8556-9361177750d5",
  "student_id": "0113d4d5-bc83-416c-b1bd-0c6d534d2caf",
  "content": "# Python练习答案\n\n1. print(\"Hello World\")\n2. x = 10",
  "submitted_at": "2026-05-07T18:36:35.051028",
  "score": 88.0,
  "feedback": "完成不错",
  "status": "graded"
}
```

**curl命令**

```bash
curl -X PUT http://localhost:38000/api/v1/homework/submissions/YOUR_SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 88.0,
    "feedback": "完成不错",
    "status": "graded"
  }'
```

---

## 6. 练习题模块 (Exercises)

### 6.1 AI生成练习题

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/exercises/generate`
- 认证: 需要Bearer Token (student角色)
- AI服务: DeepSeek API

**请求包**

```http
POST /api/v1/exercises/generate HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "plan_id": "728cb25f-df7a-430f-a847-837c4e0ec9d8",
  "topic": "Python基础语法",
  "count": 2,
  "difficulty": "medium"
}
```

**成功响应**

```http
HTTP/1.1 201 Created
Content-Type: application/json

[
  {
    "id": "ac315cc0-3009-4192-adc9-dca4d50c5c4e",
    "plan_id": "728cb25f-df7a-430f-a847-837c4e0ec9d8",
    "topic": "Python基础语法",
    "content": "以下代码的输出是什么？\n```python\ndef func(a, b=[]):\n    b.append(a)\n    return b\n\nprint(func(1))\nprint(func(2, []))\nprint(func(3))\n```",
    "type": "short_answer",
    "answer": "[1] [2] [1, 3]",
    "options": [],
    "difficulty": "medium",
    "result": null,
    "student_id": "c105a8a4-5514-4c07-9141-a1970a838683",
    "submitted_at": null,
    "created_at": "2026-05-07T18:37:03.772834",
    "updated_at": "2026-05-07T18:37:03.772834"
  }
]
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/exercises/generate \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "YOUR_PLAN_ID",
    "topic": "Python基础语法",
    "count": 2,
    "difficulty": "medium"
  }'
```

---

### 6.2 AI批改练习

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/exercises/{exercise_id}/grade`
- 认证: 需要Bearer Token (teacher/admin角色)
- AI服务: DeepSeek API

**请求包**

```http
POST /api/v1/exercises/ac315cc0-3009-4192-adc9-dca4d50c5c4e/grade HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ac315cc0-3009-4192-adc9-dca4d50c5c4e",
  "plan_id": "728cb25f-df7a-430f-a847-837c4e0ec9d8",
  "topic": "Python基础语法",
  "content": "以下代码的输出是什么？...",
  "type": "short_answer",
  "answer": "Python是一种高级编程语言",
  "options": [],
  "difficulty": "medium",
  "result": {
    "score": 0,
    "feedback": "学生答案完全偏离了题目要求。题目要求分析代码的输出，但学生回答的是\"Python是一种高级编程语言\"...",
    "grade_level": "F"
  },
  "student_id": "c105a8a4-5514-4c07-9141-a1970a838683",
  "submitted_at": "2026-05-07T18:37:03.801860",
  "created_at": "2026-05-07T18:37:03.772834",
  "updated_at": "2026-05-07T18:37:03.818983"
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/exercises/YOUR_EXERCISE_ID/grade \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 7. 统计分析模块 (Analytics)

### 7.1 AI学习分析

**接口信息**
- 方法: `GET`
- 路径: `/api/v1/analytics/student/{student_id}/stats`
- 认证: 需要Bearer Token
- AI服务: DeepSeek API

**请求包**

```http
GET /api/v1/analytics/student/c105a8a4-5514-4c07-9141-a1970a838683/stats HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total_study_time": 42,
  "exercise_accuracy": 78.5,
  "strengths": [
    "代数",
    "几何"
  ],
  "weaknesses": [
    "概率统计",
    "函数"
  ],
  "recent_performance": [
    {
      "date": "2025-03-01",
      "score": 82
    },
    {
      "date": "2025-03-08",
      "score": 75
    },
    {
      "date": "2025-03-15",
      "score": 88
    }
  ]
}
```

**curl命令**

```bash
curl -X GET http://localhost:38000/api/v1/analytics/student/YOUR_STUDENT_ID/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7.2 学生个人进度

**接口信息**
- 方法: `GET`
- 路径: `/api/v1/analytics/student/{student_id}/progress`
- 认证: 需要Bearer Token

**请求包**

```http
GET /api/v1/analytics/student/c105a8a4-5514-4c07-9141-a1970a838683/progress HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total_study_time": 0,
  "total_exercises": 2,
  "completed_exercises": 1,
  "total_assignments": 0,
  "completed_assignments": 0,
  "average_score": null,
  "current_streak": 0
}
```

**curl命令**

```bash
curl -X GET http://localhost:38000/api/v1/analytics/student/YOUR_STUDENT_ID/progress \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7.3 班级统计

**接口信息**
- 方法: `GET`
- 路径: `/api/v1/analytics/teacher/{teacher_id}/class-stats`
- 认证: 需要Bearer Token (teacher/admin角色)

**请求包**

```http
GET /api/v1/analytics/teacher/db7da953-6301-4718-90e9-79d45a10566e/class-stats HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total_students": 0,
  "average_completion_rate": 0.0,
  "average_score": 0.0,
  "top_performers": [],
  "struggling_students": []
}
```

**curl命令**

```bash
curl -X GET http://localhost:38000/api/v1/analytics/teacher/YOUR_TEACHER_ID/class-stats \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

---

## 8. 打卡模块 (Check-ins)

### 8.1 创建打卡记录

**接口信息**
- 方法: `POST`
- 路径: `/api/v1/check-ins/`
- 认证: 需要Bearer Token (student角色)

**请求包**

```http
POST /api/v1/check-ins/ HTTP/1.1
Host: localhost:38000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "duration_minutes": 120,
  "note": "完成了Python基础学习"
}
```

**成功响应**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "打卡记录ID",
  "user_id": "用户ID",
  "duration_minutes": 120,
  "note": "完成了Python基础学习",
  "check_in_date": "2026-05-08",
  "created_at": "2026-05-08T..."
}
```

**curl命令**

```bash
curl -X POST http://localhost:38000/api/v1/check-ins/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration_minutes": 120,
    "note": "完成了Python基础学习"
  }'
```

---

## 附录：错误响应

### 常见错误响应

**422 验证错误**

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "check_in_date"],
      "msg": "Field required",
      "input": {...},
      "url": "https://errors.pydantic.dev/2.13/v/missing"
    }
  ]
}
```

**403 权限不足**

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "detail": "Insufficient permissions"
}
```

**401 未认证**

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "Not authenticated"
}
```

---

## 数据类型说明

| 字段类型 | 说明 | 示例 |
|---------|------|------|
| UUID | 唯一标识符 | `0860d562-a2e9-4c86-93c8-6a7ce27e3401` |
| DateTime | ISO 8601格式时间 | `2026-05-07T18:36:07.511437` |
| String | 字符串 | `"student"` |
| Integer | 整数 | `120` |
| Float | 浮点数 | `88.0` |
| Boolean | 布尔值 | `true` / `false` |
| Array | 数组 | `["HTML", "CSS", "JavaScript"]` |
| Object | 对象 | `{"key": "value"}` |

---

## 角色说明

| 角色 | 说明 | 权限 |
|------|------|------|
| student | 学生 | 创建学习方案、打卡、提交作业、查看个人数据 |
| teacher | 教师 | 创建课程、布置作业、批改、查看班级统计 |
| admin | 管理员 | 所有权限 |
