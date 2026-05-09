# Aigc For Study 前端连接后端指南

## 文档说明

本文档为前端开发者提供连接后端API的完整指南，包括环境配置、认证流程、API调用示例等。

**版本:** v1.0  
**更新日期:** 2026-05-08

---

## 目录

1. [后端服务信息](#1-后端服务信息)
2. [环境配置](#2-环境配置)
3. [认证流程](#3-认证流程)
4. [API调用示例](#4-api调用示例)
5. [角色权限说明](#5-角色权限说明)
6. [错误处理](#6-错误处理)
7. [CORS配置](#7-cors配置)
8. [数据模型](#8-数据模型)
9. [WebSocket连接](#9-websocket连接)

---

## 1. 后端服务信息

### 1.1 服务端点

| 环境 | Base URL | 说明 |
|------|----------|------|
| 本地开发 | `http://localhost:38000` | 后端API地址 |
| 测试环境 | `https://staging-api.aigcstudy.com` | 待配置 |
| 生产环境 | `https://api.aigcstudy.com` | 待配置 |

### 1.2 API版本

当前API版本: **v1**

所有API端点前缀: `/api/v1/`

### 1.3 健康检查

```bash
GET /health

# 响应
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 2. 环境配置

### 2.1 前端环境变量 (.env)

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:38000/api/v1
VITE_WS_URL=ws://localhost:38000/ws
VITE_APP_NAME=Aigc For Study
VITE_APP_ENV=development

# 生产环境
VITE_API_BASE_URL=https://api.aigcstudy.com/api/v1
VITE_WS_URL=wss://api.aigcstudy.com/ws
VITE_APP_NAME=Aigc For Study
VITE_APP_ENV=production
```

### 2.2 API客户端配置

**TypeScript 配置示例 (src/api/client.ts)**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:38000/api/v1';

interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(options: ApiClientOptions) {
    this.baseURL = options.baseURL;
    this.timeout = options.timeout || 30000;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post<T>(endpoint: string, data?: object): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put<T>(endpoint: string, data?: object): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token过期，尝试刷新
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // 重新发起请求
        throw new Error('Token refreshed');
      }
      // 刷新失败，跳转登录
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
    return false;
  }
}

export const apiClient = new ApiClient({ baseURL: API_BASE_URL });
```

---

## 3. 认证流程

### 3.1 设备指纹生成

为了防止验证码滥用，前端需要生成设备指纹并在请求中传递：

```typescript
// utils/deviceFingerprint.ts
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [];
  
  // 1. User-Agent
  components.push(navigator.userAgent);
  
  // 2. 屏幕信息
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // 3. 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // 4. 语言
  components.push(navigator.language);
  
  // 5. 平台
  components.push(navigator.platform);
  
  // 6. Canvas指纹
  components.push(getCanvasFingerprint());
  
  // 7. WebGL指纹
  components.push(getWebGLFingerprint());
  
  // 生成SHA256哈希
  const fingerprint = await sha256(components.join('|'));
  return fingerprint;
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device Fingerprint', 2, 15);
    return canvas.toDataURL().slice(0, 50);
  } catch (e) {
    return 'canvas-unsupported';
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return `${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}`;
  } catch (e) {
    return 'webgl-unsupported';
  }
}

async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}
```

### 3.2 发送验证码

```typescript
// POST /api/v1/auth/send-verify-code
interface SendVerifyCodeRequest {
  email: string;
  type: 'register' | 'reset_password';  // 注册或重置密码
}

interface SendVerifyCodeResponse {
  code: number;
  message: string;
  data: {
    expire_seconds: number;    // 验证码有效期（秒）
    cooldown_seconds: number;  // 发送冷却时间（秒）
  };
}

// 示例
async function sendVerifyCode(email: string, type: 'register' | 'reset_password') {
  const deviceFingerprint = await generateDeviceFingerprint();
  
  const response = await fetch(`${API_BASE_URL}/auth/send-verify-code`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': deviceFingerprint
    },
    body: JSON.stringify({ email, type }),
  });
  
  if (response.status === 429) {
    throw new Error('发送过于频繁，请稍后再试');
  }
  
  return response.json();
}
```

### 3.3 注册

```typescript
// POST /api/v1/auth/register
interface RegisterRequest {
  username: string;   // 用户名 (3-50字符)
  email: string;      // 邮箱
  password: string;   // 密码 (至少6字符)
  verify_code: string; // 邮箱验证码 (6位数字)
  role?: 'student' | 'teacher';  // 角色，默认student
}

interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher';
  status: string;
  created_at: string;
  updated_at: string;
}

// 示例
async function register(data: RegisterRequest) {
  const deviceFingerprint = await generateDeviceFingerprint();
  
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': deviceFingerprint
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 3.4 忘记密码

```typescript
// POST /api/v1/auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
  verify_code: string;    // 邮箱验证码 (6位数字)
  new_password: string;   // 新密码 (至少6字符)
}

interface ForgotPasswordResponse {
  code: number;
  message: string;
}

// 示例
async function forgotPassword(data: ForgotPasswordRequest) {
  const deviceFingerprint = await generateDeviceFingerprint();
  
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': deviceFingerprint
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 3.5 登录

**重要**: 登录使用 `application/x-www-form-urlencoded` 格式

```typescript
// POST /api/v1/auth/login
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

// 示例
async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }
  throw new Error('Login failed');
}
```

### 3.3 登出

```typescript
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}
```

### 3.4 Token刷新

```typescript
// POST /api/v1/auth/refresh
// 自动处理，见ApiClient实现
```

---

## 4. API调用示例

### 4.1 用户模块

```typescript
// 获取当前用户
async function getCurrentUser() {
  return apiClient.get<User>('/users/me');
}

