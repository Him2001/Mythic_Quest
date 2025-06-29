import React, { useState, useEffect } from 'react';
import LiveAdventureMap from '../components/map/LiveAdventureMap';
import WellnessQuestPanel from '../components/map/WellnessQuestPanel';
import { generateChronicle } from '../utils/generateChronicle';
import { Map, Compass, Sparkles, MapPin, Target, Award } from 'lucide-react';

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

interface AdventureMapPageProps {
  onQuestComplete: (questId: string, xpReward: number) => void;
  onChronicleAdd: (chronicle: any) => void;
}

const AdventureMapPage: React.FC<AdventureMapPageProps> = ({
  onQuestComplete,
  onChronicleAdd
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const handleLocationUpdate = (locations: WellnessLocation[]) => {
    setWellnessLocations(locations);
  };

  const handleQuestComplete = async (locationId: string, xpReward: number) => {
    if (completedQuests.has(locationId)) return;

    const location = wellnessLocations.find(loc => loc.id === locationId);
    if (!location) return;

    // Mark quest as completed
    setCompletedQuests(prev => new Set([...prev, locationId]));
    setTotalXPEarned(prev => prev + xpReward);
    
    // Award XP through parent component
    onQuestComplete(locationId, xpReward);
    
    // Generate chronicle entry
    try {
      const journalEntry = `I completed a wellness quest at ${location.magicalName} (${location.name}). ${location.questTask} This experience brought me peace and renewed energy.`;
      
      const chronicle = await generateChronicle({
        journalEntry,
        completedQuests: [{
          id: locationId,
          title: `Quest at ${location.magicalName}`,
          type: 'location' as const,
          xpReward: xpReward,
          description: location.questTask,
          difficulty: 'medium' as const,
          completed: true
        }],
        recentInteractions: []
      });
      
      onChronicleAdd(chronicle);
    } catch (error) {
      console.error('Failed to generate chronicle:', error);
    }
  };

  const handleNavigateToLocation = (location: WellnessLocation) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to just showing the location
      const url = `https://www.google.com/maps/search/${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <Map className="text-amber-600 mr-3 magical-glow" size={24} sm:size={28} />
            <div>
              <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-800 magical-glow">
                Live Adventure Map
              </h1>
              <p className="text-amber-700 font-merriweather flex items-center text-sm sm:text-base">
                <Compass size={14} sm:size={16} className="mr-2" />
                Discover real wellness locations and complete mindful quests
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="bg-green-50 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-green-200">
              <div className="flex items-center text-green-700">
                <Target size={14} sm:size={16} className="mr-1" />
                <span className="font-cinzel font-bold text-sm sm:text-base">{completedQuests.size}</span>
                <span className="text-xs sm:text-sm ml-1">Completed</span>
              </div>
            </div>
            
            <div className="bg-amber-50 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-amber-200">
              <div className="flex items-center text-amber-700">
                <Award size={14} sm:size={16} className="mr-1 magical-glow" />
                <span className="font-cinzel font-bold text-sm sm:text-base">{totalXPEarned}</span>
                <span className="text-xs sm:text-sm ml-1">XP Earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-4 sm:mb-6">
        <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
          <LiveAdventureMap
            onQuestComplete={handleQuestComplete}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      </div>

      {/* Quest Panel */}
      <div className="max-w-full">
        <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-800 mb-3 sm:mb-4 flex items-center magical-glow">
          <Compass className="mr-2" size={18} sm:size={20} />
          Active Wellness Quests
          <span className="ml-2 text-xs sm:text-sm text-amber-600">({wellnessLocations.length} locations discovered)</span>
        </h2>
        
        <WellnessQuestPanel
          locations={wellnessLocations}
          userLocation={userLocation}
          completedQuests={completedQuests}
          onNavigateToLocation={handleNavigateToLocation}
        />
      </div>
    </div>
  );
};

export default AdventureMapPage;