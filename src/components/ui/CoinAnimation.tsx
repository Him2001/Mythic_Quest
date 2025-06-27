import React, { useEffect, useState } from 'react';
import { Coins, Plus } from 'lucide-react';
import { SoundEffects } from '../../utils/soundEffects';

interface CoinAnimationProps {
  amount: number;
  trigger: boolean;
  onComplete: () => void;
  position?: 'top-right' | 'center' | 'top-left';
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

  useEffect(() => {
    if (trigger && amount > 0) {
      // Play coin sound effect
      SoundEffects.playSound('coin');
      
      setIsVisible(true);
      setAnimationPhase('enter');

      // Enter phase
      const enterTimer = setTimeout(() => {
        setAnimationPhase('float');
      }, 300);

      // Float phase
      const floatTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, 1500);

      // Exit phase
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 2000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(floatTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [trigger, amount, onComplete]);

  if (!isVisible || amount <= 0) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-4 left-4'
  };

  const typeColors = {
    quest: 'from-amber-400 to-yellow-500',
    level_up: 'from-purple-400 to-pink-500',
    bonus: 'from-green-400 to-emerald-500'
  };

  const animationClasses = {
    enter: 'scale-0 opacity-0 translate-y-4',
    float: 'scale-100 opacity-100 translate-y-0',
    exit: 'scale-110 opacity-0 -translate-y-8'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className={`
        transform transition-all duration-500 ease-out
        ${animationClasses[animationPhase]}
      `}>
        <div className={`
          bg-gradient-to-r ${typeColors[type]} 
          text-white px-4 py-2 rounded-full shadow-lg
          flex items-center space-x-2 font-cinzel font-bold
          border-2 border-white/20 magical-glow
        `}>
          <Plus size={16} className="animate-pulse" />
          <Coins size={18} className="animate-bounce" />
          <span className="text-lg">{amount}</span>
          
          {/* Sparkle effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating coins effect */}
        {animationPhase === 'float' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute animate-bounce
                  ${i === 0 ? '-top-2 -left-2' : i === 1 ? '-top-2 -right-2' : '-bottom-2 left-1/2'}
                `}
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.5s'
                }}
              >
                <Coins size={12} className="text-yellow-300 drop-shadow-lg" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinAnimation;