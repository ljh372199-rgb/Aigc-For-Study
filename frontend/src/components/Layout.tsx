import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Target, PenTool, FileText, Calendar, User, LogOut, Menu, X, LogIn, UserPlus, MessageSquare, Settings, Search, BarChart3, ClipboardList, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { HomePage } from '@/pages/HomePage';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'teacher';

  const studentNavItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/career-select', icon: Target, label: '职业选择' },
    { path: '/plans', icon: BookOpen, label: '学习方案' },
    { path: '/exercises', icon: PenTool, label: '练习中心' },
    { path: '/assignments', icon: FileText, label: '作业' },
    { path: '/checkins', icon: Calendar, label: '打卡' },
    { path: '/profile', icon: User, label: '个人中心' },
  ];

  const teacherNavItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/teacher/assignments', icon: ClipboardList, label: '作业管理' },
    { path: '/teacher/students', icon: GraduationCap, label: '学生管理' },
    { path: '/teacher/statistics', icon: BarChart3, label: '数据统计' },
    { path: '/profile', icon: User, label: '个人中心' },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Aigc For Study</span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:flex relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>

              {/* User Info / Login */}
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>登录</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>注册</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-slate-900">{user.username}</div>
                      <div className="text-xs text-slate-500">{user.role === 'teacher' ? '教师' : '学生'}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-50 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)]">
          {/* Role Badge */}
          {user && (
            <div className="p-4 border-b border-slate-200">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isTeacher ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600'
              }`}>
                {isTeacher ? <GraduationCap className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                {isTeacher ? '教师' : '学生'}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          {user && (
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">退出登录</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-50 md:hidden overflow-y-auto">
            {user && (
              <div className="p-4 border-b border-slate-200">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isTeacher ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600'
                }`}>
                  {isTeacher ? <GraduationCap className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  {isTeacher ? '教师' : '学生'}
                </div>
              </div>
            )}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            {user && (
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">退出登录</span>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-64px)] md:ml-64">
          <div className="p-6 sm:p-8">
            <HomePage />
          </div>
        </main>
      </div>
    </div>
  );
}