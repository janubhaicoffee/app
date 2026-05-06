import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Bell, X } from 'lucide-react';

interface NotificationProps {
  title: string;
  message: string;
  type?: 'success' | 'info' | 'promo';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationProps> = ({ title, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] animate-slide-down">
      <Card glass className="p-4 border-l-4 border-l-coffee-brown flex items-start gap-3 shadow-2xl">
        <div className="p-2 bg-cream rounded-full text-coffee-brown">
          <Bell size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs opacity-60 mt-0.5">{message}</p>
        </div>
        <button onClick={() => setVisible(false)} className="opacity-30 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      </Card>
    </div>
  );
};
