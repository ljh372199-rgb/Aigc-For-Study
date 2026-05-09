# Frontend Development Agent Prompt for Aigc For Study

## Project Overview

Aigc For Study is an AI-powered online learning platform with the following features:
- User authentication (students and teachers)
- Course management and enrollment
- AI-generated exercises and homework
- AI-powered learning analytics
- Study check-in tracking
- Learning plan management

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Backend API**: FastAPI (Python)
- **API Base URL**: `http://localhost:38000/api/v1`
- **API Version**: v1

## Important Notes for Frontend Development

### 1. Authentication

**CRITICAL**: Login endpoint uses `application/x-www-form-urlencoded` format, NOT JSON!

```typescript
// ✅ CORRECT - Form data
const formData = new URLSearchParams();
formData.append('username', username);
formData.append('password', password);
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData.toString(),
});

// ❌ WRONG - JSON
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});
```

**Register endpoint**: Uses JSON format.

**Token Storage**: Store tokens in localStorage:
```typescript
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

**Token Usage**: All authenticated requests must include:
```
Authorization: Bearer {access_token}
```

---

## API Endpoints Reference

### Base URL
```
Development: http://localhost:38000/api/v1
```

### 1. Authentication (Auth)

| Method | Endpoint | Auth | Description | Request Format |
|--------|----------|------|-------------|----------------|
| POST | /auth/register | No | Register user | JSON |
| POST | /auth/login | No | Login user | **form-data** |
| POST | /auth/refresh | Yes | Refresh token | JSON |

**Register Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "teacher"
}
```

**Register Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "student" | "teacher",
  "status": "active",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Login Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "jwt_token",
  "token_type": "bearer"
}
```

---

### 2. User Management (Users)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /users/me | Yes | Any | Get current user |
| PUT | /users/me | Yes | Any | Update current user |
| PUT | /users/me/profile | Yes | Any | Update profile |
| GET | /users/{user_id} | Yes | teacher/admin | Get user by ID |
| GET | /users/ | Yes | admin | List all users |

**User Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "student" | "teacher" | "admin",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### 3. Career Goals (Careers)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /careers/ | Yes | List all careers |
| GET | /careers/{id} | Yes | Get career detail |
| POST | /careers/ | Yes (admin) | Create career |

**Career Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "skills_required": ["string"],
  "created_at": "datetime"
}
```

---

### 4. Learning Plans (Learning Plans)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /learning-plans/ | Yes | student | Create plan |
| GET | /learning-plans/ | Yes | Any | List plans |
| GET | /learning-plans/{id} | Yes | Any | Get plan detail |
| PUT | /learning-plans/{id} | Yes | owner | Update plan |
| DELETE | /learning-plans/{id} | Yes | owner | Delete plan |

**Create Learning Plan Request:**
```json
{
  "career_goal_id": "uuid",
  "title": "string"
}
```

**Learning Plan Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "career_goal_id": "uuid",
  "title": "string",
  "plan_data": {} | null,
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### 5. Check-ins (Check-ins)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /check-ins/ | Yes | student | Create check-in |
| GET | /check-ins/ | Yes | Any | List check-ins |
| GET | /check-ins/{id} | Yes | Any | Get check-in detail |
| PUT | /check-ins/{id} | Yes | owner | Update check-in |

**Create Check-in Request:**
```json
{
  "duration_minutes": 120,
  "note": "string"
}
```

