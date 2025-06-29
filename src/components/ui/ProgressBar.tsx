import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'primary',
  height = 'md',
  animated = false,
  showText = false,
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  // Color classes
  const colorClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-purple-500 to-purple-600',
    accent: 'bg-gradient-to-r from-amber-500 to-amber-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600'
  };
  
  // Height classes
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  // Animation class
  const animationClass = animated ? 'animate-pulse' : '';
  
  return (
    <div className={`relative w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]} ${className}`}>
      <div 
        className={`${colorClasses[color]} ${heightClasses[height]} rounded-full ${animationClass}`}
        style={{ width: `${clampedProgress}%` }}
      />
      
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;