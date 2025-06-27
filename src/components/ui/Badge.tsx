import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'subtle';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variantColorStyles = {
    default: {
      primary: 'bg-purple-100 text-purple-800',
      secondary: 'bg-emerald-100 text-emerald-800',
      accent: 'bg-amber-100 text-amber-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    },
    outline: {
      primary: 'bg-transparent border border-purple-500 text-purple-500',
      secondary: 'bg-transparent border border-emerald-500 text-emerald-500',
      accent: 'bg-transparent border border-amber-500 text-amber-500',
      success: 'bg-transparent border border-green-500 text-green-500',
      warning: 'bg-transparent border border-yellow-500 text-yellow-500',
      error: 'bg-transparent border border-red-500 text-red-500'
    },
    subtle: {
      primary: 'bg-purple-50 text-purple-600',
      secondary: 'bg-emerald-50 text-emerald-600',
      accent: 'bg-amber-50 text-amber-600',
      success: 'bg-green-50 text-green-600',
      warning: 'bg-yellow-50 text-yellow-600',
      error: 'bg-red-50 text-red-600'
    }
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };
  
  return (
    <span className={`${baseStyles} ${variantColorStyles[variant][color]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;