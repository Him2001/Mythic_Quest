import React from 'react';
import { User } from '../../types';
import Button from './Button';
import { Trophy, Star, Coins, Sparkles, X } from 'lucide-react';

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
  if (!isVisible) return null;

  const handleContinue = () => {
    onClose();
  };

  const handleShareAchievement = () => {
    onClose();
    onShareAchievement();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-cinzel font-bold text-white mb-2">
              Level Up!
            </h2>
            <div className="flex items-center justify-center text-white/90">
              <Star className="mr-2" size={20} />
              <span className="text-lg font-cinzel">Level {newLevel} Achieved</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 font-merriweather mb-4">
              Congratulations, {user.name}! Your dedication to wellness has unlocked new powers in the mystical realm of Eldoria!
            </p>
            
            {/* Rewards */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
              <h3 className="font-cinzel font-bold text-amber-800 mb-3 flex items-center justify-center">
                <Sparkles className="mr-2" size={18} />
                Rewards Earned
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="text-amber-600 mr-1" size={16} />
                    <span className="font-cinzel font-bold text-amber-800">+{xpEarned} XP</span>
                  </div>
                  <p className="text-xs text-amber-700 font-merriweather">Experience</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Coins className="text-amber-600 mr-1" size={16} />
                    <span className="font-cinzel font-bold text-amber-800">+{coinsEarned} Coins</span>
                  </div>
                  <p className="text-xs text-amber-700 font-merriweather">Mythic Coins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleContinue}
              className="flex-1 font-cinzel"
            >
              Continue
            </Button>
            <Button
              variant="primary"
              onClick={handleShareAchievement}
              className="flex-1 font-cinzel magical-glow"
              icon={<Sparkles size={16} />}
            >
              Share Achievement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;