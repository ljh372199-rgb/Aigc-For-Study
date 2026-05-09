import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Bell, FileText, Server, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Activity, label: 'Monitor', path: '/monitor' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: FileText, label: 'Logs', path: '/logs' },
  { icon: Server, label: 'Services', path: '/services' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[220px] h-screen bg-[#1d1d1f] flex flex-col">
      <div className="h-14 flex items-center px-md border-b border-[#3d3d3f]">
        <h1 className="text-lg font-semibold text-[#f5f5f7]">
          Ops Platform
        </h1>
      </div>

      <nav className="flex-1 py-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-md py-md mx-sm mb-xs rounded-md transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#0a84ff]/10 text-[#0a84ff]'
                  : 'text-[#86868b] hover:bg-[#2d2d2f] hover:text-[#f5f5f7]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0a84ff] rounded-r-full" />
              )}
              
              <Icon size={20} className="mr-md flex-shrink-0" />
              
              <span className="font-medium text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
