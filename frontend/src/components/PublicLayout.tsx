import { Link, Outlet } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function PublicLayout() {
  const { user } = useAuth();

  if (user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] ink-brush">
      <nav className="glass-strong sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl ceramic-button flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-slate-700" />
                </div>
                <span className="text-xl font-bold text-slate-900 hidden sm:block">Aigc For Study</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 rounded-xl transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>登录</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium ceramic-button text-slate-900 rounded-xl transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>注册</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}