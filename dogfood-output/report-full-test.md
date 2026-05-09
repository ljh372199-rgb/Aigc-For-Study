# Dogfood Test Report - AIGC Learning Platform Full Test

**Date:** 2026-05-09
**Tester:** SOLO AI Agent
**Session:** aigc-full-test
**Target URL:** http://localhost:5174

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 1 |
| Medium | 2 |
| Low | 1 |

## Test Results

### ✅ Passed Tests

1. **Login Page** - Login form displays correctly, accepts email/password
2. **Login Functionality** - Successfully logs in with test credentials (testdev2026@example.com / test123456)
3. **Dashboard Display** - Shows welcome message, learning path, progress stats
4. **User Menu** - Shows user avatar and name correctly
5. **Quick Actions** - Continue Learning, Start Practice, Do Homework, Set Goals buttons visible

### ❌ Issues Found

---

### ISSUE-001: Navigation Links All Point to Root "/" (Critical)

**Severity:** Critical
**Type:** Navigation / UX Bug

**Description:** All navigation menu links (首页, 学习方案, 练习中心, 作业, 打卡) point to "/" instead of their respective routes.

**Location:** `frontend/src/components/StudentLayout.tsx` line 43

**Current Code:**
```tsx
{['首页', '学习方案', '练习中心', '作业', '打卡'].map((item) => (
  <Link key={item} to="/" className="...">
    {item}
  </Link>
))}
```

**Expected:** Each link should point to its correct route:
- 首页 -> /student
- 学习方案 -> /student/plans
- 练习中心 -> /student/exercises
- 作业 -> /student/assignments
- 打卡 -> /student/checkins

**Reproduction:**
1. Login to the platform
2. Observe the navigation menu links
3. Click any navigation link (e.g., "学习方案")
4. Page remains on the same "/" route

**Screenshots:**
- [03-dashboard-annotated.png](screenshots/03-dashboard-annotated.png) - Shows all navigation links

**Fix Required:**
```tsx
const navItems = [
  { label: '首页', path: '/student' },
  { label: '学习方案', path: '/student/plans' },
  { label: '练习中心', path: '/student/exercises' },
  { label: '作业', path: '/student/assignments' },
  { label: '打卡', path: '/student/checkins' },
];

{navItems.map((item) => (
  <Link key={item.label} to={item.path} className="...">
    {item.label}
  </Link>
))}
```

---

### ISSUE-002: Mock Data Still Displayed in Dashboard (High)

**Severity:** High
**Type:** Data Integration

**Description:** Dashboard shows hardcoded mock data instead of real data from API:
- "Python 机器学习工程师" is hardcoded learning path
- "0%" progress is shown
- "0 天" streak is shown
- Recent activities show "暂无最近活动"

**Expected:** Dashboard should fetch and display real data from the backend API:
- GET /api/v1/analytics/students/me - Student statistics
- GET /api/v1/learning-plans/ - Learning plans
- GET /api/v1/check-ins/ - Check-in records

**Screenshots:**
- [03-dashboard-annotated.png](screenshots/03-dashboard-annotated.png) - Shows mock data

**Fix Required:** Implement data fetching in StudentDashboard component using the api client.

---

### ISSUE-003: Quick Action Buttons Non-functional (Medium)

**Severity:** Medium
**Type:** UX / Broken Links

**Description:** The quick action buttons on the dashboard don't navigate to their respective pages:
- "继续学习" button
- "开始练习" button
- "做作业" button
- "设定目标" button

These buttons are visible but clicking them doesn't navigate to the corresponding pages due to the navigation bug (ISSUE-001).

**Reproduction:**
1. Login to the platform
2. Click "开始练习" button
3. Page doesn't navigate to exercises page

**Screenshots:**
- [03-dashboard-annotated.png](screenshots/03-dashboard-annotated.png) - Shows quick action buttons

---

### ISSUE-004: No Loading State Indication (Medium)

**Severity:** Medium
**Type:** UX

**Description:** When the page is loading data, there's no visible loading indicator while the API calls are being made. The loading state is only briefly visible.

**Expected:** A loading spinner or skeleton should be displayed while fetching dashboard data.

**Location:** `frontend/src/components/StudentDashboard.tsx` - loading state handling

---

### ISSUE-005: User Name Shows "Student User" Instead of Real Username (Low)

**Severity:** Low
**Type:** Data Display

**Description:** The user menu shows "Student User" instead of the actual logged-in user's name.

**Expected:** Should display the actual username from the API response.

**Current Display:** "S Student User 学生"
**Expected Display:** Should show the real username from the login response.

---

## API Verification

All backend APIs verified working via curl:

```bash
# Login API - Working
curl -X POST http://localhost:38000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testdev2026@example.com&password=test123456"

# Analytics API - Response available
curl -X GET http://localhost:38000/api/v1/analytics/students/me \
  -H "Authorization: Bearer <token>"
```

---

## Test Screenshots

| Screenshot | Description |
|------------|-------------|
| [01-login-page-annotated.png](screenshots/01-login-page-annotated.png) | Login page with form elements |
| [02-after-login.png](screenshots/02-after-login.png) | After successful login |
| [03-dashboard-annotated.png](screenshots/03-dashboard-annotated.png) | Dashboard with navigation issue |
| [04-plans-page.png](screenshots/04-plans-page.png) | Plans page (shows same as dashboard due to nav bug) |

---

## Recommendations

1. **Immediate Fix (Critical):** Update navigation links in StudentLayout.tsx to use correct routes
2. **High Priority:** Implement data fetching in StudentDashboard to replace mock data
3. **Medium Priority:** Add proper loading states and error handling
4. **Low Priority:** Fix user name display to show actual username

## Conclusion

The basic login flow works correctly. However, there are significant navigation and data integration issues that prevent users from accessing the core features of the application. The most critical issue is the broken navigation, which makes all menu items non-functional.