// 更新当前用户
async function updateUser(data: { username?: string; email?: string }) {
  return apiClient.put<User>('/users/me', data);
}

// 更新用户资料
async function updateProfile(data: { profile: { bio?: string; avatar?: string } }) {
  return apiClient.put<User>('/users/me/profile', data);
}
```

### 4.2 职业目标模块

```typescript
// 获取职业列表
async function getCareers() {
  return apiClient.get<Career[]>('/careers/');
}

interface Career {
  id: string;
  name: string;
  description: string;
  skills_required: string[];
  created_at: string;
}
```

### 4.3 学习方案模块

```typescript
// 创建学习方案
async function createLearningPlan(data: {
  career_goal_id: string;
  title: string;
}) {
  return apiClient.post<LearningPlan>('/learning-plans/', data);
}

// 获取学习方案列表
async function getLearningPlans() {
  return apiClient.get<LearningPlan[]>('/learning-plans/');
}

// 获取学习方案详情
async function getLearningPlan(id: string) {
  return apiClient.get<LearningPlan>(`/learning-plans/${id}`);
}

// 更新学习方案
async function updateLearningPlan(id: string, data: { title?: string; plan_data?: object }) {
  return apiClient.put<LearningPlan>(`/learning-plans/${id}`, data);
}

// 删除学习方案
async function deleteLearningPlan(id: string) {
  return apiClient.delete(`/learning-plans/${id}`);
}

interface LearningPlan {
  id: string;
  user_id: string;
  career_goal_id: string;
  title: string;
  plan_data: object | null;
  status: string;
  created_at: string;
  updated_at: string;
}
```

### 4.4 打卡模块

```typescript
// 创建打卡
async function createCheckIn(data: {
  duration_minutes: number;
  note?: string;
}) {
  return apiClient.post<CheckIn>('/check-ins/', data);
}

// 获取打卡列表
async function getCheckIns() {
  return apiClient.get<CheckIn[]>('/check-ins/');
}

// 获取打卡详情
async function getCheckIn(id: string) {
  return apiClient.get<CheckIn>(`/check-ins/${id}`);
}

// 更新打卡
async function updateCheckIn(id: string, data: { duration_minutes?: number; note?: string }) {
  return apiClient.put<CheckIn>(`/check-ins/${id}`, data);
}

