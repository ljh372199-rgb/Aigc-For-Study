import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, Settings, LogOut, Search, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Aigc For Study</span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {[
                  { label: '首页', path: '/student' },
                  { label: '职业规划', path: '/student/careers' },
                  { label: '学习方案', path: '/student/plans' },
                  { label: '课程中心', path: '/student/courses' },
                  { label: '练习中心', path: '/student/exercises' },
                  { label: '作业', path: '/student/assignments' },
                  { label: '打卡', path: '/student/checkins' },
                  { label: '我的班级', path: '/student/classes' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden sm:block relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="w-64 pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400/50 transition-all"
                />
              </form>

              <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <MessageSquare className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Settings className="h-5 w-5 text-slate-600" />
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-sm font-semibold text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-slate-900">{user.username}</div>
                      <div className="text-xs text-slate-500">学生</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden z-50">
                        <div className="p-3 border-b border-slate-100">
                          <div className="text-sm font-semibold text-slate-900">{user.username}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <User className="h-4 w-4" />
                            个人中心
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            退出登录
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
