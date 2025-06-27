import React, { useState, useEffect } from 'react';
import { LocationQuest } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { MapPin, Target, Award, Navigation, CheckCircle, Clock, Play, Square } from 'lucide-react';
import { locationService } from '../../utils/locationService';

interface LocationQuestPanelProps {
  quest: LocationQuest | null;
  userLocation: { latitude: number; longitude: number } | null;
  onCompleteQuest: (questId: string) => void;
  onCancelQuest: (questId: string) => void;
}

const LocationQuestPanel: React.FC<LocationQuestPanelProps> = ({
  quest,
  userLocation,
  onCompleteQuest,
  onCancelQuest
}) => {
  const [isActivityActive, setIsActivityActive] = useState(false);
  const [activityTimeRemaining, setActivityTimeRemaining] = useState(0);
  const [activityTimer, setActivityTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (activityTimer) {
        clearInterval(activityTimer);
      }
    };
  }, [activityTimer]);

  if (!quest) {
    return (
      <Card className="p-6 text-center">
        <MapPin className="mx-auto mb-3 text-gray-400\" size={32} />
        <h3 className="font-cinzel font-bold text-gray-600 mb-2">No Active Location Quest</h3>
        <p className="text-sm text-gray-500 font-merriweather">
          Select a magical location on the map to begin your wellness journey
        </p>
      </Card>
    );
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentDistance = userLocation ? locationService.calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    quest.targetLocation.latitude,
    quest.targetLocation.longitude
  ) : null;

  const isNearTarget = currentDistance !== null && currentDistance <= 50;
  const progressPercentage = currentDistance !== null 
    ? Math.max(0, Math.min(100, 100 - (currentDistance / 1000) * 10)) // Closer = higher percentage
    : 0;

  const startActivity = () => {
    const questData = locationService.generateLocationQuest(quest.targetLocation);
    const duration = questData.duration || 10; // Default 10 minutes
    
    setIsActivityActive(true);
    setActivityTimeRemaining(duration * 60); // Convert to seconds
    
    const timer = setInterval(() => {
      setActivityTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActivityActive(false);
          clearInterval(timer);
          setActivityTimer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setActivityTimer(timer);
  };

  const stopActivity = () => {
    if (activityTimer) {
      clearInterval(activityTimer);
      setActivityTimer(null);
    }
    setIsActivityActive(false);
    setActivityTimeRemaining(0);
  };

  const completeQuest = () => {
    stopActivity();
    onCompleteQuest(quest.id);
  };

  return (
    <Card className="fantasy-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Target className="text-amber-600 mr-2" size={20} />
          <Badge color="primary" variant="default">
            Wellness Quest
          </Badge>
        </div>
        
        {quest.completed ? (
          <CheckCircle className="text-green-500" size={24} />
        ) : isNearTarget ? (
          <div className="flex items-center text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-cinzel">In Range!</span>
          </div>
        ) : (
          <Navigation className="text-blue-500" size={20} />
        )}
      </div>

      <h3 className="text-lg font-cinzel font-bold text-mystic-dark mb-2">
        {quest.title}
      </h3>
      
      <p className="text-sm text-gray-700 mb-4 font-merriweather">
        {quest.description}
      </p>

      {/* Target Location Info */}
      <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-cinzel font-semibold text-amber-800">
            {quest.targetLocation.magicalName}
          </h4>
          <span className="text-lg">
            {locationService.getLocationIcon(quest.targetLocation.type)}
          </span>
        </div>
        
        <p className="text-xs text-amber-700 mb-2">
          {quest.targetLocation.description}
        </p>
        
        <div className="text-xs text-amber-600">
          📍 {quest.targetLocation.name}
        </div>
      </div>

      {/* Distance and Progress */}
      {currentDistance !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2 font-cinzel">
            <span>Distance to Target</span>
            <span className={isNearTarget ? 'text-green-600 font-bold' : ''}>
              {formatDistance(currentDistance)}
            </span>
          </div>
          
          <ProgressBar 
            progress={progressPercentage}
            color={isNearTarget ? 'success' : 'primary'}
            height="md"
            animated={!quest.completed}
          />
          
          {isNearTarget && !quest.completed && (
            <div className="mt-2 text-xs text-green-600 font-cinzel flex items-center">
              <Target size={12} className="mr-1" />
              You've reached the location! Begin your wellness activity.
            </div>
          )}
        </div>
      )}

      {/* Activity Timer */}
      {isActivityActive && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-cinzel text-blue-800">Activity in Progress</span>
            <Clock className="text-blue-600" size={16} />
          </div>
          <div className="text-2xl font-cinzel font-bold text-blue-900 text-center">
            {formatTime(activityTimeRemaining)}
          </div>
          <ProgressBar 
            progress={((600 - activityTimeRemaining) / 600) * 100} // Assuming 10 min default
            color="primary"
            height="sm"
            animated
          />
        </div>
      )}

      {/* Reward Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-amber-700">
          <Award size={16} className="mr-1 magical-glow" />
          <span className="text-sm font-cinzel">{quest.xpReward} XP</span>
        </div>
        
        <Badge 
          color={quest.targetLocation.discovered ? 'success' : 'warning'} 
          size="sm"
        >
          {quest.targetLocation.discovered ? 'Known Location' : 'Undiscovered'}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {quest.completed ? (
          <Button 
            variant="ghost" 
            fullWidth 
            disabled
            className="font-cinzel"
          >
            Quest Completed!
          </Button>
        ) : !isNearTarget ? (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              fullWidth
              disabled
              className="font-cinzel"
            >
              Travel to Location ({currentDistance ? formatDistance(currentDistance) : 'Unknown'} away)
            </Button>
            
            <Button 
              variant="ghost" 
              fullWidth
              onClick={() => onCancelQuest(quest.id)}
              className="font-cinzel text-red-600 hover:text-red-700"
            >
              Cancel Quest
            </Button>
          </div>
        ) : isActivityActive ? (
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              fullWidth
              onClick={stopActivity}
              icon={<Square size={16} />}
              className="font-cinzel"
            >
              Stop Activity
            </Button>
            
            {activityTimeRemaining === 0 && (
              <Button 
                variant="primary" 
                fullWidth
                onClick={completeQuest}
                className="font-cinzel magical-glow animate-pulse"
              >
                Complete Quest!
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button 
              variant="primary" 
              fullWidth
              onClick={startActivity}
              icon={<Play size={16} />}
              className="font-cinzel magical-glow"
            >
              Start Wellness Activity
            </Button>
            
            <Button 
              variant="outline" 
              fullWidth
              onClick={completeQuest}
              className="font-cinzel"
            >
              Skip Activity & Complete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationQuestPanel;