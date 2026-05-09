import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/monitor': 'Monitor',
  '/alerts': 'Alerts',
  '/logs': 'Logs',
  '/services': 'Services',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPageName = routeNames[location.pathname] || 'Page';

  return (
    <header className="h-14 bg-[#000000]/50 backdrop-blur-xl border-b border-[#3d3d3f] flex items-center justify-between px-xl">
      <div className="flex items-center text-sm">
        <span className="text-[#6e6e73]">{currentPageName}</span>
      </div>

      <div className="flex items-center gap-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-sm top-1/2 -translate-y-1/2 text-[#6e6e73]"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-xxl pr-md py-xs rounded-md bg-[#2d2d2f] text-[#f5f5f7] placeholder:text-[#6e6e73] border border-[#3d3d3f] focus:outline-none focus:border-[#0a84ff] transition-colors duration-200 text-sm"
          />
        </div>

        <button className="p-xs rounded-md hover:bg-[#2d2d2f] transition-colors duration-200 relative">
          <Bell size={20} className="text-[#86868b]" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#ff453a] rounded-full" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-sm p-xs rounded-md hover:bg-[#2d2d2f] transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0a84ff] to-[#bf5af2] flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <ChevronDown
              size={16}
              className={`text-[#86868b] transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-xs w-56 bg-[#1d1d1f] border border-[#3d3d3f] rounded-lg shadow-xl py-xs z-50">
              <div className="px-md py-sm border-b border-[#3d3d3f]">
                <p className="text-sm font-medium text-[#f5f5f7]">User Name</p>
                <p className="text-xs text-[#86868b]">user@example.com</p>
              </div>
              
              <button className="w-full flex items-center gap-md px-md py-sm text-sm text-[#86868b] hover:bg-[#2d2d2f] hover:text-[#f5f5f7] transition-colors duration-200">
                <User size={16} />
                <span>Profile</span>
              </button>
              
              <button className="w-full flex items-center gap-md px-md py-sm text-sm text-[#86868b] hover:bg-[#2d2d2f] hover:text-[#f5f5f7] transition-colors duration-200">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <div className="border-t border-[#3d3d3f] mt-xs pt-xs">
                <button className="w-full flex items-center gap-md px-md py-sm text-sm text-[#ff453a] hover:bg-[#2d2d2f] transition-colors duration-200">
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
