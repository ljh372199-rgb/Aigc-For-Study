import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 陶瓷质感遮罩层 - 增强blur效果以突出陶瓷质感 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-3xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* 陶瓷质感弹窗主体 */}
      <div 
        className={`relative w-full ${sizes[size]} ceramic rounded-2xl shadow-2xl animate-fade-in-up`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-[#f8fafc]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-[#64748b] hover:text-[#f8fafc] hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
