import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

interface CoinAnimationProps {
  amount: number;
  trigger: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  type?: 'quest' | 'level_up' | 'bonus';
  onComplete?: () => void;
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({
  amount,
  trigger,
  position = 'top-right',
  type = 'quest',
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-16 sm:top-20 right-4 sm:right-8',
    'top-left': 'top-16 sm:top-20 left-4 sm:left-8',
    'bottom-right': 'bottom-4 sm:bottom-8 right-4 sm:right-8',
    'bottom-left': 'bottom-4 sm:bottom-8 left-4 sm:left-8',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };
  
  // Type classes
  const typeClasses = {
    quest: 'bg-amber-500 text-white',
    level_up: 'bg-purple-500 text-white',
    bonus: 'bg-green-500 text-white'
  };
  
  // Generate coins when triggered
  useEffect(() => {
    if (trigger && amount > 0) {
      // Generate random coins
      const numCoins = Math.min(Math.max(5, Math.floor(amount / 10)), 20);
      const newCoins = Array.from({ length: numCoins }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // -50 to 50
        y: Math.random() * 100 - 50, // -50 to 50
        delay: Math.random() * 500, // 0 to 500ms
        size: Math.random() * 0.5 + 0.75 // 0.75 to 1.25
      }));
      
      setCoins(newCoins);
      setIsVisible(true);
      setIsAnimating(true);
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        
        // Call onComplete after animation ends
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) {
            onComplete();
          }
        }, 500);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, amount, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      {/* Main coin display */}
      <div className={`flex items-center ${typeClasses[type]} px-3 py-2 rounded-full shadow-lg ${isAnimating ? 'animate-bounce' : 'animate-fadeOut'} transition-opacity duration-500`}>
        <Coins className="mr-2" size={20} />
        <span className="font-cinzel font-bold">+{amount}</span>
      </div>
      
      {/* Flying coins */}
      {isAnimating && coins.map(coin => (
        <div
          key={coin.id}
          className="absolute top-1/2 left-1/2 text-amber-500"
          style={{
            animation: `coinFly 1.5s ease-out forwards ${coin.delay}ms`,
            transform: `translate(-50%, -50%) scale(${coin.size})`,
            opacity: 0
          }}
        >
          <Coins size={16} className="animate-spin" />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes coinFly {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + ${coins[0]?.x}px), calc(-50% + ${coins[0]?.y}px)) scale(${coins[0]?.size});
            opacity: 0;
          }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CoinAnimation;