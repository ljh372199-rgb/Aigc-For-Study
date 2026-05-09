import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import { TeacherCareerAdvicePage } from '@/pages/TeacherCareerAdvicePage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <RootLoginPage />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/home'} replace />;
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="student/*" element={<StudentRoutes />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="home" element={<HomePage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="checkins" element={<CheckinsPage />} />
          <Route path="classes" element={<StudentClassesPage />} />
        </Route>
        <Route path="teacher/*" element={<TeacherRoutes />}>
          <Route index element={<TeacherHomePage />} />
          <Route path="home" element={<TeacherHomePage />} />
          <Route path="courses" element={<TeacherCoursesPage />} />
          <Route path="lesson-plans" element={<TeacherLessonPlanPage />} />
          <Route path="resources" element={<TeacherResourcesPage />} />
          <Route path="homework" element={<TeacherAssignmentsPage />} />
          <Route path="tickets" element={<TeacherTicketsPage />} />
          <Route path="students" element={<TeacherControlCenter />} />
          <Route path="analytics" element={<TeacherAnalyticsPage />} />
          <Route path="career-advice" element={<TeacherCareerAdvicePage />} />
        </Route>
      </Route>
      <Route
        path="/login"
        element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        }
      />
      <Route
        path="/register"
        element={
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
