import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, Plus } from 'lucide-react';

interface CoinAnimationProps {
  amount: number;
  trigger: boolean;
  onComplete?: () => void;
  position?: 'top-right' | 'center' | 'bottom-right';
  type?: 'quest' | 'level_up' | 'bonus';
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({
  amount,
  trigger,
  onComplete,
  position = 'top-right',
  type = 'quest'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'float' | 'exit'>('enter');

  const positionStyles = {
    'top-right': 'fixed top-4 right-4 z-50',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50'
  };

  const typeStyles = {
    quest: {
      bg: 'from-amber-500 to-yellow-500',
      border: 'border-amber-400',
      text: 'Quest Reward!',
      icon: <Coins size={24} className="text-white" />
    },
    level_up: {
      bg: 'from-purple-500 to-indigo-500',
      border: 'border-purple-400',
      text: 'Level Up Bonus!',
      icon: <Sparkles size={24} className="text-white" />
    },
    bonus: {
      bg: 'from-green-500 to-emerald-500',
      border: 'border-green-400',
      text: 'Bonus Coins!',
      icon: <Plus size={24} className="text-white" />
    }
  };

  const style = typeStyles[type];

  useEffect(() => {
    if (trigger && amount > 0) {
      setIsVisible(true);
      setAnimationPhase('enter');

      // Enter phase
      setTimeout(() => {
        setAnimationPhase('float');
      }, 300);

      // Float phase
      setTimeout(() => {
        setAnimationPhase('exit');
      }, 2000);

      // Exit phase
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2800);
    }
  }, [trigger, amount, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${positionStyles[position]} pointer-events-none`}>
      <div className={`
        bg-gradient-to-r ${style.bg} text-white p-4 rounded-xl shadow-2xl
        border-4 ${style.border} transform transition-all duration-300
        ${animationPhase === 'enter' ? 'scale-0 rotate-180 opacity-0' : ''}
        ${animationPhase === 'float' ? 'scale-100 rotate-0 opacity-100 animate-bounce' : ''}
        ${animationPhase === 'exit' ? 'scale-110 opacity-0 translate-y-8' : ''}
      `}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            {style.icon}
            <div className="absolute -top-1 -right-1">
              <Sparkles size={12} className="text-yellow-300 animate-ping" />
            </div>
          </div>
          
          <div>
            <div className="font-cinzel font-bold text-lg">
              {style.text}
            </div>
            <div className="font-cinzel text-2xl font-bold flex items-center">
              <Plus size={16} className="mr-1" />
              {amount} Coins
            </div>
          </div>
        </div>

        {/* Floating coin particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 bg-yellow-400 rounded-full animate-ping`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinAnimation;