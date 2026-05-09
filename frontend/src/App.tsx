import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { GuestGuard } from '@/components/GuestGuard';
import { ToastProvider } from '@/components/ui';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RootLoginPage } from '@/pages/RootLoginPage';
import { HomePage } from '@/pages/HomePage';
import { PlansPage } from '@/pages/PlansPage';
import { ExercisesPage } from '@/pages/ExercisesPage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { CheckinsPage } from '@/pages/CheckinsPage';
import { CareersPage } from '@/pages/CareersPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { StudentClassesPage } from '@/pages/StudentClassesPage';
import { StudentLayout } from '@/components/StudentLayout';
import { TeacherLayout } from '@/components/TeacherLayout';
import { StudentDashboard } from '@/components/StudentDashboard';
import { TeacherControlCenter } from '@/components/TeacherControlCenter';
import { TeacherHomePage } from '@/pages/TeacherHomePage';
import { TeacherAssignmentsPage } from '@/pages/TeacherAssignmentsPage';
import { TeacherCoursesPage } from '@/pages/TeacherCoursesPage';
import { TeacherLessonPlanPage } from '@/pages/TeacherLessonPlanPage';
import { TeacherResourcesPage } from '@/pages/TeacherResourcesPage';
import { TeacherTicketsPage } from '@/pages/TeacherTicketsPage';
import { TeacherAnalyticsPage } from '@/pages/TeacherAnalyticsPage';
import type { User } from '@/types';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

function createMockUser(role: 'student' | 'teacher'): User {
  return {
    id: `mock-${role}`,
    username: role === 'student' ? 'Student User' : 'Teacher User',
    email: `${role}@example.com`,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function AuthLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockRole = localStorage.getItem('mock_role') as 'student' | 'teacher' | null;
    if (mockRole) {
      setUser(createMockUser(mockRole));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <RootLoginPage />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const mockRole = localStorage.getItem('mock_role') as 'student' | 'teacher' | null;
  if (mockRole === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (mockRole === 'teacher') {
    return <Navigate to="/teacher/home" replace />;
  }
  return <RootLoginPage />;
}

function StudentRoutes() {
  return (
    <StudentLayout>
      <Outlet />
    </StudentLayout>
  );
}

function TeacherRoutes() {
  return (
    <TeacherLayout>
      <Outlet />
    </TeacherLayout>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'student/*',
        element: <StudentRoutes />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: 'dashboard', element: <StudentDashboard /> },
          { path: 'home', element: <HomePage /> },
          { path: 'careers', element: <CareersPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'courses', element: <CoursesPage /> },
          { path: 'exercises', element: <ExercisesPage /> },
          { path: 'assignments', element: <AssignmentsPage /> },
          { path: 'checkins', element: <CheckinsPage /> },
          { path: 'classes', element: <StudentClassesPage /> },
        ],
      },
      {
        path: 'teacher/*',
        element: <TeacherRoutes />,
        children: [
          { index: true, element: <TeacherHomePage /> },
          { path: 'home', element: <TeacherHomePage /> },
          { path: 'courses', element: <TeacherCoursesPage /> },
          { path: 'lesson-plans', element: <TeacherLessonPlanPage /> },
          { path: 'resources', element: <TeacherResourcesPage /> },
          { path: 'homework', element: <TeacherAssignmentsPage /> },
          { path: 'tickets', element: <TeacherTicketsPage /> },
          { path: 'students', element: <TeacherControlCenter /> },
          { path: 'analytics', element: <TeacherAnalyticsPage /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;