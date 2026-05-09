import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type ViewType = 'landing' | 'student' | 'teacher';

export function useAppView() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('landing');

  useEffect(() => {
    if (!user) {
      setCurrentView('landing');
    } else {
      setCurrentView(user.role);
    }
  }, [user]);

  return {
    currentView,
    setCurrentView,
  };
}
