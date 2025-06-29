import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  variant?: 'default' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  // Color classes
  const colorClasses = {
    default: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-purple-500 text-white',
      accent: 'bg-amber-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      neutral: 'bg-gray-500 text-white'
    },
    outline: {
      primary: 'border border-blue-500 text-blue-500',
      secondary: 'border border-purple-500 text-purple-500',
      accent: 'border border-amber-500 text-amber-500',
      success: 'border border-green-500 text-green-500',
      warning: 'border border-yellow-500 text-yellow-500',
      error: 'border border-red-500 text-red-500',
      neutral: 'border border-gray-500 text-gray-500'
    },
    subtle: {
      primary: 'bg-blue-100 text-blue-700',
      secondary: 'bg-purple-100 text-purple-700',
      accent: 'bg-amber-100 text-amber-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      neutral: 'bg-gray-100 text-gray-700'
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-2.5 py-1'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${colorClasses[variant][color]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;