import React, { useState } from 'react';
import { Search, Bell, User, Moon, Sun, LogOut } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = '概览仪表盘' }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, message: 'CPU 使用率超过 80%', type: 'warning' as const, time: '5 分钟前' },
    { id: 2, message: '服务重启成功', type: 'success' as const, time: '15 分钟前' },
    { id: 3, message: '新的告警规则已激活', type: 'info' as const, time: '1 小时前' },
  ];

  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索..."
            className="
              w-64 px-4 py-2 pl-10 bg-bg-tertiary border border-border rounded-lg
              text-text-primary placeholder-text-tertiary text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all
            "
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary">通知</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-border hover:bg-bg-tertiary cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <StatusBadge status={notification.type} size="sm">
                        {notification.type === 'warning' && '警告'}
                        {notification.type === 'success' && '成功'}
                        {notification.type === 'info' && '信息'}
                      </StatusBadge>
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{notification.message}</p>
                        <p className="text-xs text-text-tertiary mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
        >
          {isDarkMode ? (
            <Moon className="w-5 h-5 text-text-secondary" />
          ) : (
            <Sun className="w-5 h-5 text-text-secondary" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-text-primary">Admin</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-text-primary">admin@example.com</p>
                <p className="text-xs text-text-tertiary mt-1">管理员</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  个人资料
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-danger hover:bg-bg-tertiary rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
