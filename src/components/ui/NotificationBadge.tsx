import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className = '', 
  size = 'sm' 
}) => {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm'
  };

  return (
    <div className={`
      absolute -top-2 -right-2 
      ${sizeClasses[size]}
      bg-gradient-to-r from-amber-500 to-orange-500 
      text-white 
      rounded-full 
      flex items-center justify-center 
      font-bold 
      shadow-lg 
      border-2 border-white
      magical-glow
      ${className}
    `}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;