import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'hover' | 'interactive';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default'
}) => {
  const baseStyles = 'fantasy-card';
  
  const variantStyles = {
    default: '',
    hover: 'transform-gpu transition-all duration-300 hover:scale-[1.02]',
    interactive: 'transform-gpu transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer'
  };
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      <div className="magical-particles" />
      {children}
    </div>
  );
};

export default Card;