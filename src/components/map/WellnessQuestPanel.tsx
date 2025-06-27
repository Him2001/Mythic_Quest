import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Target, Award, Clock, Route } from 'lucide-react';

interface WellnessLocation {
  id: string;
  name: string;
  type: 'park' | 'library' | 'gym' | 'cafe' | 'landmark';
  latitude: number;
  longitude: number;
  description: string;
  magicalName: string;
  questReward: number;
  questTask: string;
  discovered: boolean;
  visitCount: number;
}

interface WellnessQuestPanelProps {
  locations: WellnessLocation[];
  userLocation: { latitude: number; longitude: number } | null;
  completedQuests: Set<string>;
  onNavigateToLocation: (location: WellnessLocation) => void;
  onMarkPath: (location: WellnessLocation) => void;
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

  const getLocationTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };
    return iconMap[type] || '📍';
  };

  const getLocationTypeColor = (type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' => {
    const colorMap: Record<string, any> = {
      park: 'success',
      gym: 'primary',
      library: 'accent',
      cafe: 'warning',
      landmark: 'secondary'
    };
    return colorMap[type] || 'primary';
  };

  if (locations.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Wellness Locations Found
        </h3>
        <p className="text-gray-500 font-merriweather">
          We're searching for wellness locations in your area. Please ensure location services are enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locations.map(location => {
        const isCompleted = completedQuests.has(location.id) || location.discovered;
        const distance = userLocation 
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              location.latitude,
              location.longitude
            )
          : null;

        return (
          <div
            key={location.id}
            className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
              isCompleted 
                ? 'border-green-300 bg-green-50' 
                : 'border-amber-200 hover:border-amber-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {getLocationTypeIcon(location.type)}
                </div>
                <div>
                  <h3 className="text-lg font-cinzel font-bold text-amber-800 mb-1">
                    {location.magicalName}
                  </h3>
                  <p className="text-sm text-gray-600 font-merriweather">
                    {location.name}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Badge 
                  color={getLocationTypeColor(location.type)} 
                  className="magical-glow"
                >
                  {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                </Badge>
                
                {distance && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Target size={12} className="mr-1" />
                    <span className="font-merriweather">{formatDistance(distance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quest Description */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-cinzel font-bold text-amber-800 mb-2 flex items-center">
                <Clock size={16} className="mr-2" />
                Wellness Quest
              </h4>
              <p className="text-sm text-amber-700 font-merriweather">
                {location.questTask}
              </p>
            </div>

            {/* Rewards and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-amber-700">
                  <Award size={16} className="mr-1 magical-glow" />
                  <span className="text-sm font-cinzel font-bold">{location.questReward} XP</span>
                </div>
                
                {location.visitCount > 0 && (
                  <div className="flex items-center text-purple-600">
                    <span className="text-sm font-cinzel">
                      Visited {location.visitCount} time{location.visitCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {isCompleted && (
                <Badge color="success" className="magical-glow">
                  ✅ Completed
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateToLocation(location)}
                icon={<Navigation size={16} />}
                className="flex-1 magical-glow"
              >
                Navigate to Location
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkPath(location)}
                icon={<Route size={16} />}
                className="flex-1"
              >
                Mark Path
              </Button>
            </div>

            {/* Location Description */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-merriweather italic">
                {location.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;