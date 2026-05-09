import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  if (user) {
    const path = user.role === 'student' ? '/student' : '/teacher';
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
}
