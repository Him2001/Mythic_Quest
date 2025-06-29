import React, { useState, useEffect } from 'react';
import { Quest } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { CheckCircle, MapPin, Play, Square, Navigation, Award, AlertCircle, Coins, Plus } from 'lucide-react';
import { gpsTracker } from '../../utils/gpsTracker';
import { CoinSystem } from '../../utils/coinSystem';
import { SoundEffects } from '../../utils/soundEffects';

interface WalkingQuestCardProps {
  quest: Quest;
  onComplete: (questId: string, distanceWalked: number) => void;
  onStart: (questId: string) => void;
  onUpdateProgress: (questId: string, progress: number) => void;
}

const WalkingQuestCard: React.FC<WalkingQuestCardProps> = ({ 
  quest, 
  onComplete, 
  onStart, 
  onUpdateProgress 
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(quest.progress || 0);
  const [error, setError] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const targetDistance = quest.targetDistance || 5000; // 5km default
  const progressPercentage = Math.min(100, Math.round((currentDistance / targetDistance) * 100));
  
  // Calculate coin reward
  const coinReward = quest.coinReward || CoinSystem.calculateQuestReward(quest.type, quest.difficulty);

  useEffect(() => {
    // Update quest progress when distance changes
    if (currentDistance !== (quest.progress || 0)) {
      onUpdateProgress(quest.id, currentDistance);
    }

    // Auto-complete quest when target is reached
    if (currentDistance >= targetDistance && !quest.completed) {
      handleCompleteQuest();
    }
  }, [currentDistance, targetDistance, quest.completed, quest.id, quest.progress, onUpdateProgress]);

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const handleStartTracking = async () => {
    try {
      setError('');
      
      // Play movement sound
      SoundEffects.playSound('movement');
      
      await gpsTracker.requestPermission();
      setPermissionGranted(true);
      
      gpsTracker.startTracking(
        (distance) => {
          setCurrentDistance(prev => prev + distance - gpsTracker.getTotalDistance() + distance);
        },
        (errorMsg) => {
          setError(errorMsg);
          setIsTracking(false);
          SoundEffects.playSound('error');
        }
      );
      
      setIsTracking(true);
      onStart(quest.id);
      
      // Play notification sound
      SoundEffects.playSound('notification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start GPS tracking');
      SoundEffects.playSound('error');
    }
  };

  const handleStopTracking = () => {
    const finalDistance = gpsTracker.stopTracking();
    setIsTracking(false);
    
    // Play stop sound
    SoundEffects.playSound('click');
  };

  const handleCompleteQuest = () => {
    if (isTracking) {
      handleStopTracking();
    }
    
    // Play quest completion sound
    SoundEffects.playSound('quest-complete');
    
    // Play coin sound after a short delay
    setTimeout(() => {
      SoundEffects.playSound('coin');
    }, 500);
    
    onComplete(quest.id, currentDistance);
  };

  return (
    <Card 
      variant="hover" 
      className={`relative border-l-4 ${
        quest.completed ? 'border-l-green-500' : isTracking ? 'border-l-blue-500' : 'border-l-amber-500'
      } fantasy-card`}
    >
      {quest.completed && (
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 magical-glow">
          <CheckCircle className="text-green-500" size={20} sm:size={24} />
        </div>
      )}
      
      {isTracking && (
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Navigation className="text-blue-500" size={16} sm:size={20} />
          </div>
        </div>
      )}
      
      <div className="flex flex-col h-full p-3 sm:p-5">
        <div className="mb-2 sm:mb-3 flex items-start justify-between">
          <Badge 
            color="primary" 
            variant="default"
            className="mb-2 magical-glow"
          >
            <MapPin size={12} sm:size={14} className="mr-1" />
            Walking Quest
          </Badge>
          <Badge color="warning" variant="subtle">
            {quest.difficulty === 'easy' ? 'Apprentice' : 
             quest.difficulty === 'medium' ? 'Adept' : 'Master'}
          </Badge>
        </div>
        
        <h3 className="text-base sm:text-lg font-cinzel font-bold text-mystic-dark mb-2 sm:mb-3">{quest.title}</h3>
        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 font-merriweather">{quest.description}</p>
        
        {/* Distance Progress */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-cinzel">
            <span>Distance Progress</span>
            <span>{formatDistance(currentDistance)} / {formatDistance(targetDistance)}</span>
          </div>
          <ProgressBar 
            progress={progressPercentage} 
            color="primary"
            height="lg"
            animated={isTracking}
            showText
          />
          
          {isTracking && (
            <div className="mt-2 text-xs text-blue-600 font-cinzel flex items-center">
              <Navigation size={10} sm:size={12} className="mr-1 animate-pulse" />
              GPS tracking active - Keep moving!
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center text-red-700 text-xs">
              <AlertCircle size={12} sm:size={14} className="mr-1" />
              {error}
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center text-amber-700">
              <Award size={14} sm:size={16} className="mr-1 magical-glow" />
              <span className="text-xs sm:text-sm font-cinzel">{quest.xpReward} XP</span>
            </div>
            
            <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <Coins size={12} sm:size={14} className="mr-1 magical-glow" />
              <Plus size={8} sm:size={10} className="mr-1" />
              <span className="text-xs sm:text-sm font-cinzel font-bold">{coinReward}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {quest.completed ? (
            <div className="flex items-center justify-center p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 mr-2" size={14} sm:size={16} />
              <span className="font-cinzel text-green-800 font-bold text-xs sm:text-sm">
                Quest Completed - {formatDistance(currentDistance)} walked!
              </span>
              <div className="ml-2 flex items-center text-green-600">
                <Coins size={12} sm:size={14} className="mr-1" />
                <span className="text-xs sm:text-sm font-cinzel">+{coinReward} earned</span>
              </div>
            </div>
          ) : (
            <>
              {!isTracking ? (
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={handleStartTracking}
                  icon={<Play size={14} sm:size={16} />}
                  className="font-cinzel magical-glow text-xs sm:text-sm"
                  soundEffect="movement"
                >
                  <div className="flex items-center justify-center">
                    <span>Start GPS Tracking</span>
                    <div className="ml-2 flex items-center text-amber-200">
                      <Plus size={10} className="mr-1" />
                      <Coins size={12} sm:size={14} className="mr-1" />
                      <span className="text-xs">{coinReward}</span>
                    </div>
                  </div>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="secondary" 
                    fullWidth
                    onClick={handleStopTracking}
                    icon={<Square size={14} sm:size={16} />}
                    className="font-cinzel text-xs sm:text-sm"
                    soundEffect="click"
                  >
                    Stop Tracking
                  </Button>
                  {currentDistance >= targetDistance && (
                    <Button 
                      variant="primary" 
                      fullWidth
                      onClick={handleCompleteQuest}
                      className="font-cinzel magical-glow animate-pulse text-xs sm:text-sm"
                      soundEffect="quest-complete"
                    >
                      <div className="flex items-center justify-center">
                        <span>Complete Quest!</span>
                        <div className="ml-2 flex items-center text-amber-200">
                          <Plus size={10} className="mr-1" />
                          <Coins size={12} sm:size={14} className="mr-1" />
                          <span className="text-xs">{coinReward}</span>
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WalkingQuestCard;