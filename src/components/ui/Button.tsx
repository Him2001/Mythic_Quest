import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon
}) => {
  const baseStyles = 'fantasy-button flex items-center justify-center';
  
  const variantStyles = {
    primary: 'text-amber-50 hover:text-white',
    secondary: 'bg-emerald-800 hover:bg-emerald-700 text-emerald-50',
    outline: 'bg-transparent border-2 border-amber-600 text-amber-600 hover:text-amber-500 hover:border-amber-500',
    ghost: 'bg-transparent text-amber-700 hover:text-amber-600 hover:bg-amber-50/50'
  };
  
  const sizeStyles = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-2.5 px-4',
    lg: 'text-lg py-3 px-6'
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className} text-shadow-glow`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="font-cinzel font-bold tracking-wide">{children}</span>
    </button>
  );
};

export default Button;