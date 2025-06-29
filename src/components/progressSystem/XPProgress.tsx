import React from 'react';
import ProgressBar from '../ui/ProgressBar';
import CoinDisplay from '../ui/CoinDisplay';
import { Sparkles, Star, Trophy, Coins } from 'lucide-react';

interface XPProgressProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  mythicCoins: number;
  showCoinAnimation?: boolean;
  onCoinAnimationComplete?: () => void;
}

const XPProgress: React.FC<XPProgressProps> = ({ 
  level, 
  currentXP, 
  xpToNextLevel, 
  mythicCoins,
  showCoinAnimation = false,
  onCoinAnimationComplete
}) => {
  const xpPercentage = Math.min(100, Math.round((currentXP / xpToNextLevel) * 100));
  
  return (
    <div className="fantasy-card p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2 sm:mr-3 magical-glow border-2 border-amber-700">
            <span className="text-amber-100 font-cinzel font-bold text-base sm:text-lg">{level}</span>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-mystic-dark text-sm sm:text-base">Level {level}</h3>
            <p className="text-xs text-amber-800 font-cinzel flex items-center">
              <Star size={10} sm:size={12} className="mr-1 text-amber-600" />
              Mystic Apprentice
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {/* XP Display */}
          <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-200 magical-glow">
            <Trophy className="text-amber-600 mr-1 sm:mr-1.5" size={12} sm:size={14} />
            <span className="text-amber-800 text-xs sm:text-sm font-cinzel font-medium">{currentXP} XP</span>
          </div>
          
          {/* Coin Display */}
          <CoinDisplay 
            coins={mythicCoins} 
            size="sm" 
            showAnimation={showCoinAnimation}
            onAnimationComplete={onCoinAnimationComplete}
          />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-xs font-cinzel mb-2">
          <span className="text-mystic-dark">Progress to Level {level + 1}</span>
          <span className="text-amber-700">{currentXP}/{xpToNextLevel} XP</span>
        </div>
        <ProgressBar 
          progress={xpPercentage} 
          color="accent"
          height="lg"
          animated
          showText
        />
      </div>
      
      {/* Decorative elements */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between text-xs text-amber-700 gap-2">
        <div className="flex items-center">
          <Sparkles size={12} sm:size={14} className="mr-1 text-amber-500" />
          <span className="font-cinzel">Daily Quests: 3/5</span>
        </div>
        <div className="flex items-center font-cinzel">
          <Coins size={12} sm:size={14} className="mr-1 text-amber-500" />
          <span>Next Reward: +20 Coins</span>
        </div>
      </div>
    </div>
  );
};

export default XPProgress;