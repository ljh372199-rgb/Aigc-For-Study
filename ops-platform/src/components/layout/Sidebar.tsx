import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Activity, Database } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Activity, label: 'Monitoring', path: '/monitoring' },
  { icon: Database, label: 'Resources', path: '/resources' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      className="h-screen bg-background-secondary border-r border-border flex flex-col"
    >
      <div className="h-16 flex items-center justify-center border-b border-border">
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-gradient"
          >
            Ops Platform
          </motion.h1>
        )}
        {collapsed && (
          <span className="text-2xl font-bold text-accent-blue">OP</span>
        )}
      </div>

      <nav className="flex-1 py-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-lg py-md mb-xs transition-colors duration-200 ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue border-r-2 border-accent-blue'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              }`}
            >
              <Icon size={20} className={collapsed ? 'mx-auto' : 'mr-md'} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
