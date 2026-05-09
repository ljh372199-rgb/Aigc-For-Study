# Aigc For Study - 认证模块与用户模块 API 测试文档

## 1. 文档概述

本文档详细描述了 Aigc For Study 项目中认证模块（Authentication）和用户模块（Users）的 API 接口规范、请求格式、响应格式以及测试方法。

### 1.1 基础信息

| 项目 | 值 |
|------|-----|
| 项目名称 | Aigc For Study |
| API 版本 | v1 |
| 基础 URL（本地开发） | `http://localhost:8000` |
| 基础 URL（生产环境） | `https://api.aigc-study.com` |

### 1.2 认证说明

本项目采用 **JWT (JSON Web Token)** 方式进行身份认证。

- **认证方式**：Bearer Token
- **Token 获取**：通过登录接口获取 `access_token` 和 `refresh_token`
- **Token 使用**：在请求头中添加 `Authorization: Bearer {access_token}`
- **Token 有效期**：
  - Access Token：60 分钟
  - Refresh Token：7 天

### 1.3 支持的角色

| 角色 | 说明 |
|------|------|
| `student` | 学生（默认角色） |
| `teacher` | 教师 |
| `admin` | 管理员 |

---

## 2. 认证模块 API

### 2.1 用户注册

**接口描述**：创建新用户账号

**HTTP 方法**：`POST`

**完整 URL**：`POST /api/v1/auth/register`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |

#### 请求体 (JSON)

```json
{
  "username": "student001",      // string, 必填, 用户名 (4-50字符)
  "email": "student@example.com", // string, 必填, 邮箱地址
  "password": "SecurePass123!",   // string, 必填, 密码
  "role": "student"               // string, 可选, 角色类型 (student/teacher/admin), 默认: student
}
```

#### 请求示例

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student001",
    "email": "student@example.com",
    "password": "SecurePass123!",
    "role": "student"
  }'
```

#### 响应体 (JSON)

**成功响应 (201 Created)**：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID, 用户唯一标识
  "username": "student001",                      // string, 用户名
  "email": "student@example.com",                // string, 邮箱
  "role": "student",                             // string, 角色
  "status": "active",                            // string, 状态
  "created_at": "2025-01-15T10:30:00Z",          // datetime, 创建时间
  "updated_at": "2025-01-15T10:30:00Z"          // datetime, 更新时间
}
```

**失败响应 - 用户名已存在 (400)**：

```json
{
  "detail": "Username already registered"
}
```

**失败响应 - 邮箱已存在 (400)**：

```json
{
  "detail": "Email already registered"
}
```

**失败响应 - 验证错误 (422)**：

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 201 Created | 注册成功，返回新用户信息 |
| 400 Bad Request | 用户名或邮箱已被注册 |
| 422 Unprocessable Entity | 请求体验证失败 |

---

### 2.2 用户登录

**接口描述**：用户登录，获取访问令牌

**HTTP 方法**：`POST`

**完整 URL**：`POST /api/v1/auth/login`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/x-www-form-urlencoded |

#### 请求体 (Form Data)

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

