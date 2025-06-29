import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  status,
  className = '',
  onClick
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  // Status color classes
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  // Status size classes
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };
  
  return (
    <div className={`relative inline-block ${className}`} onClick={onClick}>
      <img
        src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 ${onClick ? 'cursor-pointer' : ''}`}
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`;
        }}
      />
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full border-2 border-white`}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}
    </div>
  );
};

export default Avatar;