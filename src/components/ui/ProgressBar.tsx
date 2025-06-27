import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  height?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'primary',
  height = 'md',
  showText = false,
  animated = true,
  className = ''
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  const heightStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };
  
  const colorStyles = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600',
    secondary: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    accent: 'bg-gradient-to-r from-purple-500 to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600'
  };
  
  return (
    <div className={className}>
      <div className={`fantasy-progress ${heightStyles[height]}`}>
        <div 
          className={`fantasy-progress-bar ${colorStyles[color]} ${animated ? 'transition-all duration-500' : ''}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showText && (
        <div className="text-xs font-cinzel text-amber-800 mt-1">
          {safeProgress}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;