#### 请求示例

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student001&password=SecurePass123!"
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // string, JWT访问令牌
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // string, JWT刷新令牌
  "token_type": "bearer"                                      // string, 令牌类型
}
```

**失败响应 - 用户名或密码错误 (401)**：

```json
{
  "detail": "Incorrect username or password"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 登录成功，返回令牌 |
| 401 Unauthorized | 用户名或密码错误 |

---

### 2.3 刷新令牌

**接口描述**：使用刷新令牌获取新的访问令牌

**HTTP 方法**：`POST`

**完整 URL**：`POST /api/v1/auth/refresh`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |

#### 请求体 (JSON)

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 请求示例

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // string, 新的JWT访问令牌
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // string, 新的JWT刷新令牌
  "token_type": "bearer"                                      // string, 令牌类型
}
```

**失败响应 - 无效的刷新令牌 (401)**：

```json
{
  "detail": "Invalid token type"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 刷新成功，返回新的令牌对 |
| 401 Unauthorized | 刷新令牌无效或已过期 |

---

## 3. 用户模块 API

### 3.1 获取当前用户信息

**接口描述**：获取当前登录用户的信息

**HTTP 方法**：`GET`

**完整 URL**：`GET /api/v1/users/me`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {access_token} |

#### 请求示例

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID, 用户唯一标识
  "username": "student001",                      // string, 用户名
  "email": "student@example.com",                // string, 邮箱
  "role": "student",                             // string, 角色
  "status": "active",                            // string, 状态
  "created_at": "2025-01-15T10:30:00Z",          // datetime, 创建时间
  "updated_at": "2025-01-15T10:30:00Z"           // datetime, 更新时间
}
```

**失败响应 - 未提供令牌 (401)**：

```json
{
  "detail": "Not authenticated"
}
```

**失败响应 - 令牌无效 (401)**：

```json
{
  "detail": "Could not validate credentials"
}
```

**失败响应 - 用户已禁用 (400)**：

```json
{
  "detail": "Inactive user"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 获取成功，返回当前用户信息 |
| 401 Unauthorized | 未认证或令牌无效 |
| 400 Bad Request | 用户已被禁用 |

---

### 3.2 更新当前用户信息

**接口描述**：更新当前登录用户的个人信息

**HTTP 方法**：`PUT`

**完整 URL**：`PUT /api/v1/users/me`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {access_token} |
| Content-Type | string | 是 | application/json |

#### 请求体 (JSON)

```json
{
  "username": "new_username",        // string, 可选, 新用户名 (4-50字符)
  "email": "newemail@example.com",   // string, 可选, 新邮箱
  "status": "active"                // string, 可选, 状态 (active/inactive)
}
```

#### 请求示例

```bash
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_username",
    "email": "newemail@example.com"
  }'
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID, 用户唯一标识
  "username": "new_username",                   // string, 更新后的用户名
  "email": "newemail@example.com",              // string, 更新后的邮箱
  "role": "student",                             // string, 角色
  "status": "active",                            // string, 状态
  "created_at": "2025-01-15T10:30:00Z",          // datetime, 创建时间
  "updated_at": "2025-01-15T11:00:00Z"           // datetime, 更新时间
}
```

**失败响应 - 用户名已存在 (400)**：

```json
{
  "detail": "Username already exists"
}
```

**失败响应 - 邮箱已存在 (400)**：

```json
{
  "detail": "Email already exists"
}
```

**失败响应 - 未认证 (401)**：

```json
{
  "detail": "Could not validate credentials"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 更新成功，返回更新后的用户信息 |
| 400 Bad Request | 用户名或邮箱已被使用 |
| 401 Unauthorized | 未认证或令牌无效 |

---

### 3.3 获取用户列表

**接口描述**：获取所有用户列表（仅管理员可访问）

**HTTP 方法**：`GET`

**完整 URL**：`GET /api/v1/users/`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {access_token}（需admin角色） |

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | int | 否 | 跳过的记录数，默认: 0 |
| limit | int | 否 | 返回的记录数，默认: 100 |
| role | string | 否 | 按角色筛选 (student/teacher/admin) |

#### 请求示例

```bash
# 获取所有用户
curl -X GET "http://localhost:8000/api/v1/users/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 获取学生用户列表 (分页)
curl -X GET "http://localhost:8000/api/v1/users/?skip=0&limit=10&role=student" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID, 用户唯一标识
    "username": "student001",                      // string, 用户名
    "email": "student@example.com",                // string, 邮箱
    "role": "student",                             // string, 角色
    "status": "active",                            // string, 状态
    "created_at": "2025-01-15T10:30:00Z",          // datetime, 创建时间
    "updated_at": "2025-01-15T10:30:00Z"           // datetime, 更新时间
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",  // UUID, 用户唯一标识
    "username": "teacher001",                      // string, 用户名
    "email": "teacher@example.com",               // string, 邮箱
    "role": "teacher",                            // string, 角色
    "status": "active",                            // string, 状态
    "created_at": "2025-01-10T08:00:00Z",          // datetime, 创建时间
    "updated_at": "2025-01-10T08:00:00Z"           // datetime, 更新时间
  }
]
```

**失败响应 - 权限不足 (403)**：

```json
{
  "detail": "Insufficient permissions"
}
```

**失败响应 - 未认证 (401)**：

```json
{
  "detail": "Could not validate credentials"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 获取成功，返回用户列表 |
| 401 Unauthorized | 未认证或令牌无效 |
| 403 Forbidden | 权限不足，需要 admin 角色 |

---

### 3.4 获取指定用户信息

**接口描述**：根据用户ID获取指定用户信息（仅教师或管理员可访问）

**HTTP 方法**：`GET`

**完整 URL**：`GET /api/v1/users/{user_id}`

#### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {access_token}（需teacher或admin角色） |

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | UUID | 是 | 用户ID |

#### 请求示例

```bash
curl -X GET "http://localhost:8000/api/v1/users/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应体 (JSON)

**成功响应 (200 OK)**：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID, 用户唯一标识
  "username": "student001",                      // string, 用户名
  "email": "student@example.com",                // string, 邮箱
  "role": "student",                             // string, 角色
  "status": "active",                            // string, 状态
  "created_at": "2025-01-15T10:30:00Z",          // datetime, 创建时间
  "updated_at": "2025-01-15T10:30:00Z"           // datetime, 更新时间
}
```

**失败响应 - 用户不存在 (404)**：

```json
{
  "detail": "User not found"
}
```

**失败响应 - 权限不足 (403)**：

```json
{
  "detail": "Insufficient permissions"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 OK | 获取成功，返回用户信息 |
| 401 Unauthorized | 未认证或令牌无效 |
| 403 Forbidden | 权限不足，需要 teacher 或 admin 角色 |
| 404 Not Found | 用户不存在 |

---

## 4. 测试场景

### 4.1 完整用户注册登录流程测试

```bash
# 1. 注册新用户
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "student"
  }'

# 2. 使用注册的用户登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123!"

# 3. 使用获取的token访问用户信息
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer {access_token}"

# 4. 更新用户信息
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'
```

### 4.2 Token 刷新流程测试

```bash
# 1. 登录获取令牌对
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123!"

# 2. 使用 refresh_token 获取新的令牌对
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "{refresh_token}"}'
```

---

## 5. 错误处理

### 5.1 通用错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### 5.2 HTTP 状态码总结

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误或业务逻辑错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 422 | 请求体验证失败 |
| 500 | 服务器内部错误 |

---

## 6. 附录

### 6.1 JWT Token 结构

```json
{
  "sub": "user_id",
  "type": "access|refresh",
  "exp": 1234567890
}
```

### 6.2 User 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户唯一标识 |
| username | string | 用户名（唯一） |
| email | string | 邮箱地址（唯一） |
| password_hash | string | 密码哈希值 |
| role | string | 角色类型 |
| status | string | 账号状态 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

---

*文档版本：1.0*
*最后更新：2025-01-15*