interface CheckIn {
  id: string;
  user_id: string;
  duration_minutes: number;
  note: string;
  check_in_date: string;
  created_at: string;
}
```

### 4.5 练习题模块

```typescript
// AI生成练习题
async function generateExercises(data: {
  plan_id?: string;
  topic: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}) {
  return apiClient.post<Exercise[]>('/exercises/generate', data);
}

// 获取练习列表
async function getExercises() {
  return apiClient.get<Exercise[]>('/exercises/');
}

// 获取练习详情
async function getExercise(id: string) {
  return apiClient.get<Exercise>(`/exercises/${id}`);
}

// 提交练习答案
async function submitExercise(id: string, data: { answer: string }) {
  return apiClient.post<Exercise>(`/exercises/${id}/submit`, data);
}

// AI批改练习 (教师)
async function gradeExercise(id: string) {
  return apiClient.post<Exercise>(`/exercises/${id}/grade`, {});
}

interface Exercise {
  id: string;
  plan_id: string;
  topic: string;
  content: string;
  type: 'single_choice' | 'multi_choice' | 'short_answer';
  answer: string;
  options: string[];
  difficulty: string;
  result: {
    score: number;
    feedback: string;
    grade_level: string;
  } | null;
  student_id: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### 4.6 课程模块

```typescript
// 创建课程 (教师)
async function createCourse(data: {
  title: string;
  description?: string;
  cover_image?: string;
}) {
  return apiClient.post<Course>('/courses/', data);
}

// 获取课程列表
async function getCourses() {
  return apiClient.get<Course[]>('/courses/');
}

// 获取课程详情
async function getCourse(id: string) {
  return apiClient.get<Course>(`/courses/${id}`);
}

// 更新课程 (教师)
async function updateCourse(id: string, data: {
  title?: string;
  description?: string;
  cover_image?: string;
}) {
  return apiClient.put<Course>(`/courses/${id}`, data);
}

// 删除课程 (教师)
async function deleteCourse(id: string) {
  return apiClient.delete(`/courses/${id}`);
}

// 学生报名课程
async function enrollCourse(id: string) {
  return apiClient.post<Enrollment>(`/courses/${id}/enroll`, {});
}

// 查看已报名学生 (教师)
async function getCourseStudents(id: string) {
  return apiClient.get<Enrollment[]>(`/courses/${id}/students`);
}

// 绑定课程到班级 (教师)
async function bindCourseToClass(courseId: string, classId: string) {
  return apiClient.post<ClassBinding>(`/courses/${courseId}/classes`, { class_id: classId });
}

// 解绑课程与班级 (教师)
async function unbindCourseFromClass(courseId: string, classId: string) {
  return apiClient.delete(`/courses/${courseId}/classes/${classId}`);
}

// 获取课程绑定的班级列表
async function getCourseClasses(courseId: string) {
  return apiClient.get<Class[]>(`/courses/${courseId}/classes`);
}

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  teacher_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  status: string;
}
```

### 4.7 班级模块

```typescript
// 创建班级 (教师)
async function createClass(data: {
  name: string;
  description?: string;
}) {
  return apiClient.post<Class>('/classes', data);
}

// 获取班级列表
async function getClasses() {
  return apiClient.get<Class[]>('/classes');
}

// 获取班级详情
async function getClassDetail(id: string) {
  return apiClient.get<Class>(`/classes/${id}`);
}

// 获取班级邀请码 (教师)
async function getInviteCode(classId: string) {
  return apiClient.get<InviteCodeResponse>(`/classes/${classId}/invite-code`);
}

// 加入班级 (学生)
async function joinClass(data: { invite_code: string }) {
  return apiClient.post('/classes/join', data);
}

// 获取已加入的班级 (学生)
async function getMyClasses() {
  return apiClient.get<Class[]>('/classes/my');
}

// 获取班级课程列表
async function getClassCourses(classId: string) {
  return apiClient.get<Course[]>(`/classes/${classId}/courses`);
}

interface Class {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  invite_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InviteCodeResponse {
  invite_code: string;
  class_id: string;
  class_name: string;
}
```

### 4.8 作业管理模块

```typescript
// 布置作业 (教师)
async function createHomework(data: {
  course_id: string;
  title: string;
  description?: string;
  deadline?: string;
  max_score?: number;
}) {
  return apiClient.post<Homework>('/homework/', data);
}

// 获取作业列表
async function getHomework() {
  return apiClient.get<Homework[]>('/homework/');
}

// 获取作业详情
async function getHomeworkDetail(id: string) {
  return apiClient.get<Homework>(`/homework/${id}`);
}

// 更新作业 (教师)
async function updateHomework(id: string, data: {
  title?: string;
  description?: string;
  deadline?: string;
  max_score?: number;
}) {
  return apiClient.put<Homework>(`/homework/${id}`, data);
}

// 删除作业 (教师)
async function deleteHomework(id: string) {
  return apiClient.delete(`/homework/${id}`);
}

// 学生提交作业
async function submitHomework(id: string, data: { content: string }) {
  return apiClient.post<HomeworkSubmission>(`/homework/${id}/submit`, data);
}

// 查看作业提交 (教师)
async function getHomeworkSubmissions(id: string) {
  return apiClient.get<HomeworkSubmission[]>(`/homework/${id}/submissions`);
}

// 查看我的提交 (学生)
async function getMySubmissions() {
  return apiClient.get<HomeworkSubmission[]>('/homework/submissions/mine');
}

// 批改作业 (教师)
async function gradeHomework(submissionId: string, data: {
  score: number;
  feedback?: string;
  status: 'graded';
}) {
  return apiClient.put<HomeworkSubmission>(`/homework/submissions/${submissionId}`, data);
}

interface Homework {
  id: string;
  title: string;
  description: string;
  course_id: string;
  deadline: string;
  max_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
}
```

### 4.9 统计分析模块

```typescript
// 获取学生进度
async function getStudentProgress(studentId: string) {
  return apiClient.get<StudentProgress>(`/analytics/student/${studentId}/progress`);
}

// AI学习分析
async function getStudentStats(studentId: string) {
  return apiClient.get<StudentStats>(`/analytics/student/${studentId}/stats`);
}

// 获取班级统计 (教师)
async function getClassStats(teacherId: string) {
  return apiClient.get<ClassStats>(`/analytics/teacher/${teacherId}/class-stats`);
}

// 获取作业统计 (教师)
async function getAssignmentStats(teacherId: string) {
  return apiClient.get<AssignmentStats>(`/analytics/teacher/${teacherId}/assignment-stats`);
}

interface StudentProgress {
  total_study_time: number;      // 总学习时长(分钟)
  total_exercises: number;       // 总练习数
  completed_exercises: number;   // 已完成练习数
  total_assignments: number;     // 总作业数
  completed_assignments: number; // 已完成作业数
  average_score: number | null; // 平均分
  current_streak: number;       // 当前连续天数
}

interface StudentStats {
  total_study_time: number;           // 总学习时长(小时)
  exercise_accuracy: number;           // 练习正确率(%)
  strengths: string[];                // 擅长领域
  weaknesses: string[];                // 薄弱领域
  recent_performance: {                // 最近表现
    date: string;
    score: number;
  }[];
}

interface ClassStats {
  total_students: number;
  average_completion_rate: number;
  average_score: number;
  top_performers: {
    student_id: string;
    name: string;
    completion_rate: number;
    average_score: number;
  }[];
  struggling_students: {
    student_id: string;
    name: string;
    completion_rate: number;
    average_score: number;
    reason: string;
  }[];
}

interface AssignmentStats {
  total_submissions: number;
  graded_submissions: number;
  average_score: number;
  score_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}
```

---

## 5. 角色权限说明

### 5.1 角色类型

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| student | 学生 | 创建学习方案、打卡、提交作业、查看个人数据 |
| teacher | 教师 | 创建课程、布置作业、批改、查看班级统计 |
| admin | 管理员 | 所有权限 |

### 5.2 前端路由权限控制

```typescript
// 路由权限配置
const routePermissions = {
  '/dashboard': ['student', 'teacher', 'admin'],
  '/learning-plans': ['student', 'admin'],
  '/courses/create': ['teacher', 'admin'],
  '/courses': ['student', 'teacher', 'admin'],
  '/homework/grade': ['teacher', 'admin'],
  '/analytics/class': ['teacher', 'admin'],
  '/admin': ['admin'],
};

// 权限检查
function hasPermission(path: string, userRole: string): boolean {
  const allowedRoles = routePermissions[path];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

// React Router 守卫示例
function ProtectedRoute({ children, requiredRoles }: { 
  children: React.ReactNode;
  requiredRoles: string[];
}) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

---

## 6. 错误处理

### 6.1 错误响应格式

```typescript
interface ApiError {
  detail: string | {
    type: string;
    loc: string[];
    msg: string;
    input: any;
  }[];
}
```

### 6.2 HTTP状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理响应 |
| 201 | 创建成功 | 正常处理响应 |
| 400 | 错误请求 | 显示错误信息 |
| 401 | 未认证 | 尝试刷新Token或跳转登录 |
| 403 | 权限不足 | 显示权限提示 |
| 404 | 资源不存在 | 显示404页面 |
| 422 | 验证错误 | 显示具体字段错误 |
| 500 | 服务器错误 | 显示通用错误提示 |

### 6.3 错误处理示例

```typescript
// React Error Boundary 示例
class ApiErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-container">
          <h2>出错了</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// API调用错误处理
async function safeApiCall<T>(apiCall: () => Promise<T>, fallback: T) {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API Error:', error);
    toast.error(error.message || '操作失败');
    return fallback;
  }
}
```

---

## 7. CORS配置

### 7.1 后端CORS配置

后端已配置允许以下来源:

```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "http://localhost:3000",  # 开发环境
    "http://localhost:8080",
    "https://aigcstudy.com",   # 生产环境
]
```

### 7.2 前端开发服务器代理配置

**Vite 配置 (vite.config.ts)**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:38000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 8. 数据模型

### 8.1 用户 (User)

```typescript
interface User {
  id: string;           // UUID
  username: string;     // 用户名
  email: string;        // 邮箱
  role: 'student' | 'teacher' | 'admin';
  status: string;       // 账号状态
  created_at: string;   // 创建时间
  updated_at: string;   // 更新时间
}
```

### 8.2 UUID格式

所有ID字段使用UUID v4格式:

```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

