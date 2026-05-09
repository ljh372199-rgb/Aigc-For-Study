# Aigc For Study API 参考文档

## 概述

Aigc For Study 是一个AI驱动的在线学习平台API，提供完整的用户认证、课程管理、作业批改、学习分析等功能。

**基础URL**:
- 开发环境: `http://localhost:38000`
- 生产环境: `https://api.aigc-study.com`

**API版本**: v1

**认证方式**: JWT Bearer Token

**总端点数**: 61

---

## 目录

1. [认证接口 (3个端点)](#1-认证接口-auth)
2. [用户接口 (5个端点)](#2-用户接口-users)
3. [职业目标接口 (3个端点)](#3-职业目标接口-careers)
4. [学习方案接口 (5个端点)](#4-学习方案接口-learning-plans)
5. [打卡接口 (4个端点)](#5-打卡接口-check-ins)
6. [练习题接口 (5个端点)](#6-练习题接口-exercises)
7. [作业接口 (7个端点)](#7-作业接口-assignments)
8. [课程接口 (7个端点)](#8-课程接口-courses)
9. [班级接口 (5个端点)](#9-班级接口-classes)
10. [作业管理接口 (9个端点)](#10-作业管理接口-homework)
11. [统计分析接口 (4个端点)](#11-统计分析接口-analytics)
12. [错误码](#12-错误码)

---

## 1. 认证接口 (Auth)

### POST /api/v1/auth/register - 用户注册

创建新用户账号。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名(3-50字符) |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码(至少6字符) |
| role | string | 否 | 角色(student/teacher)，默认student |

**响应**:
```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "role": "string",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**状态码**: 201 Created, 400 Bad Request, 409 Conflict

---

### POST /api/v1/auth/login - 用户登录

用户登录获取访问令牌。支持用户名或邮箱登录。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名或邮箱 |
| password | string | 是 | 密码 |

**响应**:
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

**状态码**: 200 OK, 401 Unauthorized

---

### POST /api/v1/auth/refresh - Token刷新

刷新访问令牌。

**请求头**: `Authorization: Bearer {refresh_token}`

**响应**:
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

**状态码**: 200 OK, 401 Unauthorized

---

## 2. 用户接口 (Users)

### GET /api/v1/users/me - 获取当前用户

获取已登录用户信息。

**响应**:
```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "role": "string",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**状态码**: 200 OK, 401 Unauthorized

---

### PUT /api/v1/users/me - 更新当前用户

更新用户信息。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| email | string | 否 | 邮箱 |

**状态码**: 200 OK, 401 Unauthorized, 422 Validation Error

---

### PUT /api/v1/users/me/profile - 更新用户资料

更新用户个人资料。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| profile | object | 是 | 资料对象 |
| profile.bio | string | 否 | 个人简介 |
| profile.avatar | string | 否 | 头像URL |

**状态码**: 200 OK, 401 Unauthorized

---

### GET /api/v1/users/{user_id} - 获取指定用户

获取指定用户信息(需teacher/admin权限)。

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### GET /api/v1/users/ - 用户列表

获取用户列表(需admin权限)。

**状态码**: 200 OK, 403 Forbidden

---

## 3. 职业目标接口 (Careers)

### GET /api/v1/careers/ - 职业列表

获取所有职业目标。

**响应**:
```json
[
  {
    "id": "UUID",
    "name": "string",
    "description": "string",
    "skills_required": ["string"],
    "created_at": "datetime"
  }
]
```

**状态码**: 200 OK, 401 Unauthorized

---

### GET /api/v1/careers/{career_id} - 职业详情

获取指定职业目标详情。

**状态码**: 200 OK, 404 Not Found

---

### POST /api/v1/careers/ - 创建职业目标

创建新的职业目标(需admin权限)。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 职业名称 |
| description | string | 否 | 描述 |
| skills_required | array | 否 | 所需技能 |

**状态码**: 201 Created, 403 Forbidden

---

## 4. 学习方案接口 (Learning Plans)

### POST /api/v1/learning-plans/ - 创建学习方案

创建新的学习方案（AI自动生成）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| career_goal_id | UUID | 是 | 职业目标ID |
| title | string | 是 | 方案标题 |

**响应**:
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "career_goal_id": "UUID",
  "title": "string",
  "plan_data": {},
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**状态码**: 201 Created, 401 Unauthorized

---

### GET /api/v1/learning-plans/ - 获取学习方案列表

**状态码**: 200 OK

---

### GET /api/v1/learning-plans/{plan_id} - 获取学习方案详情

**状态码**: 200 OK, 404 Not Found

---

### PUT /api/v1/learning-plans/{plan_id} - 更新学习方案

**状态码**: 200 OK, 404 Not Found

---

### DELETE /api/v1/learning-plans/{plan_id} - 删除学习方案

**状态码**: 200 OK, 404 Not Found

---

## 5. 打卡接口 (Check-ins)

### POST /api/v1/check-ins/ - 创建打卡

创建学习打卡记录。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| duration_minutes | int | 是 | 学习时长(分钟) |
| note | string | 否 | 打卡备注 |

**响应**:
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "duration_minutes": 120,
  "note": "string",
  "check_in_date": "date",
  "created_at": "datetime"
}
```

**状态码**: 201 Created, 401 Unauthorized

---

### GET /api/v1/check-ins/ - 获取打卡列表

**状态码**: 200 OK

---

### GET /api/v1/check-ins/{checkin_id} - 获取打卡详情

**状态码**: 200 OK, 404 Not Found

---

### PUT /api/v1/check-ins/{checkin_id} - 更新打卡

**状态码**: 200 OK, 404 Not Found

---

## 6. 练习题接口 (Exercises)

### POST /api/v1/exercises/generate - AI生成练习题

使用AI生成练习题。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| plan_id | UUID | 否 | 学习方案ID |
| topic | string | 是 | 题目主题 |
| count | int | 否 | 生成数量，默认5 |
| difficulty | string | 否 | 难度(easy/medium/hard) |

**响应**: 练习题数组

**状态码**: 201 Created, 401 Unauthorized

---

### GET /api/v1/exercises/ - 获取练习列表

**状态码**: 200 OK

---

### GET /api/v1/exercises/{exercise_id} - 获取练习详情

**状态码**: 200 OK, 404 Not Found

---

### POST /api/v1/exercises/{exercise_id}/submit - 提交练习答案

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| answer | string | 是 | 学生答案 |

**状态码**: 200 OK, 404 Not Found

---

### POST /api/v1/exercises/{exercise_id}/grade - AI批改练习

使用AI批改练习(教师)。

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

## 7. 作业接口 (Assignments)

### POST /api/v1/assignments/ - 创建作业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 作业标题 |
| description | string | 否 | 作业描述 |
| course_id | UUID | 否 | 课程ID |
| deadline | datetime | 否 | 截止时间 |
| max_score | float | 否 | 满分，默认100 |

**状态码**: 201 Created, 401 Unauthorized

---

### GET /api/v1/assignments/ - 获取作业列表

**状态码**: 200 OK

---

### GET /api/v1/assignments/{assignment_id} - 获取作业详情

**状态码**: 200 OK, 404 Not Found

---

### PUT /api/v1/assignments/{assignment_id} - 更新作业

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### DELETE /api/v1/assignments/{assignment_id} - 删除作业

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### POST /api/v1/assignments/{assignment_id}/submit - 提交作业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 作业内容 |

**状态码**: 200 OK, 404 Not Found

---

### GET /api/v1/assignments/{assignment_id}/submissions - 查看提交列表

**状态码**: 200 OK, 403 Forbidden

---

## 8. 课程接口 (Courses)

### POST /api/v1/courses/ - 创建课程

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 课程标题 |
| description | string | 否 | 课程描述 |
| cover_image | string | 否 | 封面图片URL |

**状态码**: 201 Created, 403 Forbidden

---

### GET /api/v1/courses/ - 获取课程列表

**状态码**: 200 OK

---

### GET /api/v1/courses/{course_id} - 获取课程详情

**状态码**: 200 OK, 404 Not Found

---

### PUT /api/v1/courses/{course_id} - 更新课程

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### DELETE /api/v1/courses/{course_id} - 删除课程

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### POST /api/v1/courses/{course_id}/enroll - 报名课程

**状态码**: 200 OK, 400 Bad Request

---

### GET /api/v1/courses/{course_id}/students - 查看已报名学生

**状态码**: 200 OK, 403 Forbidden

---

### POST /api/v1/courses/{course_id}/classes - 绑定课程到班级

将课程绑定到指定班级。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| class_id | UUID | 是 | 班级ID |

**响应**:
```json
{
  "id": "UUID",
  "course_id": "UUID",
  "class_id": "UUID",
  "class_name": "Python编程基础班",
  "created_at": "datetime"
}
```

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### DELETE /api/v1/courses/{course_id}/classes/{class_id} - 解绑课程与班级

取消课程与班级的绑定关系。

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### GET /api/v1/courses/{course_id}/classes - 获取课程绑定的班级列表

获取指定课程绑定的所有班级。

**响应**: 班级数组，包含绑定信息

**状态码**: 200 OK, 404 Not Found

---

## 9. 班级接口 (Classes)

### POST /api/v1/classes - 创建班级

创建新班级，自动生成8位唯一邀请码。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 班级名称 |
| description | string | 否 | 班级描述 |

**响应**:
```json
{
  "id": "UUID",
  "name": "Python编程基础班",
  "description": "学习Python基础",
  "teacher_id": "UUID",
  "invite_code": "LK4JKM3F",
  "status": "active",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**状态码**: 201 Created, 403 Forbidden (仅教师可创建)

---

### GET /api/v1/classes - 获取班级列表

获取当前用户创建的班级列表(教师)或加入的班级列表(学生)。

**状态码**: 200 OK

---

### GET /api/v1/classes/{class_id} - 获取班级详情

获取指定班级的详细信息。

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### GET /api/v1/classes/{class_id}/invite-code - 获取班级邀请码

获取班级的邀请码(仅班级创建者可访问)。

**响应**:
```json
{
  "invite_code": "LK4JKM3F",
  "class_id": "UUID",
  "class_name": "Python编程基础班"
}
```

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### POST /api/v1/classes/join - 加入班级

使用邀请码加入班级。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| invite_code | string | 是 | 8位邀请码 |

**响应**:
```json
{
  "message": "Successfully joined the class",
  "class_id": "UUID",
  "class_name": "Python编程基础班"
}
```

**状态码**: 200 OK, 400 Bad Request (无效邀请码或已加入), 403 Forbidden (非学生角色)

---

### GET /api/v1/classes/my - 获取已加入的班级

获取当前学生已加入的所有班级。

**状态码**: 200 OK

---

### GET /api/v1/classes/{class_id}/courses - 获取班级课程列表

获取指定班级绑定的所有课程。

**响应**: 课程数组，包含绑定信息

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

## 10. 作业管理接口 (Homework)

### POST /api/v1/homework/ - 布置作业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| course_id | UUID | 是 | 课程ID |
| title | string | 是 | 作业标题 |
| description | string | 否 | 作业描述 |
| deadline | datetime | 否 | 截止时间 |
| max_score | float | 否 | 满分，默认100 |

**状态码**: 201 Created, 403 Forbidden

---

### GET /api/v1/homework/ - 获取作业列表

**状态码**: 200 OK

---

### GET /api/v1/homework/{homework_id} - 获取作业详情

**状态码**: 200 OK, 404 Not Found

---

### PUT /api/v1/homework/{homework_id} - 更新作业

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### DELETE /api/v1/homework/{homework_id} - 删除作业

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

### POST /api/v1/homework/{homework_id}/submit - 提交作业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 作业内容 |

**状态码**: 200 OK, 404 Not Found

---

### GET /api/v1/homework/{homework_id}/submissions - 查看作业提交

**状态码**: 200 OK, 403 Forbidden

---

### GET /api/v1/homework/submissions/mine - 查看我的提交

**状态码**: 200 OK

---

### PUT /api/v1/homework/submissions/{submission_id} - 批改作业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| score | float | 是 | 得分(0-100) |
| feedback | string | 否 | 批改反馈 |
| status | string | 是 | graded |

**状态码**: 200 OK, 403 Forbidden, 404 Not Found

---

## 11. 统计分析接口 (Analytics)

### GET /api/v1/analytics/student/{student_id}/progress - 学生进度

获取学生的学习进度统计。

**响应**:
```json
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

**状态码**: 200 OK, 404 Not Found

---

### GET /api/v1/analytics/student/{student_id}/stats - AI学习分析

获取AI生成的学习分析报告。

**响应**:
```json
{
  "total_study_time": 42,
  "exercise_accuracy": 78.5,
  "strengths": ["基础知识", "算法设计"],
  "weaknesses": ["系统设计", "性能优化"],
  "recent_performance": [
    { "date": "2026-05-01", "score": 78 },
    { "date": "2026-05-02", "score": 82 }
  ]
}
```

**状态码**: 200 OK, 404 Not Found

---

### GET /api/v1/analytics/teacher/{teacher_id}/class-stats - 班级统计

获取教师的班级统计信息。

**响应**:
```json
{
  "total_students": 25,
  "average_completion_rate": 78.5,
  "average_score": 82.3,
  "top_performers": [...],
  "struggling_students": [...]
}
```

**状态码**: 200 OK, 404 Not Found

---

### GET /api/v1/analytics/teacher/{teacher_id}/assignment-stats - 作业统计

获取教师的作业统计信息。

**响应**:
```json
{
  "total_submissions": 150,
  "graded_submissions": 120,
  "average_score": 78.5,
  "score_distribution": {
    "A": 25,
    "B": 45,
    "C": 35,
    "D": 10,
    "F": 5
  }
}
```

**状态码**: 200 OK, 404 Not Found

---

## 12. 错误码

### HTTP状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理响应 |
| 201 | 创建成功 | 正常处理响应 |
| 400 | 错误请求 | 显示错误信息 |
| 401 | 未认证 | 跳转登录或刷新Token |
| 403 | 权限不足 | 显示权限提示 |
| 404 | 资源不存在 | 显示404页面 |
| 422 | 验证错误 | 显示具体字段错误 |
| 500 | 服务器错误 | 显示通用错误提示 |

### 错误响应格式

```json
{
  "detail": "错误信息"
}
```

或

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "field"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

---

## 附录：角色权限说明

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| student | 学生 | 学习方案、打卡、练习题、提交作业、加入班级 |
| teacher | 教师 | 创建班级、创建课程、布置作业、批改、查看班级统计 |
| admin | 管理员 | 所有权限 |

---

**文档更新日期**: 2026-05-09
