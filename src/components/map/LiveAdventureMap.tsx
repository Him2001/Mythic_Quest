import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import { MagicalLocation } from '../../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface LiveAdventureMapProps {
  onQuestComplete: (questId: string, xpReward: number) => void;
  onLocationUpdate: (locations: WellnessLocation[]) => void;
  markedPath?: WellnessLocation | null;
}

// Component to handle map updates
const MapUpdater: React.FC<{
  center: [number, number];
  userLocation: [number, number] | null;
  wellnessLocations: WellnessLocation[];
  markedPath?: WellnessLocation | null;
}> = ({ center, userLocation, wellnessLocations, markedPath }) => {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    map.setView(center, 13);
  }, [map, center]);

  // Handle path marking
  useEffect(() => {
    if (markedPath && userLocation) {
      const getRoute = async () => {
        try {
          const route = await routingService.getRoute(
            { latitude: userLocation[0], longitude: userLocation[1] },
            { latitude: markedPath.latitude, longitude: markedPath.longitude }
          );
          
          if (route) {
            setRouteCoordinates(route.coordinates as [number, number][]);
          }
        } catch (error) {
          console.warn('Failed to get route:', error);
          // Fallback to straight line
          setRouteCoordinates([userLocation, [markedPath.latitude, markedPath.longitude]]);
        }
      };
      
      getRoute();
    } else {
      setRouteCoordinates([]);
    }
  }, [markedPath, userLocation]);

  return (
    <>
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </>
  );
};

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({
  onQuestComplete,
  onLocationUpdate,
  markedPath
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7829, -73.9654]); // Default to Central Park
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  // Initialize location detection
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        console.log('🗺️ Initializing location detection...');
        
        // Get user's current location
        const location = await locationService.getCurrentLocation();
        console.log('📍 User location detected:', location);
        
        const userPos: [number, number] = [location.latitude, location.longitude];
        setUserLocation(userPos);
        setMapCenter(userPos);
        
        // Find nearby wellness locations (limit to 5 nearest)
        console.log('🔍 Searching for nearby wellness locations...');
        const nearbyLocations = locationService.getNearbyLocations(
          location.latitude,
          location.longitude,
          25 // 25km radius
        );
        
        // Take only the 5 nearest locations
        const nearest5Locations = nearbyLocations.slice(0, 5);
        console.log('🏃‍♀️ Found 5 nearest wellness locations:', nearest5Locations.map(l => l.name));
        
        // Convert to WellnessLocation format and generate quests
        const wellnessLocs: WellnessLocation[] = nearest5Locations.map(loc => {
          const quest = locationService.generateLocationQuest(loc);
          return {
            id: loc.id,
            name: loc.name,
            type: loc.type,
            latitude: loc.latitude,
            longitude: loc.longitude,
            description: loc.description,
            magicalName: loc.magicalName,
            questReward: loc.questReward,
            questTask: quest.description,
            discovered: loc.discovered,
            visitCount: loc.visitCount
          };
        });
        
        setWellnessLocations(wellnessLocs);
        onLocationUpdate(wellnessLocs);
        
        console.log('✅ Wellness locations loaded successfully:', wellnessLocs.length);
        
        // Start watching for location changes
        if (navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
              setUserLocation(newPos);
              
              // Check for quest completion (within 100m of any location)
              wellnessLocs.forEach(location => {
                const isNear = locationService.checkLocationProximity(
                  position.coords.latitude,
                  position.coords.longitude,
                  location,
                  100 // 100 meters
                );
                
                if (isNear && !location.discovered) {
                  console.log(`🎯 Quest completed at ${location.name}!`);
                  locationService.visitLocation(location.id);
                  onQuestComplete(location.id, location.questReward);
                }
              });
            },
            (error) => {
              console.warn('Location watch error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000
            }
          );
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize location:', error);
        setError('Failed to detect location. Using default NYC area.');
        
        // Fallback: Use default NYC location and show nearby locations
        const defaultLocation = { latitude: 40.7829, longitude: -73.9654 };
        const fallbackLocations = locationService.getNearbyLocations(
          defaultLocation.latitude,
          defaultLocation.longitude,
          25
        ).slice(0, 5);
        
        const wellnessLocs: WellnessLocation[] = fallbackLocations.map(loc => {
          const quest = locationService.generateLocationQuest(loc);
          return {
            id: loc.id,
            name: loc.name,
            type: loc.type,
            latitude: loc.latitude,
            longitude: loc.longitude,
            description: loc.description,
            magicalName: loc.magicalName,
            questReward: loc.questReward,
            questTask: quest.description,
            discovered: loc.discovered,
            visitCount: loc.visitCount
          };
        });
        
        setWellnessLocations(wellnessLocs);
        onLocationUpdate(wellnessLocs);
        setMapCenter([defaultLocation.latitude, defaultLocation.longitude]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onQuestComplete, onLocationUpdate]);

  // Create custom icons for different location types
  const createLocationIcon = (type: string, discovered: boolean) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };
    
    const emoji = iconMap[type] || '📍';
    const opacity = discovered ? '0.6' : '1.0';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${discovered ? '#10b981' : '#f59e0b'}" stroke="#fff" stroke-width="2" opacity="${opacity}"/>
          <text x="16" y="20" text-anchor="middle" font-size="12">${emoji}</text>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // User location icon
  const userIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
          <p className="text-amber-800 font-cinzel">Detecting wellness locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm font-merriweather">{error}</p>
        </div>
      )}
      
      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater
            center={mapCenter}
            userLocation={userLocation}
            wellnessLocations={wellnessLocations}
            markedPath={markedPath}
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-cinzel font-bold text-blue-800">Your Location</h3>
                  <p className="text-sm font-merriweather">You are here!</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Wellness location markers */}
          {wellnessLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createLocationIcon(location.type, location.discovered)}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-cinzel font-bold text-amber-800 mb-1">
                    {location.magicalName}
                  </h3>
                  <p className="text-sm text-gray-600 font-merriweather mb-2">
                    {location.name}
                  </p>
                  <p className="text-xs text-gray-700 font-merriweather mb-2">
                    {location.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-cinzel text-amber-700">
                      Reward: {location.questReward} XP
                    </span>
                    <span className="font-cinzel text-green-600">
                      {location.discovered ? '✅ Discovered' : '📍 Undiscovered'}
                    </span>
                  </div>
                  {location.visitCount > 0 && (
                    <p className="text-xs text-purple-600 font-cinzel mt-1">
                      Visited {location.visitCount} time{location.visitCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Location stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="text-green-700 font-cinzel font-bold text-lg">
            {wellnessLocations.filter(l => l.discovered).length}
          </div>
          <div className="text-green-600 text-xs font-merriweather">Discovered</div>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <div className="text-amber-700 font-cinzel font-bold text-lg">
            {wellnessLocations.length}
          </div>
          <div className="text-amber-600 text-xs font-merriweather">Total Locations</div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-blue-700 font-cinzel font-bold text-lg">
            {wellnessLocations.reduce((sum, l) => sum + l.visitCount, 0)}
          </div>
          <div className="text-blue-600 text-xs font-merriweather">Total Visits</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="text-purple-700 font-cinzel font-bold text-lg">
            {wellnessLocations.reduce((sum, l) => sum + l.questReward, 0)}
          </div>
          <div className="text-purple-600 text-xs font-merriweather">Total XP Available</div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdventureMap;