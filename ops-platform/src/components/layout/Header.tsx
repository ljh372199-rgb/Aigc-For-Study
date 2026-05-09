import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui';

export function Header() {
  return (
    <header className="h-16 bg-background-secondary border-b border-border flex items-center justify-between px-xl">
      <div className="flex items-center flex-1">
        <div className="relative max-w-md w-full">
          <Search
            size={18}
            className="absolute left-md top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-xxl pr-lg py-sm rounded-md bg-background-tertiary text-text-primary placeholder:text-text-tertiary border border-border focus:outline-none focus:border-accent-blue transition-colors duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
        </Button>
        <Button variant="ghost" size="sm">
          <User size={20} />
        </Button>
      </div>
    </header>
  );
}
