import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import Button from './Button';
import { Trophy, Star, Coins, Share2, X } from 'lucide-react';
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
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Play level up sound
      SoundEffects.playSound('level-up');
      
      // Start animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 100);

      // Play achievement sound after level up sound
      setTimeout(() => {
        SoundEffects.playSound('achievement');
      }, 1000);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible]);

  const handleShare = () => {
    SoundEffects.playSound('sparkle');
    onShareAchievement();
  };

  const handleClose = () => {
    SoundEffects.playSound('click');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-500 ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header with magical background */}
        <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 p-6 text-center">
          <div className="absolute inset-0 magical-particles"></div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className={`relative z-10 transform transition-all duration-700 delay-300 ${
            showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg magical-glow">
              <Trophy className="text-amber-500" size={40} />
            </div>
            
            <h2 className="text-2xl font-cinzel font-bold text-white mb-2 magical-glow">
              Level Up!
            </h2>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="text-yellow-200" size={20} />
              <span className="text-xl font-cinzel font-bold text-white">
                Level {newLevel}
              </span>
              <Star className="text-yellow-200" size={20} />
            </div>
            
            <p className="text-amber-100 font-merriweather">
              Congratulations, {user.name}!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`transform transition-all duration-700 delay-500 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-gray-700 font-merriweather text-center mb-6">
              Your dedication to wellness has elevated you to new heights! 
              The mystical realm of Eldoria celebrates your achievement.
            </p>

            {/* Rewards */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 mb-6 border border-amber-200">
              <h3 className="font-cinzel font-bold text-amber-800 mb-3 text-center">
                Level Up Rewards
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="text-amber-600 mr-2" size={16} />
                    <span className="font-cinzel text-amber-700">Experience Points</span>
                  </div>
                  <span className="font-cinzel font-bold text-amber-800">+{xpEarned} XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="text-amber-600 mr-2 magical-glow" size={16} />
                    <span className="font-cinzel text-amber-700">Mythic Coins</span>
                  </div>
                  <span className="font-cinzel font-bold text-amber-800">+{coinsEarned} Coins</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleShare}
                icon={<Share2 size={16} />}
                className="magical-glow"
                soundEffect="sparkle"
              >
                Share Achievement
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={handleClose}
                soundEffect="click"
              >
                Continue Adventure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;