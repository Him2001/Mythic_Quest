import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Target, Zap, Coins, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
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
  onQuestComplete: (locationId: string, xpReward: number) => void;
  onLocationUpdate: (locations: WellnessLocation[]) => void;
  markedPath?: WellnessLocation | null;
}

// Component to handle map updates
const MapUpdater: React.FC<{ 
  userLocation: { latitude: number; longitude: number } | null;
  markedPath?: WellnessLocation | null;
}> = ({ userLocation, markedPath }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (markedPath && userLocation) {
      // Fit bounds to show both user location and marked path destination
      const bounds = [
        [userLocation.latitude, userLocation.longitude],
        [markedPath.latitude, markedPath.longitude]
      ] as [number, number][];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markedPath, userLocation, map]);

  return null;
};

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({ 
  onQuestComplete, 
  onLocationUpdate,
  markedPath 
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][]>([]);
  const mapRef = useRef<any>(null);

  // Get user location and nearby wellness locations
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Try to get user's current location
        let currentLocation;
        try {
          currentLocation = await locationService.getCurrentLocation();
          setUserLocation(currentLocation);
        } catch (locationError) {
          console.warn('Could not get user location:', locationError);
          // Use a default location (New York City) for demo
          currentLocation = { latitude: 40.7128, longitude: -74.0060 };
          setUserLocation(currentLocation);
          setError('Using demo location. Enable location services for personalized experience.');
        }

        // Get nearby wellness locations
        const nearbyLocations = locationService.getNearbyLocations(
          currentLocation.latitude,
          currentLocation.longitude,
          25 // 25km radius
        );

        // Convert to our format
        const formattedLocations: WellnessLocation[] = nearbyLocations.map(location => ({
          ...location,
          questTask: locationService.generateLocationQuest(location).description
        }));

        setWellnessLocations(formattedLocations);
        onLocationUpdate(formattedLocations);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setError('Failed to load wellness locations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [onLocationUpdate]);

  // Update path when markedPath changes
  useEffect(() => {
    const updatePath = async () => {
      if (markedPath && userLocation) {
        try {
          const route = await routingService.getRoute(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: markedPath.latitude, longitude: markedPath.longitude }
          );
          
          if (route) {
            setPathCoordinates(route.coordinates);
          }
        } catch (error) {
          console.warn('Failed to get route:', error);
          // Fallback to straight line
          setPathCoordinates([
            [userLocation.latitude, userLocation.longitude],
            [markedPath.latitude, markedPath.longitude]
          ]);
        }
      } else {
        setPathCoordinates([]);
      }
    };

    updatePath();
  }, [markedPath, userLocation]);

  const handleQuestComplete = (location: WellnessLocation) => {
    if (!userLocation) return;

    const distance = locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );

    // Check if user is within 100 meters of the location
    if (distance <= 100) {
      locationService.visitLocation(location.id);
      onQuestComplete(location.id, location.questReward);
      
      // Update the location's visit count
      setWellnessLocations(prev => 
        prev.map(loc => 
          loc.id === location.id 
            ? { ...loc, visitCount: loc.visitCount + 1, discovered: true }
            : loc
        )
      );
    } else {
      alert(`You need to be within 100 meters of ${location.magicalName} to complete this quest. You are currently ${Math.round(distance)}m away.`);
    }
  };

  const createCustomIcon = (type: string, isCompleted: boolean = false) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };

    const emoji = iconMap[type] || '📍';
    const bgColor = isCompleted ? '#10B981' : '#F59E0B';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${bgColor}" stroke="#fff" stroke-width="2"/>
          <text x="20" y="28" text-anchor="middle" font-size="16">${emoji}</text>
        </svg>
      `)}`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  const userIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="15" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Loading magical wellness locations...</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [40.7128, -74.0060]; // NYC default

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm font-merriweather">{error}</p>
        </div>
      )}
      
      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater userLocation={userLocation} markedPath={markedPath} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-cinzel font-bold text-blue-800">Your Location</h3>
                  <p className="text-sm text-gray-600">You are here!</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Wellness location markers */}
          {wellnessLocations.map(location => {
            const isCompleted = location.visitCount > 0;
            
            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={createCustomIcon(location.type, isCompleted)}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{locationService.getLocationIcon(location.type)}</span>
                      <div>
                        <h3 className="font-cinzel font-bold text-amber-800">{location.magicalName}</h3>
                        <p className="text-xs text-gray-600">{location.name}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 font-merriweather">{location.description}</p>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                      <p className="text-xs text-amber-700 font-merriweather">
                        <strong>Quest:</strong> {location.questTask}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-amber-700">
                          <Zap size={14} className="mr-1" />
                          <span className="text-xs font-cinzel">{location.questReward} XP</span>
                        </div>
                        <div className="flex items-center text-amber-600">
                          <Coins size={14} className="mr-1" />
                          <Plus size={8} className="mr-1" />
                          <span className="text-xs font-cinzel">20</span>
                        </div>
                      </div>
                      
                      {location.visitCount > 0 && (
                        <Badge color="success" size="sm">
                          Visited {location.visitCount}x
                        </Badge>
                      )}
                    </div>
                    
                    {isCompleted ? (
                      <div className="text-center p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-green-600 text-xs font-cinzel">✅ Quest Completed!</span>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleQuestComplete(location)}
                        icon={<Target size={14} />}
                        className="magical-glow"
                      >
                        Complete Quest
                      </Button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Path polyline */}
          {pathCoordinates.length > 0 && (
            <Polyline
              positions={pathCoordinates}
              color="#F59E0B"
              weight={4}
              opacity={0.8}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>
      
      {markedPath && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <Navigation className="text-amber-600 mr-2" size={16} />
            <span className="font-cinzel text-amber-800">
              Path marked to <strong>{markedPath.magicalName}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAdventureMap;