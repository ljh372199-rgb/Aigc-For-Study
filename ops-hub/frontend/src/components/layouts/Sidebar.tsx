import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Bell,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/', label: '概览仪表盘', icon: LayoutDashboard },
  { path: '/monitoring', label: '监控中心', icon: Activity },
  { path: '/alerts', label: '告警中心', icon: Bell },
  { path: '/logs', label: '日志中心', icon: FileText },
];

const bottomNavItems: NavItem[] = [
  { path: '/settings', label: '设置', icon: Settings },
  { path: '/help', label: '帮助', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`
        flex flex-col h-screen bg-bg-secondary border-r border-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg text-text-primary">OpsHub</span>
          </div>
        )}
        {collapsed && <Activity className="w-6 h-6 text-primary mx-auto" />}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border py-4">
        <ul className="space-y-1 px-2">
          {bottomNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onToggle}
        className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-bg-tertiary border border-border
                   flex items-center justify-center text-text-secondary hover:text-text-primary
                   transition-colors shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