**Check-in Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "duration_minutes": 120,
  "note": "string",
  "check_in_date": "date",
  "created_at": "datetime"
}
```

---

### 6. Exercises (Exercises) - AI Features

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /exercises/generate | Yes | student | AI generate exercises |
| GET | /exercises/ | Yes | Any | List exercises |
| GET | /exercises/{id} | Yes | Any | Get exercise detail |
| POST | /exercises/{id}/submit | Yes | student | Submit answer |
| POST | /exercises/{id}/grade | Yes | teacher | AI grade exercise |

**AI Generate Exercises Request:**
```json
{
  "plan_id": "uuid" | null,
  "topic": "string",
  "count": 5,
  "difficulty": "easy" | "medium" | "hard"
}
```

**Exercise Response:**
```json
{
  "id": "uuid",
  "plan_id": "uuid",
  "topic": "string",
  "content": "string (question content)",
  "type": "single_choice" | "multi_choice" | "short_answer",
  "answer": "string",
  "options": ["string"],
  "difficulty": "string",
  "result": {
    "score": 85,
    "feedback": "string",
    "grade_level": "A"
  } | null,
  "student_id": "uuid",
  "submitted_at": "datetime" | null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### 7. Courses (Courses)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /courses/ | Yes | teacher | Create course |
| GET | /courses/ | Yes | Any | List courses |
| GET | /courses/{id} | Yes | Any | Get course detail |
| PUT | /courses/{id} | Yes | teacher | Update course |
| DELETE | /courses/{id} | Yes | teacher | Delete course |
| POST | /courses/{id}/enroll | Yes | student | Enroll in course |
| GET | /courses/{id}/students | Yes | teacher | List enrolled students |
| POST | /courses/{id}/classes | Yes | teacher | Bind course to class |
| DELETE | /courses/{id}/classes/{class_id} | Yes | teacher | Unbind course from class |
| GET | /courses/{id}/classes | Yes | Any | Get course bound classes |

**Create Course Request:**
```json
{
  "title": "string",
  "description": "string",
  "cover_image": "string"
}
```

**Course Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "cover_image": "string" | null,
  "teacher_id": "uuid",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Enrollment Response:**
```json
{
  "id": "uuid",
  "course_id": "uuid",
  "student_id": "uuid",
  "enrollment_date": "datetime",
  "status": "string"
}
```

---

### 8. Classes (Classes)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /classes | Yes | teacher | Create class with invite code |
| GET | /classes | Yes | Any | List classes |
| GET | /classes/my | Yes | Any | Get my classes |
| GET | /classes/{id} | Yes | Any | Get class detail |
| GET | /classes/{id}/invite-code | Yes | teacher | Get invite code |
| POST | /classes/join | Yes | student | Join class with invite code |
| GET | /classes/{id}/courses | Yes | Any | Get class courses |

**Create Class Request:**
```json
{
  "name": "Python Programming Class",
  "description": "Learn Python basics"
}
```

**Class Response:**
```json
{
  "id": "uuid",
  "name": "Python Programming Class",
  "description": "Learn Python basics",
  "teacher_id": "uuid",
  "invite_code": "ABC12345",
  "status": "active",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Join Class Request:**
```json
{
  "invite_code": "ABC12345"
}
```

**Invite Code Response:**
```json
{
  "invite_code": "ABC12345",
  "class_id": "uuid",
  "class_name": "Python Programming Class"
}
```

---

### 9. Homework (Homework)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /homework/ | Yes | teacher | Create homework |
| GET | /homework/ | Yes | Any | List homework |
| GET | /homework/{id} | Yes | Any | Get homework detail |
| PUT | /homework/{id} | Yes | teacher | Update homework |
| DELETE | /homework/{id} | Yes | teacher | Delete homework |
| POST | /homework/{id}/submit | Yes | student | Submit homework |
| GET | /homework/{id}/submissions | Yes | teacher | List submissions |
| GET | /homework/submissions/mine | Yes | student | My submissions |
| PUT | /homework/submissions/{id} | Yes | teacher | Grade homework |

**Create Homework Request:**
```json
{
  "course_id": "uuid",
  "title": "string",
  "description": "string",
  "deadline": "datetime",
  "max_score": 100.0
}
```

**Homework Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "course_id": "uuid",
  "deadline": "datetime",
  "max_score": 100.0,
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Homework Submission Response:**
```json
{
  "id": "uuid",
  "homework_id": "uuid",
  "student_id": "uuid",
  "content": "string",
  "submitted_at": "datetime",
  "score": 85.0 | null,
  "feedback": "string" | null,
  "status": "submitted" | "graded"
}
```

---

### 10. Analytics (Analytics)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /analytics/student/{id}/progress | Yes | Any | Get student progress |
| GET | /analytics/student/{id}/stats | Yes | Any | AI learning analytics |
| GET | /analytics/teacher/{id}/class-stats | Yes | teacher | Class statistics |
| GET | /analytics/teacher/{id}/assignment-stats | Yes | teacher | Assignment statistics |

**Student Progress Response:**
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

**AI Learning Analytics Response:**
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

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Process response |
| 400 | Bad Request | Show error message |
| 401 | Unauthorized | Refresh token or redirect to login |
| 403 | Forbidden | Show permission denied |
| 404 | Not Found | Show 404 page |
| 422 | Validation Error | Show field-specific errors |
| 500 | Server Error | Show generic error |

### Error Response Format
```json
{
  "detail": "Error message" | [
    {
      "type": "missing",
      "loc": ["body", "field"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

---

## Role-Based Access Control

| Feature | student | teacher | admin |
|---------|---------|---------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| View own data | ✅ | ✅ | ✅ |
| Create learning plans | ✅ | ❌ | ✅ |
| Create check-ins | ✅ | ❌ | ✅ |
| Submit exercises/homework | ✅ | ❌ | ✅ |
| Create courses | ❌ | ✅ | ✅ |
| Create assignments | ❌ | ✅ | ✅ |
| Grade submissions | ❌ | ✅ | ✅ |
| View class stats | ❌ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |

---

## Data Formats

### UUID Format
All IDs use UUID v4: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### DateTime Format
ISO 8601: `2026-05-08T14:30:00.000000`

### ID Parameters
When the API path contains `{id}`, `{user_id}`, `{course_id}`, etc., replace with actual UUID.

---

## Frontend Implementation Guidelines

### 1. API Client Setup

```typescript
// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:38000/api/v1';

class ApiClient {
  private getHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async post<T>(endpoint: string, data?: object): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(res);
  }

  async put<T>(endpoint: string, data?: object): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(res);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      // Try refresh or redirect to login
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error' }));
      throw new Error(err.detail);
    }
    return res.json();
  }
}

export const api = new ApiClient();
```

### 2. Login Implementation (FORM-DATA!)

```typescript
async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }
  throw new Error('Login failed');
}
```

### 3. Protected Route Example (React)

```typescript
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Usage
<ProtectedRoute roles={['teacher', 'admin']}>
  <TeacherDashboard />
</ProtectedRoute>
```

---

## Important Reminders

1. **LOGIN USES FORM-DATA**: `application/x-www-form-urlencoded`, NOT JSON
2. **Store tokens in localStorage**: `access_token` and `refresh_token`
3. **Include Authorization header**: `Bearer {token}` for authenticated requests
4. **All IDs are UUIDs**: Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
5. **DateTime is ISO 8601**: Format: `2026-05-08T14:30:00.000000`
6. **Role-based UI**: Show/hide features based on user role

---

## Vite Configuration

```typescript
// vite.config.ts
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

## Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:38000/api/v1
VITE_APP_NAME=Aigc For Study
VITE_APP_ENV=development
```

---

## Quick Start Checklist

- [ ] Set up API client with Bearer token auth
- [ ] Implement login with form-data format
- [ ] Create auth context for user state
- [ ] Add protected route component
- [ ] Implement role-based UI rendering
- [ ] Add error handling for all API calls
- [ ] Handle 401 (refresh token or logout)
- [ ] Test with backend at http://localhost:38000

---

## Support Files

Refer to these documentation files in the `/docs` folder:
- `API_REFERENCE.md` - Complete API endpoint reference
- `API_TEST_COMPLETE.md` - API test data examples
- `AI_API_TEST.md` - AI feature API documentation
- `FRONTEND_INTEGRATION_GUIDE.md` - Detailed frontend guide
