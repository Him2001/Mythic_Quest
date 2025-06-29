import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'interactive';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick
}) => {
  // Base classes
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: '',
    hover: 'transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px]',
    interactive: 'transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] cursor-pointer active:shadow-md active:translate-y-[-1px]'
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;