import React from 'react';
import { MagicalLocation } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Route } from 'lucide-react';

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

  const getDifficultyColor = (reward: number): string => {
    if (reward >= 100) return 'text-red-600';
    if (reward >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
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
          <div
            key={location.id}
            className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
              isCompleted 
                ? 'border-green-300 bg-green-50' 
                : 'border-amber-200 hover:border-amber-400'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getLocationIcon(location.type)}</span>
                  <Badge 
                    color={location.type === 'park' ? 'success' : location.type === 'gym' ? 'primary' : 'accent'}
                    className="capitalize"
                  >
                    {location.type}
                  </Badge>
                </div>
                {isCompleted && (
                  <Badge color="success" variant="subtle">
                    ✓ Completed
                  </Badge>
                )}
              </div>

              {/* Location Info */}
              <div className="mb-4">
                <h3 className="text-lg font-cinzel font-bold text-purple-800 mb-1">
                  {location.magicalName}
                </h3>
                <p className="text-sm text-gray-600 font-merriweather mb-2">
                  {location.name}
                </p>
                <p className="text-sm text-gray-700 font-merriweather">
                  {location.description}
                </p>
              </div>

              {/* Quest Details */}
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-cinzel font-bold text-amber-800">
                    Quest Reward
                  </span>
                  <span className={`text-sm font-cinzel font-bold ${getDifficultyColor(location.questReward)}`}>
                    {location.questReward} XP
                  </span>
                </div>
                <p className="text-xs text-amber-700 font-merriweather">
                  Complete a wellness activity at this mystical location
                </p>
              </div>

              {/* Distance */}
              {distance && (
                <div className="mb-4 flex items-center text-sm text-gray-600">
                  <Navigation size={14} className="mr-1" />
                  <span className="font-merriweather">{formatDistance(distance)} away</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => onNavigateToLocation(location)}
                  icon={<Navigation size={16} />}
                  className="font-cinzel magical-glow"
                  disabled={isCompleted}
                >
                  Navigate to Location
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => onMarkPath && onMarkPath(location)}
                  icon={<Route size={16} />}
                  className="font-cinzel"
                  disabled={isCompleted}
                >
                  Mark Path
                </Button>
              </div>

              {/* Visit Count */}
              {location.visitCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-merriweather text-center">
                    Visited {location.visitCount} time{location.visitCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;