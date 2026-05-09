import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Home, BarChart3, Settings, 
  Search, Bell, ChevronLeft, ChevronRight, LogOut, User, GraduationCap, ClipboardList,
  FileText, FolderOpen, Ticket
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/teacher/home', icon: Home, label: '首页' },
  { path: '/teacher/courses', icon: BookOpen, label: '课程管理' },
  { path: '/teacher/lesson-plans', icon: FileText, label: '教案设计' },
  { path: '/teacher/resources', icon: FolderOpen, label: '资源管理' },
  { path: '/teacher/homework', icon: ClipboardList, label: '作业管理' },
  { path: '/teacher/tickets', icon: Ticket, label: '工单管理' },
  { path: '/teacher/students', icon: GraduationCap, label: '学生管理' },
  { path: '/teacher/analytics', icon: BarChart3, label: '数据统计' },
];

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link to="/teacher/home" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-zinc-900 hidden sm:block">Aigc For Study</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索课程、学生、作业..."
                className="w-full pl-11 pr-4 py-2.5 bg-zinc-100/80 border border-transparent rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2.5 hover:bg-zinc-100 rounded-xl transition-colors">
              <Bell className="h-5 w-5 text-zinc-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors">
              <Settings className="h-5 w-5 text-zinc-600" />
            </button>
            
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-zinc-200">
              <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center">
                <User className="h-5 w-5 text-zinc-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-zinc-900">{user?.username || '教师'}</div>
                <div className="text-xs text-zinc-500">教师账号</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <aside 
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-zinc-200/60 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all group ${
                  sidebarCollapsed ? 'justify-center px-3' : ''
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                <span
                  className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-zinc-100">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">收起</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      <main 
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}