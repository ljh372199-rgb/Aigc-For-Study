# Aigc For Study - 学习方案、打卡与统计分析模块 API 文档

---

## 目录

- [学习方案模块 (Learning Plans)](#学习方案模块-learning-plans)
  - [创建学习方案](#1-post-apiv1learning-plans---创建学习方案)
  - [获取学习方案列表](#2-get-apiv1learning-plans---获取学习方案列表)
  - [获取学习方案详情](#3-get-apiv1learning-plansid---获取学习方案详情)
  - [更新学习方案](#4-put-apiv1learning-plansid---更新学习方案)
  - [删除学习方案](#5-delete-apiv1learning-plansid---删除学习方案)
- [职业目标模块 (Careers)](#职业目标模块-careers)
  - [获取职业列表](#1-get-apiv1careers---获取职业列表)
  - [获取职业详情](#2-get-apiv1careersid---获取职业详情)
  - [创建职业目标](#3-post-apiv1careers---创建职业目标admin)
- [打卡模块 (Check-ins)](#打卡模块-check-ins)
  - [创建打卡记录](#1-post-apiv1check-ins---创建打卡记录)
  - [获取打卡列表](#2-get-apiv1check-ins---获取打卡列表)
- [统计分析模块 (Analytics)](#统计分析模块-analytics)
  - [学生个人进度](#1-get-apiv1analyticsstudentidprogress---学生个人进度)
  - [AI学习统计](#2-get-apiv1analyticsstudentidstats---ai学习统计)
  - [班级统计](#3-get-apiv1analyticsteacheridclass-stats---班级统计)
  - [作业统计](#4-get-apiv1analyticsteacheridassignment-stats---作业统计)

---

## 学习方案模块 (Learning Plans)

### 1. POST /api/v1/learning-plans/ - 创建学习方案

**接口描述**

创建新的学习方案，用户可以为自己的职业目标制定学习计划。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `POST` |
| 完整URL | `/api/v1/learning-plans/` |
| 所需权限 | `student` |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |
| `Content-Type` | 是 | `application/json` |

**请求体 (Request Body)**

```json
{
  "career_goal_id": "string (UUID)",
  "title": "string (1-200字符)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `career_goal_id` | string | 是 | 关联的职业目标ID |
| `title` | string | 是 | 学习方案标题，1-200字符 |

**请求体 JSON 示例**

```json
{
  "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Python数据分析学习计划"
}
```

**响应体 (Response Body)**

**成功响应 (201 Created)**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Python数据分析学习计划",
  "status": "active",
  "created_at": "2026-05-08T10:30:00Z",
  "updated_at": "2026-05-08T10:30:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 学习方案唯一标识符 |
| `user_id` | string | 创建者用户ID |
| `career_goal_id` | string | 关联的职业目标ID |
| `title` | string | 学习方案标题 |
| `status` | string | 状态：active(进行中)、completed(已完成)、paused(已暂停) |
| `created_at` | string | 创建时间 (ISO 8601格式) |
| `updated_at` | string | 更新时间 (ISO 8601格式) |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `201 Created` | 学习方案创建成功 |
| `400 Bad Request` | 请求参数错误 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限创建学习方案 |
| `404 Not Found` | 指定的职业目标不存在 |

**curl 命令示例**

```bash
curl -X POST 'http://localhost:3000/api/v1/learning-plans/' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Python数据分析学习计划"
  }'
```

---

### 2. GET /api/v1/learning-plans/ - 获取学习方案列表

**接口描述**

获取学习方案列表。student角色只能查看自己的学习方案，admin可以查看所有学习方案。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/learning-plans/` |
| 权限说明 | `student`(仅自己的)、`admin`(全部) |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 按状态过滤：active、completed、paused |
| `career_goal_id` | string | 否 | 按职业目标ID过滤 |
| `page` | integer | 否 | 页码，默认1 |
| `limit` | integer | 否 | 每页数量，默认20，最大100 |

**请求示例**

```
GET /api/v1/learning-plans/?status=active&page=1&limit=20
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
      "career_goal_title": "数据分析师",
      "title": "Python数据分析学习计划",
      "status": "active",
      "created_at": "2026-05-08T10:30:00Z",
      "updated_at": "2026-05-08T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "career_goal_id": "550e8400-e29b-41d4-a716-446655440001",
      "career_goal_title": "前端开发工程师",
      "title": "React框架深入学习",
      "status": "completed",
      "created_at": "2026-05-01T09:00:00Z",
      "updated_at": "2026-05-07T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | array | 学习方案列表 |
| `pagination.page` | integer | 当前页码 |
| `pagination.limit` | integer | 每页数量 |
| `pagination.total` | integer | 总记录数 |
| `pagination.total_pages` | integer | 总页数 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限访问 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/learning-plans/?status=active&page=1&limit=20' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 3. GET /api/v1/learning-plans/{id} - 获取学习方案详情

**接口描述**

根据学习方案ID获取详细信息。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/learning-plans/{id}` |
| 权限说明 | 只能查看自己的方案 (student) 或所有方案 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 学习方案ID |

**请求示例**

```
GET /api/v1/learning-plans/660e8400-e29b-41d4-a716-446655440001
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "career_goal": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "数据分析师",
    "description": "负责数据分析与可视化"
  },
  "title": "Python数据分析学习计划",
  "status": "active",
  "progress": 45,
  "created_at": "2026-05-08T10:30:00Z",
  "updated_at": "2026-05-08T10:30:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 学习方案唯一标识符 |
| `user_id` | string | 创建者用户ID |
| `career_goal_id` | string | 关联的职业目标ID |
| `career_goal` | object | 职业目标详情 |
| `title` | string | 学习方案标题 |
| `status` | string | 状态：active、completed、paused |
| `progress` | integer | 完成进度百分比 (0-100) |
| `created_at` | string | 创建时间 |
| `updated_at` | string | 更新时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限访问该学习方案 |
| `404 Not Found` | 学习方案不存在 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/learning-plans/660e8400-e29b-41d4-a716-446655440001' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 4. PUT /api/v1/learning-plans/{id} - 更新学习方案

**接口描述**

更新指定学习方案的信息和状态。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `PUT` |
| 完整URL | `/api/v1/learning-plans/{id}` |
| 权限说明 | 只能更新自己的方案 (student) 或所有方案 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 学习方案ID |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |
| `Content-Type` | 是 | `application/json` |

**请求体 (Request Body)**

```json
{
  "title": "string (可选, 1-200字符)",
  "status": "string (可选, active|completed|paused)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 否 | 学习方案标题 |
| `status` | string | 否 | 状态：active、completed、paused |

**请求体 JSON 示例**

```json
{
  "title": "Python数据分析学习计划（修订版）",
  "status": "completed"
}
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "career_goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Python数据分析学习计划（修订版）",
  "status": "completed",
  "created_at": "2026-05-08T10:30:00Z",
  "updated_at": "2026-05-08T14:00:00Z"
}
```

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 学习方案更新成功 |
| `400 Bad Request` | 请求参数错误 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限更新该学习方案 |
| `404 Not Found` | 学习方案不存在 |

**curl 命令示例**

```bash
curl -X PUT 'http://localhost:3000/api/v1/learning-plans/660e8400-e29b-41d4-a716-446655440001' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Python数据分析学习计划（修订版）",
    "status": "completed"
  }'
```

---

### 5. DELETE /api/v1/learning-plans/{id} - 删除学习方案

**接口描述**

删除指定的学习方案。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `DELETE` |
| 完整URL | `/api/v1/learning-plans/{id}` |
| 权限说明 | 只能删除自己的方案 (student) 或所有方案 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 学习方案ID |

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "message": "学习方案删除成功",
  "id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 学习方案删除成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限删除该学习方案 |
| `404 Not Found` | 学习方案不存在 |

**curl 命令示例**

```bash
curl -X DELETE 'http://localhost:3000/api/v1/learning-plans/660e8400-e29b-41d4-a716-446655440001' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 职业目标模块 (Careers)

### 1. GET /api/v1/careers/ - 获取职业列表

**接口描述**

获取所有可用的职业目标列表，包含每个职业所需技能等信息。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/careers/` |
| 所需权限 | 无限制 |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 否 | Bearer Token（可选） |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | integer | 否 | 页码，默认1 |
| `limit` | integer | 否 | 每页数量，默认20，最大100 |

**请求示例**

```
GET /api/v1/careers/?page=1&limit=20
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "数据分析师",
      "description": "负责数据分析与可视化，从数据中提取有价值的信息",
      "skills_required": ["Python", "SQL", "数据分析", "可视化工具"],
      "difficulty_level": "intermediate",
      "avg_study_duration": 180,
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "前端开发工程师",
      "description": "负责Web前端开发，创建用户界面",
      "skills_required": ["HTML", "CSS", "JavaScript", "React"],
      "difficulty_level": "beginner",
      "avg_study_duration": 120,
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "AI工程师",
      "description": "负责人工智能算法研发和模型训练",
      "skills_required": ["Python", "深度学习", "TensorFlow", "PyTorch"],
      "difficulty_level": "advanced",
      "avg_study_duration": 300,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 职业目标唯一标识符 |
| `title` | string | 职业名称 |
| `description` | string | 职业描述 |
| `skills_required` | array | 所需技能列表 |
| `difficulty_level` | string | 难度等级：beginner(初级)、intermediate(中级)、advanced(高级) |
| `avg_study_duration` | integer | 平均学习时长（天） |
| `created_at` | string | 创建时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | Token无效（如果提供） |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/careers/?page=1&limit=20' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 2. GET /api/v1/careers/{id} - 获取职业详情

**接口描述**

根据职业目标ID获取详细信息，包括完整技能要求等。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/careers/{id}` |
| 所需权限 | 无限制 |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 职业目标ID |

**请求示例**

```
GET /api/v1/careers/550e8400-e29b-41d4-a716-446655440000
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "数据分析师",
  "description": "负责数据分析与可视化，从数据中提取有价值的信息",
  "skills_required": ["Python", "SQL", "数据分析", "可视化工具"],
  "skills_detail": [
    {
      "name": "Python",
      "proficiency_level": "required",
      "related_courses": 5
    },
    {
      "name": "SQL",
      "proficiency_level": "required",
      "related_courses": 3
    },
    {
      "name": "数据分析",
      "proficiency_level": "required",
      "related_courses": 4
    },
    {
      "name": "可视化工具",
      "proficiency_level": "preferred",
      "related_courses": 2
    }
  ],
  "difficulty_level": "intermediate",
  "avg_study_duration": 180,
  "career_outlook": {
    "salary_range": "15k-30k",
    "demand_level": "high",
    "growth_potential": "stable"
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 职业目标唯一标识符 |
| `title` | string | 职业名称 |
| `description` | string | 职业描述 |
| `skills_required` | array | 所需技能列表 |
| `skills_detail` | array | 技能详细信息 |
| `skills_detail[].name` | string | 技能名称 |
| `skills_detail[].proficiency_level` | string | 熟练度要求：required(必需)、preferred(优先) |
| `skills_detail[].related_courses` | integer | 相关课程数量 |
| `difficulty_level` | string | 难度等级 |
| `avg_study_duration` | integer | 平均学习时长（天） |
| `career_outlook` | object | 职业前景信息 |
| `created_at` | string | 创建时间 |
| `updated_at` | string | 更新时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `404 Not Found` | 职业目标不存在 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/careers/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 3. POST /api/v1/careers/ - 创建职业目标（admin）

**接口描述**

创建新的职业目标，需要管理员权限。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `POST` |
| 完整URL | `/api/v1/careers/` |
| 所需权限 | `admin` |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，管理员认证令牌 |
| `Content-Type` | 是 | `application/json` |

**请求体 (Request Body)**

```json
{
  "title": "string (必填)",
  "description": "string (必填)",
  "skills_required": ["string"],
  "difficulty_level": "string (必填, beginner|intermediate|advanced)",
  "avg_study_duration": "integer (必填, 天数)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 职业名称 |
| `description` | string | 是 | 职业描述 |
| `skills_required` | array | 是 | 所需技能列表，至少1项 |
| `difficulty_level` | string | 是 | 难度等级：beginner、intermediate、advanced |
| `avg_study_duration` | integer | 是 | 平均学习时长（天） |

**请求体 JSON 示例**

```json
{
  "title": "机器学习工程师",
  "description": "负责机器学习算法研发和模型优化",
  "skills_required": ["Python", "机器学习", "深度学习", "TensorFlow", "PyTorch"],
  "difficulty_level": "advanced",
  "avg_study_duration": 240
}
```

**响应体 (Response Body)**

**成功响应 (201 Created)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "机器学习工程师",
  "description": "负责机器学习算法研发和模型优化",
  "skills_required": ["Python", "机器学习", "深度学习", "TensorFlow", "PyTorch"],
  "difficulty_level": "advanced",
  "avg_study_duration": 240,
  "created_at": "2026-05-08T10:30:00Z",
  "updated_at": "2026-05-08T10:30:00Z"
}
```

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `201 Created` | 职业目标创建成功 |
| `400 Bad Request` | 请求参数错误 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限创建职业目标（需要admin权限） |

**curl 命令示例**

```bash
curl -X POST 'http://localhost:3000/api/v1/careers/' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "机器学习工程师",
    "description": "负责机器学习算法研发和模型优化",
    "skills_required": ["Python", "机器学习", "深度学习", "TensorFlow", "PyTorch"],
    "difficulty_level": "advanced",
    "avg_study_duration": 240
  }'
```

---

## 打卡模块 (Check-ins)

### 1. POST /api/v1/check-ins/ - 创建打卡记录

**接口描述**

学生创建学习打卡记录，记录当日学习时长和笔记。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `POST` |
| 完整URL | `/api/v1/check-ins/` |
| 所需权限 | `student` |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |
| `Content-Type` | 是 | `application/json` |

**请求体 (Request Body)**

```json
{
  "duration_minutes": "integer (必填, >0)",
  "note": "string (可选, 最大1000字符)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `duration_minutes` | integer | 是 | 学习时长（分钟），必须大于0 |
| `note` | string | 否 | 学习笔记，最多1000字符 |

**请求体 JSON 示例**

```json
{
  "duration_minutes": 120,
  "note": "今天学习了Python数据分析的Pandas库，掌握了数据清洗的基本操作"
}
```

**响应体 (Response Body)**

**成功响应 (201 Created)**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "duration_minutes": 120,
  "note": "今天学习了Python数据分析的Pandas库，掌握了数据清洗的基本操作",
  "check_in_date": "2026-05-08",
  "created_at": "2026-05-08T22:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 打卡记录唯一标识符 |
| `user_id` | string | 用户ID |
| `duration_minutes` | integer | 学习时长（分钟） |
| `note` | string | 学习笔记 |
| `check_in_date` | string | 打卡日期（YYYY-MM-DD格式） |
| `created_at` | string | 创建时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `201 Created` | 打卡记录创建成功 |
| `400 Bad Request` | 请求参数错误（时长必须大于0等） |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限创建打卡记录 |

**curl 命令示例**

```bash
curl -X POST 'http://localhost:3000/api/v1/check-ins/' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "duration_minutes": 120,
    "note": "今天学习了Python数据分析的Pandas库，掌握了数据清洗的基本操作"
  }'
```

---

### 2. GET /api/v1/check-ins/ - 获取打卡列表

**接口描述**

获取打卡记录列表，支持日期范围过滤。学生只能查看自己的打卡记录。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/check-ins/` |
| 权限说明 | `student`(仅自己的) |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | string | 否 | 开始日期 (YYYY-MM-DD格式) |
| `end_date` | string | 否 | 结束日期 (YYYY-MM-DD格式) |
| `page` | integer | 否 | 页码，默认1 |
| `limit` | integer | 否 | 每页数量，默认20，最大100 |

**请求示例**

```
GET /api/v1/check-ins/?start_date=2026-05-01&end_date=2026-05-08&page=1&limit=20
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "duration_minutes": 120,
      "note": "今天学习了Python数据分析的Pandas库",
      "check_in_date": "2026-05-08",
      "created_at": "2026-05-08T22:00:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "duration_minutes": 90,
      "note": "完成了JavaScript基础课程第三章",
      "check_in_date": "2026-05-07",
      "created_at": "2026-05-07T21:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  },
  "summary": {
    "total_check_ins": 2,
    "total_duration_minutes": 210,
    "total_duration_hours": 3.5,
    "avg_duration_per_day": 105
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | array | 打卡记录列表 |
| `pagination.page` | integer | 当前页码 |
| `pagination.limit` | integer | 每页数量 |
| `pagination.total` | integer | 总记录数 |
| `pagination.total_pages` | integer | 总页数 |
| `summary.total_check_ins` | integer | 打卡次数 |
| `summary.total_duration_minutes` | integer | 总学习时长（分钟） |
| `summary.total_duration_hours` | number | 总学习时长（小时） |
| `summary.avg_duration_per_day` | number | 日均学习时长（分钟） |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `400 Bad Request` | 日期格式错误 |
| `401 Unauthorized` | 未认证或Token无效 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/check-ins/?start_date=2026-05-01&end_date=2026-05-08&page=1&limit=20' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 统计分析模块 (Analytics)

### 1. GET /api/v1/analytics/students/me - 获取当前学生个人统计

**接口描述**

获取当前已登录学生的个人学习统计信息，包括学习时长、做题数量、作业完成情况等。无需指定学生ID，自动获取当前用户数据。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/analytics/students/me` |
| 所需权限 | `student` |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "total_study_time": 1260,
  "total_exercises": 85,
  "completed_exercises": 72,
  "total_assignments": 15,
  "completed_assignments": 12,
  "average_score": 85.5,
  "current_streak": 7
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `total_study_time` | integer | 总学习时长（分钟） |
| `total_exercises` | integer | 总练习题数量 |
| `completed_exercises` | integer | 已完成练习题数量 |
| `total_assignments` | integer | 作业提交总数 |
| `completed_assignments` | integer | 已批改作业数量 |
| `average_score` | number | 平均成绩（可为null） |
| `current_streak` | integer | 当前连续学习天数 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限访问 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:38000/api/v1/analytics/students/me' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 2. GET /api/v1/analytics/student/{id}/progress - 学生个人进度

**接口描述**

获取指定学生的个人学习进度统计，包括学习时长、做题数量等信息。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/analytics/student/{id}/progress` |
| 权限说明 | 查看自己的统计 (student) 或所有学生 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 学生用户ID |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | string | 否 | 开始日期 (YYYY-MM-DD格式) |
| `end_date` | string | 否 | 结束日期 (YYYY-MM-DD格式) |

**请求示例**

```
GET /api/v1/analytics/student/123e4567-e89b-12d3-a456-426614174000/progress?start_date=2026-05-01&end_date=2026-05-08
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "student_id": "123e4567-e89b-12d3-a456-426614174000",
  "period": {
    "start_date": "2026-05-01",
    "end_date": "2026-05-08"
  },
  "total_study_time": 1260,
  "total_exercises": 85,
  "completed_exercises": 72,
  "correct_answers": 65,
  "accuracy_rate": 0.902,
  "daily_average": {
    "study_time_minutes": 180,
    "exercises": 12.14
  },
  "streak_days": 7,
  "achievements": [
    {
      "name": "连续学习一周",
      "badge": "streak_week",
      "earned_at": "2026-05-07"
    }
  ],
  "weak_areas": [
    {
      "topic": "机器学习基础",
      "accuracy": 0.65,
      "exercises_attempted": 10
    }
  ],
  "strong_areas": [
    {
      "topic": "Python基础语法",
      "accuracy": 0.95,
      "exercises_attempted": 25
    }
  ],
  "generated_at": "2026-05-08T10:30:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `student_id` | string | 学生ID |
| `period` | object | 统计周期 |
| `total_study_time` | integer | 总学习时长（分钟） |
| `total_exercises` | integer | 总做题数 |
| `completed_exercises` | integer | 已完成题目数 |
| `correct_answers` | integer | 正确答案数 |
| `accuracy_rate` | number | 正确率 (0-1) |
| `daily_average.study_time_minutes` | integer | 日均学习时长（分钟） |
| `daily_average.exercises` | number | 日均做题数 |
| `streak_days` | integer | 连续学习天数 |
| `achievements` | array | 获得成就列表 |
| `weak_areas` | array | 薄弱领域 |
| `strong_areas` | array | 强项领域 |
| `generated_at` | string | 统计生成时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限查看该学生统计 |
| `404 Not Found` | 学生不存在 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/analytics/student/123e4567-e89b-12d3-a456-426614174000/progress?start_date=2026-05-01&end_date=2026-05-08' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 2. GET /api/v1/analytics/student/{id}/stats - AI学习统计

**接口描述**

调用AI服务分析学生学习情况，生成个性化的学习建议和改进方案。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/analytics/student/{id}/stats` |
| 权限说明 | 查看自己的统计 (student) 或所有学生 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 学生用户ID |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `analysis_type` | string | 否 | 分析类型：comprehensive(综合)、weakness(薄弱点)、recommendation(推荐)，默认comprehensive |

**请求示例**

```
GET /api/v1/analytics/student/123e4567-e89b-12d3-a456-426614174000/stats?analysis_type=comprehensive
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "student_id": "123e4567-e89b-12d3-a456-426614174000",
  "analysis_type": "comprehensive",
  "ai_insights": {
    "learning_style": "visual",
    "best_study_time": "morning",
    "optimal_session_length": 45,
    "learning_efficiency": 0.85,
    "motivation_level": "high"
  },
  "performance_summary": {
    "overall_score": 87,
    "rank_percentile": 72,
    "improvement_trend": "increasing",
    "comparison_to_average": "+15%"
  },
  "personalized_recommendations": [
    {
      "type": "content",
      "priority": "high",
      "title": "加强机器学习基础",
      "description": "您在机器学习相关题目的正确率较低，建议重点学习相关章节",
      "estimated_time": "5天",
      "resources": [
        {
          "title": "机器学习入门课程",
          "type": "course",
          "url": "/courses/ml-basics"
        }
      ]
    },
    {
      "type": "schedule",
      "priority": "medium",
      "title": "调整学习时间",
      "description": "您的最佳学习时段为上午，建议将核心内容安排在早上学习",
      "estimated_time": "持续"
    }
  ],
  "predicted_outcomes": {
    "target_score": 92,
    "achievable_by": "2026-06-01",
    "confidence": 0.78
  },
  "generated_at": "2026-05-08T10:30:00Z",
  "model_version": "gpt-4-analysis-v2"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `student_id` | string | 学生ID |
| `analysis_type` | string | 分析类型 |
| `ai_insights` | object | AI洞察 |
| `ai_insights.learning_style` | string | 学习风格：visual(视觉)、auditory(听觉)、reading(阅读)、kinesthetic(动觉) |
| `ai_insights.best_study_time` | string | 最佳学习时段 |
| `ai_insights.optimal_session_length` | integer | 最佳学习时长（分钟） |
| `ai_insights.learning_efficiency` | number | 学习效率 (0-1) |
| `ai_insights.motivation_level` | string | 动力水平：low、medium、high |
| `performance_summary` | object | 表现摘要 |
| `performance_summary.overall_score` | integer | 综合得分 |
| `performance_summary.rank_percentile` | integer | 百分位排名 |
| `performance_summary.improvement_trend` | string | 进步趋势：increasing、stable、decreasing |
| `performance_summary.comparison_to_average` | string | 与平均水平的比较 |
| `personalized_recommendations` | array | 个性化建议列表 |
| `predicted_outcomes` | object | 预期成果 |
| `generated_at` | string | 分析生成时间 |
| `model_version` | string | AI模型版本 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限查看该学生统计 |
| `404 Not Found` | 学生不存在 |
| `503 Service Unavailable` | AI服务暂时不可用 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/analytics/student/123e4567-e89b-12d3-a456-426614174000/stats?analysis_type=comprehensive' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 3. GET /api/v1/analytics/teacher/{id}/class-stats - 班级统计

**接口描述**

获取教师的班级学习统计信息，包括班级整体学习情况、学生分布等。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/analytics/teacher/{id}/class-stats` |
| 权限说明 | 查看自己的班级统计 (teacher) 或所有班级 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 教师用户ID |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | string | 否 | 开始日期 (YYYY-MM-DD格式) |
| `end_date` | string | 否 | 结束日期 (YYYY-MM-DD格式) |
| `class_id` | string | 否 | 班级ID过滤 |

**请求示例**

```
GET /api/v1/analytics/teacher/123e4567-e89b-12d3-a456-426614174001/class-stats?start_date=2026-05-01&end_date=2026-05-08
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "teacher_id": "123e4567-e89b-12d3-a456-426614174001",
  "period": {
    "start_date": "2026-05-01",
    "end_date": "2026-05-08"
  },
  "class_overview": {
    "total_classes": 3,
    "total_students": 45,
    "active_students": 42,
    "inactive_threshold_days": 7
  },
  "engagement_metrics": {
    "avg_check_in_rate": 0.89,
    "avg_daily_study_minutes": 125,
    "total_exercises_completed": 3825,
    "avg_exercises_per_student": 85
  },
  "performance_distribution": {
    "excellent": 8,
    "good": 18,
    "average": 14,
    "needs_improvement": 5
  },
  "topic_performance": [
    {
      "topic": "Python基础",
      "class_average": 0.88,
      "class_average_formatted": "88%",
      "students_below_average": 5
    },
    {
      "topic": "数据结构",
      "class_average": 0.72,
      "class_average_formatted": "72%",
      "students_below_average": 12
    },
    {
      "topic": "算法设计",
      "class_average": 0.68,
      "class_average_formatted": "68%",
      "students_below_average": 15
    }
  ],
  "at_risk_students": [
    {
      "student_id": "123e4567-e89b-12d3-a456-426614174010",
      "name": "张三",
      "risk_factors": ["low_engagement", "declining_performance"],
      "last_active": "2026-05-05",
      "recommended_actions": ["发送提醒", "预约一对一辅导"]
    }
  ],
  "top_performers": [
    {
      "student_id": "123e4567-e89b-12d3-a456-426614174011",
      "name": "李四",
      "overall_score": 95,
      "improvement_rate": "+12%"
    }
  ],
  "generated_at": "2026-05-08T10:30:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `teacher_id` | string | 教师ID |
| `period` | object | 统计周期 |
| `class_overview` | object | 班级概览 |
| `class_overview.total_classes` | integer | 班级数量 |
| `class_overview.total_students` | integer | 学生总数 |
| `class_overview.active_students` | integer | 活跃学生数 |
| `engagement_metrics` | object | 参与度指标 |
| `engagement_metrics.avg_check_in_rate` | number | 平均打卡率 (0-1) |
| `engagement_metrics.avg_daily_study_minutes` | number | 平均每日学习时长 |
| `performance_distribution` | object | 表现分布 |
| `topic_performance` | array | 主题表现 |
| `at_risk_students` | array | 风险学生列表 |
| `top_performers` | array | 优秀学生列表 |
| `generated_at` | string | 统计生成时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限查看该教师班级统计 |
| `404 Not Found` | 教师不存在 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/analytics/teacher/123e4567-e89b-12d3-a456-426614174001/class-stats?start_date=2026-05-01&end_date=2026-05-08' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 4. GET /api/v1/analytics/teacher/{id}/assignment-stats - 作业统计

**接口描述**

获取教师布置作业的完成情况和统计分析。

**基本信息**

| 属性 | 值 |
|------|-----|
| HTTP方法 | `GET` |
| 完整URL | `/api/v1/analytics/teacher/{id}/assignment-stats` |
| 权限说明 | 查看自己的作业统计 (teacher) 或所有作业 (admin) |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string (UUID) | 是 | 教师用户ID |

**请求头说明**

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是 | Bearer Token，用户认证令牌 |

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | string | 否 | 开始日期 (YYYY-MM-DD格式) |
| `end_date` | string | 否 | 结束日期 (YYYY-MM-DD格式) |
| `assignment_id` | string | 否 | 作业ID过滤 |

**请求示例**

```
GET /api/v1/analytics/teacher/123e4567-e89b-12d3-a456-426614174001/assignment-stats?start_date=2026-05-01&end_date=2026-05-08
```

**响应体 (Response Body)**

**成功响应 (200 OK)**

```json
{
  "teacher_id": "123e4567-e89b-12d3-a456-426614174001",
  "period": {
    "start_date": "2026-05-01",
    "end_date": "2026-05-08"
  },
  "assignment_summary": {
    "total_assignments": 12,
    "active_assignments": 5,
    "completed_assignments": 7
  },
  "submission_stats": {
    "total_submissions": 540,
    "on_time_submissions": 498,
    "late_submissions": 42,
    "on_time_rate": 0.922,
    "avg_completion_time_hours": 18.5
  },
  "grade_distribution": {
    "A": 85,
    "B": 150,
    "C": 180,
    "D": 95,
    "F": 30
  },
  "assignment_details": [
    {
      "assignment_id": "880e8400-e29b-41d4-a716-446655440001",
      "title": "Python基础练习一",
      "total_students": 45,
      "submitted": 44,
      "on_time": 42,
      "late": 2,
      "not_submitted": 1,
      "avg_score": 85.5,
      "highest_score": 100,
      "lowest_score": 62,
      "difficulty_rating": 2.5
    },
    {
      "assignment_id": "880e8400-e29b-41d4-a716-446655440002",
      "title": "数据结构作业",
      "total_students": 45,
      "submitted": 43,
      "on_time": 38,
      "late": 5,
      "not_submitted": 2,
      "avg_score": 72.3,
      "highest_score": 98,
      "lowest_score": 45,
      "difficulty_rating": 3.8
    }
  ],
  "common_mistakes": [
    {
      "topic": "递归算法",
      "occurrence_count": 28,
      "affected_students": 28,
      "recommendation": "建议增加递归专题练习"
    },
    {
      "topic": "异常处理",
      "occurrence_count": 15,
      "affected_students": 15,
      "recommendation": "建议提供异常处理的代码示例"
    }
  ],
  "generated_at": "2026-05-08T10:30:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `teacher_id` | string | 教师ID |
| `period` | object | 统计周期 |
| `assignment_summary` | object | 作业概览 |
| `submission_stats` | object | 提交统计 |
| `submission_stats.on_time_rate` | number | 按时提交率 (0-1) |
| `submission_stats.avg_completion_time_hours` | number | 平均完成时长（小时） |
| `grade_distribution` | object | 成绩分布 |
| `assignment_details` | array | 作业详情列表 |
| `common_mistakes` | array | 常见错误列表 |
| `generated_at` | string | 统计生成时间 |

**状态码及说明**

| 状态码 | 说明 |
|--------|------|
| `200 OK` | 请求成功 |
| `401 Unauthorized` | 未认证或Token无效 |
| `403 Forbidden` | 无权限查看该教师作业统计 |
| `404 Not Found` | 教师不存在 |

**curl 命令示例**

```bash
curl -X GET 'http://localhost:3000/api/v1/analytics/teacher/123e4567-e89b-12d3-a456-426614174001/assignment-stats?start_date=2026-05-01&end_date=2026-05-08' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 附录

### 通用响应格式

所有API响应均遵循以下通用格式：

**成功响应**

```json
{
  "data": {},
  "message": "操作成功"
}
```

**错误响应**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

### 常用错误码

| 错误码 | 说明 |
|--------|------|
| `UNAUTHORIZED` | 未认证或认证已过期 |
| `FORBIDDEN` | 无权限访问该资源 |
| `NOT_FOUND` | 请求的资源不存在 |
| `VALIDATION_ERROR` | 请求参数验证失败 |
| `INTERNAL_ERROR` | 服务器内部错误 |

### 认证说明

所有需要认证的API需要在请求头中包含：

```
Authorization: Bearer <token>
```

Token通过登录接口获取，有效期为24小时。

### 分页参数说明

| 参数 | 类型 | 默认值 | 最大值 | 说明 |
|------|------|--------|--------|------|
| `page` | integer | 1 | - | 页码，从1开始 |
| `limit` | integer | 20 | 100 | 每页记录数 |

### 日期格式

所有日期使用ISO 8601格式：YYYY-MM-DDTHH:mm:ssZ

查询参数中的日期格式：YYYY-MM-DD

---

*文档版本: 1.0*
*最后更新: 2026-05-08*
