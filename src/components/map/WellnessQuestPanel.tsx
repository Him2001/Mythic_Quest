import React from 'react';
import { MapPin, Navigation, Award, Clock, Route, Target } from 'lucide-react';
import Button from '../ui/Button';

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

  const getLocationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };
    return iconMap[type] || '📍';
  };

  const getQuestTask = (location: WellnessLocation): string => {
    const questTasks: Record<string, string[]> = {
      park: [
        'Practice deep breathing for 5 minutes among the trees',
        'Take a mindful walk and observe nature for 10 minutes',
        'Find a peaceful spot for 5 minutes of gratitude meditation',
        'Do gentle stretching exercises in the fresh air'
      ],
      gym: [
        'Complete a 20-minute strength training session',
        'Engage in 15 minutes of cardio exercise',
        'Practice balance and flexibility for 10 minutes',
        'Join a group fitness class or workout'
      ],
      library: [
        'Read about wellness or personal development for 20 minutes',
        'Journal about your wellness journey for 15 minutes',
        'Practice silent meditation for 10 minutes',
        'Research a new healthy recipe or wellness tip'
      ],
      cafe: [
        'Practice mindful eating or drinking for 10 minutes',
        'Engage in meaningful conversation for 15 minutes',
        'Write in your wellness journal while enjoying a healthy beverage',
        'Practice gratitude while observing the community around you'
      ],
      landmark: [
        'Reflect on your personal journey for 15 minutes',
        'Practice gratitude meditation at this special place',
        'Set wellness intentions while taking in the view',
        'Take photos to document your wellness journey'
      ]
    };

    const tasks = questTasks[location.type] || ['Complete a wellness activity at this location'];
    return tasks[Math.floor(Math.random() * tasks.length)];
  };

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <MapPin className="mx-auto mb-3 text-gray-400" size={32} />
        <h3 className="text-lg font-cinzel font-bold text-gray-600 mb-2">
          Discovering Wellness Locations...
        </h3>
        <p className="text-gray-500 font-merriweather">
          We're scanning the mystical realm for wellness opportunities near you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locations.map(location => {
        const distance = userLocation 
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              location.latitude,
              location.longitude
            )
          : 0;

        const isCompleted = completedQuests.has(location.id) || location.discovered;
        const questTask = getQuestTask(location);

        return (
          <div
            key={location.id}
            className={`bg-white rounded-lg shadow-md border-l-4 p-5 transition-all duration-200 hover:shadow-lg ${
              isCompleted 
                ? 'border-l-green-500 bg-green-50' 
                : 'border-l-amber-500 hover:border-l-amber-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getLocationIcon(location.type)}</span>
                <div>
                  <h3 className="font-cinzel font-bold text-amber-800 text-lg">
                    {location.magicalName}
                  </h3>
                  <p className="text-sm text-gray-600 font-merriweather">
                    {location.name}
                  </p>
                </div>
              </div>
              
              {isCompleted && (
                <div className="flex items-center text-green-600">
                  <Target size={16} className="mr-1" />
                  <span className="text-sm font-cinzel">Discovered</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 font-merriweather mb-4 leading-relaxed">
              {location.description}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <h4 className="font-cinzel font-bold text-amber-800 mb-2 flex items-center">
                <Clock size={14} className="mr-1" />
                Wellness Quest
              </h4>
              <p className="text-sm text-amber-700 font-merriweather">
                {questTask}
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-amber-700">
                  <Award size={16} className="mr-1" />
                  <span className="text-sm font-cinzel font-bold">{location.questReward} XP</span>
                </div>
                
                {userLocation && (
                  <div className="flex items-center text-blue-600">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-sm font-merriweather">{formatDistance(distance)}</span>
                  </div>
                )}

                {location.visitCount > 0 && (
                  <div className="flex items-center text-green-600">
                    <Target size={14} className="mr-1" />
                    <span className="text-sm font-cinzel">
                      Visited {location.visitCount} time{location.visitCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkPath(location)}
                icon={<Route size={16} />}
                className="flex-1 font-cinzel"
              >
                Mark Path
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateToLocation(location)}
                icon={<Navigation size={16} />}
                className="flex-1 font-cinzel magical-glow"
              >
                Navigate to Location
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WellnessQuestPanel;