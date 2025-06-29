import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

interface CoinDisplayProps {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ 
  coins, 
  size = 'md',
  showAnimation = false,
  onAnimationComplete
}) => {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Update display coins when actual coins change
  useEffect(() => {
    if (coins !== displayCoins) {
      if (showAnimation) {
        setIsAnimating(true);
        
        // Animate counting up
        const diff = coins - displayCoins;
        const duration = 1500; // ms
        const steps = 20;
        const increment = diff / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            setDisplayCoins(coins);
            clearInterval(interval);
            
            // Allow animation to finish displaying before calling complete
            setTimeout(() => {
              setIsAnimating(false);
              if (onAnimationComplete) {
                onAnimationComplete();
              }
            }, 500);
          } else {
            setDisplayCoins(prev => Math.round(prev + increment));
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      } else {
        setDisplayCoins(coins);
      }
    }
  }, [coins, displayCoins, showAnimation, onAnimationComplete]);
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3.5 h-3.5 mr-1',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4 mr-1.5',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5 mr-2',
      text: 'text-base'
    }
  };
  
  const { container, icon, text } = sizeClasses[size];
  
  return (
    <div 
      className={`flex items-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-full border border-amber-200 ${container} ${isAnimating ? 'animate-pulse magical-glow' : ''}`}
    >
      <Coins className={`text-amber-500 ${icon}`} />
      <span className={`font-cinzel font-bold text-amber-700 ${text}`}>
        {displayCoins.toLocaleString()}
      </span>
    </div>
  );
};

export default CoinDisplay;