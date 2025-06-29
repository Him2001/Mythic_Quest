import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Sparkles, Award, Share2, X, Coins, TrendingUp } from 'lucide-react';
import Button from './Button';
import { SoundEffects } from '../../utils/soundEffects';

interface LevelUpPopupProps {
  isVisible: boolean;
  user: User;
  newLevel: number;
  xpEarned: number;
  coinsEarned: number;
  onClose: () => void;
  onShareAchievement: () => void;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({
  isVisible,
  user,
  newLevel,
  xpEarned,
  coinsEarned,
  onClose,
  onShareAchievement
}) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  // Play level up sound when popup becomes visible
  useEffect(() => {
    if (isVisible) {
      SoundEffects.playSound('level-up');
      
      // Start animation sequence
      setAnimationStage(1);
      
      // Advance animation stages
      const timer1 = setTimeout(() => setAnimationStage(2), 1000);
      const timer2 = setTimeout(() => setAnimationStage(3), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Popup */}
      <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl shadow-2xl border-2 border-amber-300 max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-200/50 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        {/* Magical particles */}
        <div className="absolute inset-0 magical-particles opacity-30 pointer-events-none" />
        
        {/* Content */}
        <div className="p-6 sm:p-8 text-center relative z-0">
          {/* Level badge */}
          <div className="relative mx-auto mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto magical-glow">
              <span className="text-amber-100 font-cinzel font-bold text-3xl sm:text-4xl">{newLevel}</span>
            </div>
            
            {/* Animated rays */}
            <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-amber-500/20 animate-ping" />
            
            {/* Sparkles */}
            <Sparkles 
              className={`absolute -top-2 -left-2 text-amber-400 animate-bounce ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} 
              size={24} 
            />
            <Sparkles 
              className={`absolute -top-2 -right-2 text-amber-400 animate-bounce delay-100 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} 
              size={24} 
            />
            <Sparkles 
              className={`absolute -bottom-2 -left-2 text-amber-400 animate-bounce delay-200 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} 
              size={24} 
            />
            <Sparkles 
              className={`absolute -bottom-2 -right-2 text-amber-400 animate-bounce delay-300 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} 
              size={24} 
            />
          </div>
          
          {/* Title */}
          <h2 className={`text-2xl sm:text-3xl font-cinzel font-bold text-amber-800 mb-2 sm:mb-3 magical-glow ${animationStage >= 1 ? 'animate-pulse' : ''}`}>
            Level Up!
          </h2>
          
          {/* Congratulations message */}
          <p className={`text-amber-700 font-merriweather mb-4 sm:mb-6 ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            Congratulations, {user.name}! Your dedication to wellness has elevated you to new heights!
          </p>
          
          {/* Rewards */}
          <div className={`bg-white/70 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <h3 className="font-cinzel font-bold text-amber-800 mb-3 flex items-center justify-center">
              <Award className="mr-2 text-amber-600" size={20} />
              Rewards Earned
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-merriweather">New Level</span>
                <span className="font-cinzel font-bold text-amber-800 flex items-center">
                  <TrendingUp size={16} className="mr-1 text-amber-600" />
                  Level {newLevel}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-merriweather">XP Gained</span>
                <span className="font-cinzel font-bold text-purple-700">+{xpEarned} XP</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-merriweather">Coins Earned</span>
                <span className="font-cinzel font-bold text-amber-600 flex items-center">
                  <Coins size={16} className="mr-1" />
                  +{coinsEarned}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <Button
              variant="primary"
              fullWidth
              onClick={onShareAchievement}
              icon={<Share2 size={16} />}
              className="magical-glow"
            >
              Share Achievement
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Continue Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;