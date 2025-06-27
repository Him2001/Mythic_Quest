import React from 'react';
import { MagicalLocation } from '../../types';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Award, Clock, Route } from 'lucide-react';

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
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const calculateDistance = (location: MagicalLocation): number => {
    if (!userLocation) return 0;
    return locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );
  };

  const getLocationTypeColor = (type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' => {
    const colorMap: Record<string, any> = {
      park: 'success',
      gym: 'primary',
      library: 'accent',
      cafe: 'warning',
      landmark: 'secondary',
      temple: 'accent'
    };
    return colorMap[type] || 'primary';
  };

  const sortedLocations = [...locations].sort((a, b) => {
    if (!userLocation) return 0;
    const distanceA = calculateDistance(a);
    const distanceB = calculateDistance(b);
    return distanceA - distanceB;
  });

  if (locations.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Wellness Locations Found
        </h3>
        <p className="text-gray-500 font-merriweather">
          Enable location services to discover magical wellness locations near you!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedLocations.map(location => {
        const distance = calculateDistance(location);
        const isCompleted = completedQuests.has(location.id);
        const quest = locationService.generateLocationQuest(location);

        return (
          <div
            key={location.id}
            className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl fantasy-card ${
              isCompleted 
                ? 'border-green-400 bg-green-50' 
                : 'border-amber-200 hover:border-amber-400'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {locationService.getLocationIcon(location.type)}
                </div>
                <div>
                  <Badge 
                    color={getLocationTypeColor(location.type)} 
                    variant="default"
                    className="mb-2 magical-glow"
                  >
                    {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {isCompleted && (
                <div className="flex items-center text-green-600">
                  <Award size={20} className="magical-glow" />
                </div>
              )}
            </div>

            {/* Location Info */}
            <div className="mb-4">
              <h3 className="text-lg font-cinzel font-bold text-amber-800 mb-1 magical-glow">
                {location.magicalName}
              </h3>
              <p className="text-sm text-gray-600 font-merriweather mb-2">
                {location.name}
              </p>
              <p className="text-sm text-gray-700 font-merriweather leading-relaxed">
                {location.description}
              </p>
            </div>

            {/* Quest Details */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-cinzel font-bold text-amber-800 text-sm mb-2 flex items-center">
                <Award size={14} className="mr-1 magical-glow" />
                {quest.title}
              </h4>
              <p className="text-xs text-amber-700 font-merriweather">
                {quest.description}
              </p>
              {quest.duration && (
                <div className="flex items-center mt-2 text-xs text-amber-600">
                  <Clock size={12} className="mr-1" />
                  <span className="font-cinzel">{quest.duration} minutes</span>
                </div>
              )}
            </div>

            {/* Distance and Rewards */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center text-blue-600">
                <Navigation size={14} className="mr-1" />
                <span className="font-cinzel">
                  {userLocation ? formatDistance(distance) : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                <Award size={12} className="mr-1 magical-glow" />
                <span className="font-cinzel font-bold text-xs">+{location.questReward} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isCompleted ? (
                <div className="flex items-center justify-center p-3 bg-green-100 border border-green-300 rounded-lg">
                  <Award className="text-green-600 mr-2" size={16} />
                  <span className="font-cinzel text-green-800 font-bold text-sm">
                    Quest Completed!
                  </span>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => onNavigateToLocation(location)}
                    icon={<Navigation size={14} />}
                    className="font-cinzel magical-glow"
                  >
                    Navigate to Location
                  </Button>
                  
                  {onMarkPath && (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => onMarkPath(location)}
                      icon={<Route size={14} />}
                      className="font-cinzel"
                    >
                      Mark Path
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Visit Count */}
            {location.visitCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <span className="text-xs text-gray-500 font-cinzel">
                  Visited {location.visitCount} time{location.visitCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;