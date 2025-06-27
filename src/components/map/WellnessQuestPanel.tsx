import React from 'react';
import { MagicalLocation } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MapPin, Navigation, Award, CheckCircle, Target, Sparkles } from 'lucide-react';

interface WellnessQuestPanelProps {
  locations: MagicalLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  completedQuests: Set<string>;
  onNavigateToLocation: (location: MagicalLocation) => void;
}

const WellnessQuestPanel: React.FC<WellnessQuestPanelProps> = ({
  locations,
  userLocation,
  completedQuests,
  onNavigateToLocation
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

  const getLocationTypeColor = (type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' => {
    const colorMap: Record<string, any> = {
      park: 'success',
      gym: 'primary',
      library: 'accent',
      cafe: 'warning',
      landmark: 'secondary',
      temple: 'primary'
    };
    return colorMap[type] || 'primary';
  };

  if (locations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Target className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          Discovering Wellness Locations...
        </h3>
        <p className="text-gray-500 font-merriweather">
          Allow location access to discover magical wellness quests near you!
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
        const isNearby = distance !== null && distance <= 50; // Within 50 meters

        return (
          <Card 
            key={location.id}
            variant="hover" 
            className={`relative border-l-4 ${
              isCompleted ? 'border-l-green-500' : isNearby ? 'border-l-blue-500' : 'border-l-amber-500'
            } fantasy-card`}
          >
            {isCompleted && (
              <div className="absolute top-4 right-4 magical-glow">
                <CheckCircle className="text-green-500" size={24} />
              </div>
            )}
            
            {isNearby && !isCompleted && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <Sparkles className="text-blue-500" size={20} />
                </div>
              </div>
            )}
            
            <div className="flex flex-col h-full p-5">
              <div className="mb-3 flex items-start justify-between">
                <Badge 
                  color={getLocationTypeColor(location.type)} 
                  variant="default"
                  className="mb-2 magical-glow"
                >
                  <MapPin size={14} className="mr-1" />
                  {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                </Badge>
                
                {distance !== null && (
                  <span className="text-xs text-gray-500 font-cinzel">
                    {formatDistance(distance)}
                  </span>
                )}
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-cinzel font-bold text-mystic-dark mb-1">
                  {getLocationIcon(location.type)} {location.magicalName}
                </h3>
                <p className="text-sm text-amber-700 font-merriweather">
                  {location.name}
                </p>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 font-merriweather flex-grow">
                {location.description}
              </p>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-700">
                    <Award size={16} className="mr-1 magical-glow" />
                    <span className="text-sm font-cinzel">{location.questReward} XP</span>
                  </div>
                  
                  {isNearby && !isCompleted && (
                    <Badge color="primary" size="sm" className="animate-pulse">
                      <Target size={12} className="mr-1" />
                      In Range!
                    </Badge>
                  )}
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="text-green-600 mr-2" size={16} />
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
                    
                    {isNearby && (
                      <div className="text-center">
                        <p className="text-xs text-blue-600 font-cinzel">
                          <Sparkles size={12} className="inline mr-1" />
                          You're close! Quest will auto-complete when you arrive.
                        </p>
                      </div>
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