例如: `0860d562-a2e9-4c86-93c8-6a7ce27e3401`

### 8.3 日期时间格式

所有日期时间使用ISO 8601格式:

```
2026-05-08T14:30:00.000000
```

---

## 9. WebSocket连接

### 9.1 实时通知 (待实现)

```typescript
// WebSocket连接配置
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:38000/ws';

// 连接管理
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'homework_submitted':
        // 处理作业提交通知
        break;
      case 'homework_graded':
        // 处理作业批改通知
        break;
      case 'course_enrolled':
        // 处理课程报名通知
        break;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
```

---

## 附录：A. 快速开发模板

### React + TypeScript 项目结构

```
src/
├── api/
│   ├── client.ts       # API客户端
│   ├── auth.ts         # 认证相关API
│   ├── users.ts        # 用户相关API
│   ├── courses.ts      # 课程相关API
│   ├── homework.ts     # 作业相关API
│   └── analytics.ts    # 统计分析API
├── components/
│   ├── common/         # 通用组件
│   ├── auth/           # 认证组件
│   ├── courses/        # 课程组件
│   └── homework/        # 作业组件
├── hooks/
│   ├── useAuth.ts      # 认证Hook
│   ├── useApi.ts       # API调用Hook
│   └── usePermission.ts # 权限Hook
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Courses.tsx
│   └── Homework.tsx
├── types/
│   └── index.ts        # TypeScript类型定义
└── App.tsx
```

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-08 | 初始版本 | |
