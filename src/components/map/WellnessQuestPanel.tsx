import React from 'react';
import { MagicalLocation } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Award, Route } from 'lucide-react';

interface WellnessQuestPanelProps {
  locations: any[];
  userLocation: { latitude: number; longitude: number } | null;
  completedQuests: Set<string>;
  onNavigateToLocation: (location: any) => void;
  onMarkPath?: (location: any) => void;
}

const WellnessQuestPanel: React.FC<WellnessQuestPanelProps> = ({
  locations,
  userLocation,
  completedQuests,
  onNavigateToLocation,
  onMarkPath
}) => {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const getLocationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️',
      temple: '⛩️'
    };
    return iconMap[type] || '📍';
  };

  const getDifficultyColor = (questReward: number): 'success' | 'warning' | 'error' => {
    if (questReward >= 100) return 'error'; // Hard
    if (questReward >= 80) return 'warning'; // Medium
    return 'success'; // Easy
  };

  const getDifficultyLabel = (questReward: number): string => {
    if (questReward >= 100) return 'Master';
    if (questReward >= 80) return 'Adept';
    return 'Apprentice';
  };

  if (locations.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Wellness Locations Discovered
        </h3>
        <p className="text-gray-500 font-merriweather">
          Enable location services to discover magical wellness locations near you!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map(location => {
        const isCompleted = completedQuests.has(location.id);
        const distance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude)
          : null;

        return (
          <Card 
            key={location.id}
            variant="hover" 
            className={`relative border-l-4 ${
              isCompleted ? 'border-l-green-500' : 'border-l-amber-500'
            } fantasy-card`}
          >
            {isCompleted && (
              <div className="absolute top-4 right-4 magical-glow">
                <Award className="text-green-500" size={24} />
              </div>
            )}
            
            <div className="flex flex-col h-full p-5">
              <div className="mb-3 flex items-start justify-between">
                <Badge 
                  color="accent" 
                  variant="default"
                  className="mb-2 magical-glow"
                >
                  <MapPin size={14} className="mr-1" />
                  {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                </Badge>
                <Badge 
                  color={getDifficultyColor(location.questReward)} 
                  variant="subtle"
                >
                  {getDifficultyLabel(location.questReward)}
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{getLocationIcon(location.type)}</span>
                  <div>
                    <h3 className="text-lg font-cinzel font-bold text-mystic-dark magical-glow">
                      {location.magicalName}
                    </h3>
                    <p className="text-sm text-amber-700 font-merriweather">
                      {location.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 font-merriweather flex-1">
                {location.description}
              </p>
              
              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-amber-700">
                  <Award size={16} className="mr-1 magical-glow" />
                  <span className="font-cinzel">{location.questReward} XP</span>
                </div>
                
                {distance && (
                  <div className="flex items-center text-blue-600">
                    <Navigation size={14} className="mr-1" />
                    <span className="font-merriweather">{formatDistance(distance)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {isCompleted ? (
                  <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Award className="text-green-600 mr-2" size={16} />
                    <span className="font-cinzel text-green-800 font-bold">Quest Completed!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      fullWidth
                      onClick={() => onNavigateToLocation(location)}
                      icon={<Navigation size={16} />}
                      className="font-cinzel magical-glow"
                    >
                      Navigate to Location
                    </Button>
                    
                    {onMarkPath && (
                      <Button 
                        variant="outline" 
                        fullWidth
                        onClick={() => onMarkPath(location)}
                        icon={<Route size={16} />}
                        className="font-cinzel"
                      >
                        Mark Path
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;