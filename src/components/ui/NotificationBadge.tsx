import React from 'react';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  className = ''
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold bg-red-500 text-white ${className}`}>
      {displayCount}
    </span>
  );
};

export default NotificationBadge;