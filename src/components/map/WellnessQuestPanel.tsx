import React from 'react';
import { MagicalLocation } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Route } from 'lucide-react';

interface WellnessQuestPanelProps {
  locations: MagicalLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  completedQuests: Set<string>;
  onNavigateToLocation: (location: MagicalLocation) => void;
  onMarkPath?: (location: MagicalLocation) => void;
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

  const getQuestDescription = (location: MagicalLocation): string => {
    const questTemplates: Record<string, string[]> = {
      park: [
        'Practice deep breathing exercises for 5 minutes among the ancient trees',
        'Find a peaceful spot and meditate for 10 minutes, connecting with nature\'s energy',
        'Take a slow, mindful walk for 15 minutes, observing the natural world around you'
      ],
      gym: [
        'Complete a 20-minute strength training session to forge your inner warrior',
        'Engage in 15 minutes of cardio to channel your vital energy',
        'Practice balance and flexibility exercises for 10 minutes'
      ],
      library: [
        'Spend 20 minutes reading about personal development or wellness',
        'Journal about your recent learnings for 15 minutes in this sacred space',
        'Practice silent meditation for 10 minutes surrounded by knowledge'
      ],
      cafe: [
        'Engage in meaningful conversation or practice active listening for 15 minutes',
        'Practice mindful eating or drinking, savoring each moment for 10 minutes',
        'Connect with others or practice kindness for 20 minutes'
      ],
      landmark: [
        'Reflect on your personal journey and set intentions for 15 minutes',
        'Practice gratitude meditation for 10 minutes at this sacred site'
      ],
      temple: [
        'Engage in deep meditation or prayer for 20 minutes',
        'Practice mindfulness and seek inner peace for 15 minutes'
      ]
    };

    const templates = questTemplates[location.type] || ['Discover what awaits you at this mystical location'];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Wellness Locations Discovered
        </h3>
        <p className="text-gray-500 font-merriweather">
          Explore the map to discover magical wellness locations near you!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {locations.map(location => {
        const isCompleted = completedQuests.has(location.id);
        const distance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude)
          : null;

        return (
          <div
            key={location.id}
            className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 ${
              isCompleted 
                ? 'border-green-300 bg-green-50' 
                : 'border-amber-200 hover:border-amber-400 hover:shadow-lg'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getLocationIcon(location.type)}</span>
                  <div>
                    <Badge 
                      color={location.type === 'park' ? 'success' : location.type === 'gym' ? 'primary' : 'accent'} 
                      variant="subtle" 
                      className="mb-2"
                    >
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </Badge>
                    <h3 className="font-cinzel font-bold text-amber-800 text-lg">
                      {location.magicalName}
                    </h3>
                    <p className="text-sm text-gray-600 font-merriweather">
                      {location.name}
                    </p>
                  </div>
                </div>
                
                {distance && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-merriweather">
                      {formatDistance(distance)} away
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 font-merriweather text-sm mb-4 leading-relaxed">
                {location.description}
              </p>

              {/* Quest Task */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <h4 className="font-cinzel font-bold text-amber-800 text-sm mb-2">
                  Wellness Quest:
                </h4>
                <p className="text-amber-700 font-merriweather text-sm">
                  {getQuestDescription(location)}
                </p>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-amber-700">
                    <span className="text-lg mr-1">⚡</span>
                    <span className="text-sm font-cinzel font-bold">{location.questReward} XP</span>
                  </div>
                  <div className="flex items-center text-amber-600">
                    <span className="text-lg mr-1">💰</span>
                    <span className="text-sm font-cinzel font-bold">+20 Coins</span>
                  </div>
                </div>

                {location.visitCount > 0 && (
                  <Badge color="accent" size="sm">
                    Visited {location.visitCount}x
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {isCompleted ? (
                  <div className="flex items-center justify-center p-3 bg-green-100 border border-green-300 rounded-lg">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="font-cinzel text-green-800 font-bold">Quest Completed!</span>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigateToLocation(location)}
                      icon={<Navigation size={14} />}
                      className="flex-1 magical-glow"
                    >
                      Navigate to Location
                    </Button>
                    
                    {onMarkPath && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkPath(location)}
                        icon={<Route size={14} />}
                        className="flex-1"
                      >
                        Mark Path
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;