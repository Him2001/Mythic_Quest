import React, { ReactNode } from 'react';
import { SoundEffects } from '../../utils/soundEffects';

interface ButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  soundEffect?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  soundEffect = 'click',
  ...props
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    // Play sound effect
    if (soundEffect) {
      SoundEffects.playSound(soundEffect);
    }
    
    // Call the original onClick handler
    if (onClick) {
      onClick();
    }
  };

  // Base classes
  const baseClasses = 'font-cinzel font-medium transition-all duration-200 flex items-center justify-center';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 rounded',
    md: 'text-sm px-3 py-1.5 rounded-md',
    lg: 'text-base px-4 py-2 rounded-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow hover:shadow-md hover:from-amber-600 hover:to-yellow-600 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-yellow-500',
    secondary: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow hover:shadow-md hover:from-purple-600 hover:to-indigo-600 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-indigo-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    link: 'text-amber-600 hover:text-amber-700 underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed'
  };
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className={`${children ? 'mr-1.5' : ''}`}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className={`${children ? 'ml-1.5' : ''}`}>{icon}</span>}
    </button>
  );
};

export default Button;