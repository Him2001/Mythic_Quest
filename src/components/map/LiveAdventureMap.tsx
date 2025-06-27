import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import { MapPin, Navigation, Award, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
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
  discovered: boolean;
  visitCount: number;
}

interface LiveAdventureMapProps {
  onQuestComplete: (locationId: string, xpReward: number) => void;
  onLocationUpdate: (locations: WellnessLocation[]) => void;
}

interface MapRef {
  markPathToLocation: (location: WellnessLocation, userLocation: { latitude: number; longitude: number }) => void;
}

// Component to handle map updates
const MapUpdater: React.FC<{
  userLocation: { latitude: number; longitude: number } | null;
  pathCoordinates: [number, number][];
}> = ({ userLocation, pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation, map]);

  return null;
};

const LiveAdventureMap = forwardRef<MapRef, LiveAdventureMapProps>(({
  onQuestComplete,
  onLocationUpdate
}, ref) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][]>([]);
  const [selectedLocation, setSelectedLocation] = useState<WellnessLocation | null>(null);
  const mapRef = useRef<any>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    markPathToLocation: async (location: WellnessLocation, userLoc: { latitude: number; longitude: number }) => {
      try {
        const route = await routingService.getRoute(
          { latitude: userLoc.latitude, longitude: userLoc.longitude },
          { latitude: location.latitude, longitude: location.longitude }
        );

        if (route) {
          setPathCoordinates(route.coordinates);
          setSelectedLocation(location);
          
          // Fit map to show both user location and destination
          if (mapRef.current) {
            const bounds = [
              [userLoc.latitude, userLoc.longitude],
              [location.latitude, location.longitude]
            ];
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (error) {
        console.error('Failed to mark path:', error);
      }
    }
  }));

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyLocations();
    }
  }, [userLocation]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Failed to get user location:', error);
      setLocationError('Location access denied. Using default location for demo.');
      
      // Use a default location (New York City) for demo
      const defaultLocation = { latitude: 40.7128, longitude: -74.0060 };
      setUserLocation(defaultLocation);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadNearbyLocations = () => {
    if (!userLocation) return;

    const nearbyLocations = locationService.getNearbyLocations(
      userLocation.latitude,
      userLocation.longitude,
      25 // 25km radius
    );

    setWellnessLocations(nearbyLocations);
    onLocationUpdate(nearbyLocations);
  };

  const handleQuestAtLocation = (location: WellnessLocation) => {
    if (!userLocation) return;

    const isNearby = locationService.checkLocationProximity(
      userLocation.latitude,
      userLocation.longitude,
      location,
      100 // 100 meters threshold
    );

    if (isNearby) {
      locationService.visitLocation(location.id);
      onQuestComplete(location.id, location.questReward);
      
      // Update the location in our state
      setWellnessLocations(prev => 
        prev.map(loc => 
          loc.id === location.id 
            ? { ...loc, discovered: true, visitCount: loc.visitCount + 1 }
            : loc
        )
      );
    } else {
      alert('You need to be closer to this location to complete the quest!');
    }
  };

  const clearPath = () => {
    setPathCoordinates([]);
    setSelectedLocation(null);
  };

  const createCustomIcon = (type: string, isDiscovered: boolean) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };

    const emoji = iconMap[type] || '📍';
    const opacity = isDiscovered ? '0.7' : '1.0';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${isDiscovered ? '#10B981' : '#F59E0B'}" stroke="#fff" stroke-width="2" opacity="${opacity}"/>
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
        <circle cx="15" cy="15" r="12" fill="#3B82F6" stroke="#fff" stroke-width="3"/>
        <circle cx="15" cy="15" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  if (isLoadingLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Discovering your location...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
            Location Required
          </h3>
          <p className="text-gray-500 font-merriweather mb-4">
            {locationError || 'Unable to access your location. Please enable location services.'}
          </p>
          <Button
            variant="primary"
            onClick={getCurrentLocation}
            icon={<Navigation size={16} />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater userLocation={userLocation} pathCoordinates={pathCoordinates} />
          
          {/* User location marker */}
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

          {/* Wellness location markers */}
          {wellnessLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon(location.type, location.discovered)}
            >
              <Popup>
                <div className="max-w-xs">
                  <div className="flex items-center mb-2">
                    <Badge 
                      color={location.discovered ? 'success' : 'warning'}
                      size="sm"
                      className="mr-2"
                    >
                      {location.type}
                    </Badge>
                    {location.discovered && (
                      <Badge color="success" size="sm">
                        Discovered
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-cinzel font-bold text-purple-800 mb-1">
                    {location.magicalName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{location.name}</p>
                  <p className="text-xs text-gray-700 mb-3">{location.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-600">
                      <Award size={14} className="mr-1" />
                      <span className="text-sm font-cinzel">{location.questReward} XP</span>
                    </div>
                    {location.visitCount > 0 && (
                      <span className="text-xs text-gray-500">
                        Visited {location.visitCount}x
                      </span>
                    )}
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleQuestAtLocation(location)}
                    disabled={location.discovered}
                    className="font-cinzel"
                  >
                    {location.discovered ? 'Quest Completed' : 'Complete Quest'}
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Path polyline */}
          {pathCoordinates.length > 0 && (
            <Polyline
              positions={pathCoordinates}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Path controls */}
      {pathCoordinates.length > 0 && selectedLocation && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-cinzel font-bold text-amber-800">
              Path to {selectedLocation.magicalName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPath}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
          <p className="text-xs text-gray-600 font-merriweather">
            Follow the blue dashed line to reach your destination
          </p>
        </div>
      )}

      {/* Location error banner */}
      {locationError && (
        <div className="absolute bottom-4 left-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
          <div className="flex items-center text-orange-700 text-sm">
            <AlertCircle size={16} className="mr-2" />
            <span className="font-merriweather">{locationError}</span>
          </div>
        </div>
      )}
    </div>
  );
});

LiveAdventureMap.displayName = 'LiveAdventureMap';

export default LiveAdventureMap;