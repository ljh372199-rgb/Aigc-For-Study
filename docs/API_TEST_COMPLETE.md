# Aigc For Study 完整API测试文档

## 文档说明

本文档包含所有53个API端点的详细测试数据，精确到数据包级别。

**测试环境**:
- 基础URL: `http://localhost:38000`
- 测试时间: 2026-05-08
- API版本: v1
- 总端点数: 57

---

## 1. 认证模块 (Auth) - 3个端点

### 1.1 用户注册 POST /api/v1/auth/register

**请求包**:
```json
{
  "username": "test_user_01",
  "email": "test_01@example.com",
  "password": "Test123456",
  "role": "student"
}
```

**成功响应 (201)**:
```json
{
  "id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "username": "test_user_01",
  "email": "test_01@example.com",
  "role": "student",
  "status": "active",
  "created_at": "2026-05-07T18:36:07.511437",
  "updated_at": "2026-05-07T18:36:07.511437"
}
```

### 1.2 用户登录 POST /api/v1/auth/login

**请求包 (form-data)**: `username=test_user_01&password=Test123456`

**成功响应 (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 1.3 Token刷新 POST /api/v1/auth/refresh

**请求包**: `{}`

**成功响应 (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 2. 用户模块 (Users) - 5个端点

### 2.1 获取当前用户 GET /api/v1/users/me

**成功响应 (200)**:
```json
{
  "id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "username": "test_user_01",
  "email": "test_01@example.com",
  "role": "student",
  "status": "active",
  "created_at": "2026-05-07T18:36:07.511437",
  "updated_at": "2026-05-07T18:36:07.511437"
}
```

### 2.2 更新当前用户 PUT /api/v1/users/me

**请求包**:
```json
{
  "username": "updated_username",
  "email": "updated@example.com"
}
```

**成功响应 (200)**:
```json
{
  "id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "username": "updated_username",
  "email": "updated@example.com",
  "role": "student",
  "status": "active",
  "created_at": "2026-05-07T18:36:07.511437",
  "updated_at": "2026-05-07T18:40:00.123456"
}
```

### 2.3 更新用户资料 PUT /api/v1/users/me/profile

**请求包**:
```json
{
  "profile": {
    "bio": "热爱编程的学生",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**成功响应 (200)**: 返回更新后的用户信息

### 2.4 获取指定用户 GET /api/v1/users/{user_id}

**成功响应 (200)**: 返回用户详情

### 2.5 获取用户列表 GET /api/v1/users/

**成功响应 (200)**: 返回用户数组

---

## 3. 职业目标模块 (Careers) - 3个端点

### 3.1 获取职业列表 GET /api/v1/careers/

**成功响应 (200)**:
```json
[
  {
    "id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
    "name": "前端工程师",
    "description": "负责Web前端开发",
    "skills_required": ["HTML", "CSS", "JavaScript", "React", "Vue"],
    "created_at": "2026-05-07T17:24:01.625850"
  },
  {
    "id": "d469d087-e76d-4304-babe-fc1a2a52657d",
    "name": "后端工程师",
    "description": "负责服务器端开发",
    "skills_required": ["Python", "Java", "Go", "数据库", "API设计"],
    "created_at": "2026-05-07T17:24:01.625850"
  }
]
```

### 3.2 获取职业详情 GET /api/v1/careers/{career_id}

**成功响应 (200)**: 返回单个职业信息

### 3.3 创建职业目标 POST /api/v1/careers/

**请求包**:
```json
{
  "name": "全栈工程师",
  "description": "同时负责前后端开发",
  "skills_required": ["HTML", "CSS", "JavaScript", "Python"]
}
```

**成功响应 (201)**: 返回创建的职业信息

---

## 4. 学习方案模块 (Learning Plans) - 5个端点

### 4.1 创建学习方案 POST /api/v1/learning-plans/

**请求包**:
```json
{
  "career_goal_id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
  "title": "前端开发学习方案"
}
```

**成功响应 (201)**:
```json
{
  "id": "5fe04c25-809f-4f64-bb89-c38549968626",
  "user_id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "career_goal_id": "1896093e-9339-470c-9c59-ef59af1b6fdd",
  "title": "前端开发学习方案",
  "plan_data": null,
  "status": "active",
  "created_at": "2026-05-07T18:36:34.993765",
  "updated_at": "2026-05-07T18:36:34.993765"
}
```

### 4.2 获取学习方案列表 GET /api/v1/learning-plans/

**成功响应 (200)**: 返回学习方案数组

### 4.3 获取学习方案详情 GET /api/v1/learning-plans/{plan_id}

**成功响应 (200)**: 返回单个学习方案

### 4.4 更新学习方案 PUT /api/v1/learning-plans/{plan_id}

**请求包**:
```json
{
  "title": "更新后的学习方案",
  "plan_data": {"weeks": 12, "modules": ["HTML", "CSS", "JavaScript"]}
}
```

**成功响应 (200)**: 返回更新后的方案

### 4.5 删除学习方案 DELETE /api/v1/learning-plans/{plan_id}

**成功响应 (200)**:
```json
{
  "message": "学习方案删除成功"
}
```

---

## 5. 打卡模块 (Check-ins) - 4个端点

### 5.1 创建打卡记录 POST /api/v1/check-ins/

**请求包**:
```json
{
  "duration_minutes": 120,
  "note": "完成了Python基础学习"
}
```

**成功响应 (201)**:
```json
{
  "id": "checkin-uuid-12345",
  "user_id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "duration_minutes": 120,
  "note": "完成了Python基础学习",
  "check_in_date": "2026-05-08",
  "created_at": "2026-05-08T10:30:00.000000"
}
```

### 5.2 获取打卡列表 GET /api/v1/check-ins/

**成功响应 (200)**: 返回打卡记录数组

### 5.3 获取打卡详情 GET /api/v1/check-ins/{check_in_id}

**成功响应 (200)**: 返回单个打卡记录

### 5.4 更新打卡记录 PUT /api/v1/check-ins/{check_in_id}

**请求包**:
```json
{
  "duration_minutes": 150,
  "note": "更新后的备注"
}
```

**成功响应 (200)**: 返回更新后的打卡记录

---

## 6. 练习题模块 (Exercises) - 5个端点

### 6.1 AI生成练习题 POST /api/v1/exercises/generate

**请求包**:
```json
{
  "plan_id": "5fe04c25-809f-4f64-bb89-c38549968626",
  "topic": "Python基础语法",
  "count": 3,
  "difficulty": "medium"
}
```

**成功响应 (201)**:
```json
[
  {
    "id": "ac315cc0-3009-4192-adc9-dca4d50c5c4e",
    "plan_id": "5fe04c25-809f-4f64-bb89-c38549968626",
    "topic": "Python基础语法",
    "content": "以下代码的输出是什么？...",
    "type": "short_answer",
    "answer": "[1] [2] [1, 3]",
    "options": [],
    "difficulty": "medium",
    "result": null,
    "student_id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
    "submitted_at": null,
    "created_at": "2026-05-08T10:35:00.000000",
    "updated_at": "2026-05-08T10:35:00.000000"
  }
]
```

### 6.2 获取练习题列表 GET /api/v1/exercises/

**成功响应 (200)**: 返回练习题数组

### 6.3 获取练习题详情 GET /api/v1/exercises/{exercise_id}

**成功响应 (200)**: 返回单个练习题

### 6.4 提交练习答案 POST /api/v1/exercises/{exercise_id}/submit

**请求包**:
```json
{
  "answer": "[1] [2] [1, 3]"
}
```

**成功响应 (200)**: 返回更新后的练习记录

### 6.5 AI批改练习 POST /api/v1/exercises/{exercise_id}/grade

**请求包**: `{}`

**成功响应 (200)**:
```json
{
  "id": "ac315cc0-3009-4192-adc9-dca4d50c5c4e",
  "result": {
    "score": 100,
    "feedback": "回答正确！",
    "grade_level": "A"
  }
}
```

---

## 7. 作业模块 (Assignments) - 7个端点

### 7.1 创建作业 POST /api/v1/assignments/

**请求包**:
```json
{
  "title": "第一章编程作业",
  "description": "完成以下Python编程练习",
  "due_date": "2026-05-15T23:59:59"
}
```

**成功响应 (201)**: 返回创建的作业

### 7.2 获取作业列表 GET /api/v1/assignments/

**成功响应 (200)**: 返回作业数组

### 7.3 获取作业详情 GET /api/v1/assignments/{assignment_id}

**成功响应 (200)**: 返回单个作业

### 7.4 更新作业 PUT /api/v1/assignments/{assignment_id}

**请求包**:
```json
{
  "title": "第一章编程作业（更新版）",
  "due_date": "2026-05-20T23:59:59"
}
```

**成功响应 (200)**: 返回更新后的作业

### 7.5 删除作业 DELETE /api/v1/assignments/{assignment_id}

**成功响应 (200)**:
```json
{
  "message": "作业删除成功"
}
```

### 7.6 提交作业 POST /api/v1/assignments/{assignment_id}/submit

**请求包**:
```json
{
  "content": "# 作业答案\n```python\nprint(\"Hello World\")\n```",
  "attachments": []
}
```

**成功响应 (201)**: 返回提交记录

### 7.7 批改作业 PUT /api/v1/assignments/submissions/{submission_id}/grade

**请求包**:
```json
{
  "score": 95.0,
  "feedback": "代码简洁，完成度高！",
  "status": "graded"
}
```

**成功响应 (200)**: 返回更新后的提交记录

---

## 8. 课程模块 (Courses) - 7个端点

### 8.1 创建课程 POST /api/v1/courses/

**请求包**:
```json
{
  "title": "Python编程入门",
  "description": "从零开始学习Python编程",
  "cover_image": "https://example.com/python.jpg"
}
```

**成功响应 (200)**:
```json
{
  "id": "course-uuid-12345",
  "title": "Python编程入门",
  "description": "从零开始学习Python编程",
  "cover_image": "https://example.com/python.jpg",
  "teacher_id": "808b6eab-ba74-48c6-b2b6-28ecd637ceb1",
  "status": "active",
  "created_at": "2026-05-08T12:00:00.000000",
  "updated_at": "2026-05-08T12:00:00.000000"
}
```

### 8.2 获取课程列表 GET /api/v1/courses/

**成功响应 (200)**: 返回课程数组

### 8.3 获取课程详情 GET /api/v1/courses/{course_id}

**成功响应 (200)**: 返回单个课程

### 8.4 更新课程 PUT /api/v1/courses/{course_id}

**请求包**:
```json
{
  "title": "Python编程入门（升级版）"
}
```

**成功响应 (200)**: 返回更新后的课程

### 8.5 删除课程 DELETE /api/v1/courses/{course_id}

**成功响应 (200)**:
```json
{
  "message": "课程删除成功"
}
```

### 8.6 学生报名课程 POST /api/v1/courses/{course_id}/enroll

**请求包**: `{}`

**成功响应 (200)**:
```json
{
  "id": "enroll-uuid-12345",
  "course_id": "course-uuid-12345",
  "student_id": "0860d562-a2e9-4c86-93c8-6a7ce27e3401",
  "enrollment_date": "2026-05-08T12:15:00.000000",
  "status": "active"
}
```

### 8.7 查看已报名学生 GET /api/v1/courses/{course_id}/students

**成功响应 (200)**: 返回报名学生数组

---

## 9. 班级模块 (Classes) - 6个端点

### 9.1 创建班级 POST /api/v1/classes

**请求包**:
```json
{
  "name": "Python编程基础班",
  "description": "学习Python编程语言的基础课程"
}
```

**成功响应 (201)**:
```json
{
  "id": "19e9a9bc-c1c7-4b78-9c18-b9d11f72739c",
  "name": "Python编程基础班",
  "description": "学习Python编程语言的基础课程",
  "teacher_id": "uuid",
  "invite_code": "C86TYODG",
  "status": "active",
  "created_at": "2026-05-09T10:00:00.000000",
  "updated_at": "2026-05-09T10:00:00.000000"
}
```

### 9.2 获取班级列表 GET /api/v1/classes

**成功响应 (200)**: 返回班级数组

### 9.3 获取班级详情 GET /api/v1/classes/{class_id}

**成功响应 (200)**: 返回单个班级

### 9.4 获取班级邀请码 GET /api/v1/classes/{class_id}/invite-code

**成功响应 (200)**:
```json
{
  "invite_code": "C86TYODG",
  "class_id": "19e9a9bc-c1c7-4b78-9c18-b9d11f72739c",
  "class_name": "Python编程基础班"
}
```

### 9.5 加入班级 POST /api/v1/classes/join

**请求包**:
```json
{
  "invite_code": "C86TYODG"
}
```

**成功响应 (200)**:
```json
{
  "message": "Successfully joined the class",
  "class_id": "19e9a9bc-c1c7-4b78-9c18-b9d11f72739c",
  "class_name": "Python编程基础班"
}
```

### 9.6 获取已加入班级 GET /api/v1/classes/my

**成功响应 (200)**: 返回已加入的班级数组

---

## 10. 作业管理模块 (Homework) - 9个端点

### 9.1 布置作业 POST /api/v1/homework/

**请求包**:
```json
{
  "course_id": "course-uuid-12345",
  "title": "第一章练习题",
  "description": "完成以下Python练习",
  "deadline": "2026-05-15T23:59:59",
  "max_score": 100.0
}
```

**成功响应 (200)**: 返回创建的作业

### 9.2 获取作业列表 GET /api/v1/homework/

**成功响应 (200)**: 返回作业数组

### 9.3 获取作业详情 GET /api/v1/homework/{homework_id}

**成功响应 (200)**: 返回单个作业

### 9.4 更新作业 PUT /api/v1/homework/{homework_id}

**请求包**:
```json
{
  "title": "第一章练习题（更新版）"
}
```

**成功响应 (200)**: 返回更新后的作业

### 9.5 删除作业 DELETE /api/v1/homework/{homework_id}

**成功响应 (200)**:
```json
{
  "message": "作业删除成功"
}
```

### 9.6 学生提交作业 POST /api/v1/homework/{homework_id}/submit

**请求包**:
```json
{
  "content": "# Python练习答案\n1. print(\"Hello World\")"
}
```

**成功响应 (200)**: 返回提交记录

### 9.7 查看作业提交 GET /api/v1/homework/{homework_id}/submissions

**成功响应 (200)**: 返回提交数组

### 9.8 查看我的提交 GET /api/v1/homework/submissions/mine

**成功响应 (200)**: 返回当前用户的提交数组

### 9.9 批改作业 PUT /api/v1/homework/submissions/{submission_id}

**请求包**:
```json
{
  "score": 88.0,
  "feedback": "完成不错",
  "status": "graded"
}
```

**成功响应 (200)**: 返回更新后的提交记录

---

## 11. 统计分析模块 (Analytics) - 4个端点

### 11.1 学生进度 GET /api/v1/analytics/student/{student_id}/progress

**成功响应 (200)**:
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

### 11.2 AI学习分析 GET /api/v1/analytics/student/{student_id}/stats

**成功响应 (200)**:
```json
{
  "total_study_time": 42,
  "exercise_accuracy": 78.5,
  "strengths": ["代数", "几何"],
  "weaknesses": ["概率统计", "函数"],
  "recent_performance": [
    {"date": "2025-03-01", "score": 82},
    {"date": "2025-03-08", "score": 75},
    {"date": "2025-03-15", "score": 88}
  ]
}
```

### 10.3 班级统计 GET /api/v1/analytics/teacher/{teacher_id}/class-stats

**成功响应 (200)**:
```json
{
  "total_students": 0,
  "average_completion_rate": 0.0,
  "average_score": 0.0,
  "top_performers": [],
  "struggling_students": []
}
```

### 10.4 作业统计 GET /api/v1/analytics/teacher/{teacher_id}/assignment-stats

**成功响应 (200)**: 返回作业统计数据

---

## 附录：错误响应格式

**401 未认证**:
```json
{
  "detail": "Not authenticated"
}
```

**403 权限不足**:
```json
{
  "detail": "Insufficient permissions"
}
```

**422 验证错误**:
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "field"],
      "msg": "Field required",
      "input": {...}
    }
  ]
}
```
