import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';

interface CoinDisplayProps {
  coins: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onAnimationComplete?: () => void;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({
  coins,
  showAnimation = false,
  size = 'md',
  className = '',
  onAnimationComplete
}) => {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeStyles = {
    sm: {
      container: 'px-2 py-1',
      icon: 16,
      text: 'text-sm',
      coin: 'text-xs'
    },
    md: {
      container: 'px-3 py-2',
      icon: 20,
      text: 'text-base',
      coin: 'text-sm'
    },
    lg: {
      container: 'px-4 py-3',
      icon: 24,
      text: 'text-lg',
      coin: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  useEffect(() => {
    if (showAnimation && coins !== displayCoins) {
      setIsAnimating(true);
      
      // Animate the coin count change
      const difference = coins - displayCoins;
      const steps = Math.min(Math.abs(difference), 20);
      const increment = difference / steps;
      let currentStep = 0;

      const animationInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayCoins(coins);
          clearInterval(animationInterval);
          setTimeout(() => {
            setIsAnimating(false);
            onAnimationComplete?.();
          }, 500);
        } else {
          setDisplayCoins(prev => Math.round(prev + increment));
        }
      }, 50);

      return () => clearInterval(animationInterval);
    } else {
      setDisplayCoins(coins);
    }
  }, [coins, showAnimation, displayCoins, onAnimationComplete]);

  return (
    <div className={`
      inline-flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 
      border-2 border-amber-300 rounded-full shadow-md magical-glow
      ${styles.container} ${className}
      ${isAnimating ? 'animate-pulse scale-110 transition-transform duration-300' : 'transition-transform duration-300'}
    `}>
      <div className="relative">
        <Coins 
          size={styles.icon} 
          className={`text-amber-600 mr-2 ${isAnimating ? 'animate-spin' : ''}`} 
        />
        {isAnimating && (
          <Sparkles 
            size={styles.icon / 2} 
            className="absolute -top-1 -right-1 text-yellow-500 animate-ping" 
          />
        )}
      </div>
      
      <span className={`font-cinzel font-bold text-amber-800 ${styles.text}`}>
        {displayCoins.toLocaleString()}
      </span>
      
      <span className={`ml-1 font-cinzel text-amber-600 ${styles.coin}`}>
        Mythic Coins
      </span>

      {isAnimating && (
        <TrendingUp 
          size={styles.icon / 1.5} 
          className="ml-2 text-green-600 animate-bounce" 
        />
      )}
    </div>
  );
};

export default CoinDisplay;