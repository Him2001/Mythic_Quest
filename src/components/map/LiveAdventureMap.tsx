import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import { MapPin, Navigation, Award, Target, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

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

// Custom map component to handle location updates
const MapController: React.FC<{
  userLocation: { latitude: number; longitude: number } | null;
  onLocationUpdate: (locations: WellnessLocation[]) => void;
  markedPath?: WellnessLocation | null;
  onPathUpdate: (path: [number, number][] | null) => void;
}> = ({ userLocation, onLocationUpdate, markedPath, onPathUpdate }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      // Center map on user location
      map.setView([userLocation.latitude, userLocation.longitude], 14);
      
      // Get nearby wellness locations
      const nearbyLocations = locationService.getNearbyLocations(
        userLocation.latitude,
        userLocation.longitude,
        10 // 10km radius
      );
      
      console.log('Found nearby wellness locations:', nearbyLocations);
      onLocationUpdate(nearbyLocations);
    }
  }, [userLocation, map, onLocationUpdate]);

  // Handle marked path
  useEffect(() => {
    if (markedPath && userLocation) {
      const drawPath = async () => {
        try {
          const route = await routingService.getRoute(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: markedPath.latitude, longitude: markedPath.longitude }
          );
          
          if (route) {
            onPathUpdate(route.coordinates);
          }
        } catch (error) {
          console.warn('Failed to get route, using straight line:', error);
          onPathUpdate([
            [userLocation.latitude, userLocation.longitude],
            [markedPath.latitude, markedPath.longitude]
          ]);
        }
      };
      
      drawPath();
    } else {
      onPathUpdate(null);
    }
  }, [markedPath, userLocation, onPathUpdate]);

  return null;
};

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({
  onQuestComplete,
  onLocationUpdate,
  markedPath
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][] | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Get user's current location with better error handling
  useEffect(() => {
    const getCurrentLocation = async () => {
      setIsLoadingLocation(true);
      setLocationError('');

      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        // Use default location (New York City) for demo
        const defaultLocation = { latitude: 40.7829, longitude: -73.9654 };
        setUserLocation(defaultLocation);
        setIsLoadingLocation(false);
        return;
      }

      try {
        // First try to get current position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        });

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        console.log('User location detected:', location);
        setUserLocation(location);

        // Set up location watching for real-time updates
        if (navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setUserLocation(newLocation);
            },
            (error) => {
              console.warn('Location watch error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 30000
            }
          );
        }

      } catch (error) {
        console.warn('Geolocation error:', error);
        setLocationError('Unable to access your location. Using default location for demo.');
        
        // Use default location (New York City) for demo
        const defaultLocation = { latitude: 40.7829, longitude: -73.9654 };
        setUserLocation(defaultLocation);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getCurrentLocation();

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update wellness locations when user location changes
  const handleLocationUpdate = (locations: WellnessLocation[]) => {
    setWellnessLocations(locations);
    onLocationUpdate(locations);
  };

  // Handle quest completion at a location
  const handleLocationQuestComplete = (location: WellnessLocation) => {
    if (!userLocation) return;

    // Check if user is close enough to the location (within 100 meters)
    const distance = locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );

    if (distance <= 100) {
      // Mark location as visited
      locationService.visitLocation(location.id);
      
      // Complete the quest
      onQuestComplete(location.id, location.questReward);
      
      // Update the locations list
      const updatedLocations = wellnessLocations.map(loc =>
        loc.id === location.id
          ? { ...loc, discovered: true, visitCount: loc.visitCount + 1 }
          : loc
      );
      setWellnessLocations(updatedLocations);
      onLocationUpdate(updatedLocations);
    } else {
      alert(`You need to be within 100 meters of ${location.magicalName} to complete this quest. You are currently ${Math.round(distance)} meters away.`);
    }
  };

  // Custom icons for different location types
  const createLocationIcon = (type: string, discovered: boolean) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
    };

    const emoji = iconMap[type] || '📍';
    const opacity = discovered ? '1' : '0.7';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${discovered ? '#10b981' : '#f59e0b'}" stroke="#fff" stroke-width="2" opacity="${opacity}"/>
          <text x="16" y="20" text-anchor="middle" font-size="12" fill="white">${emoji}</text>
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
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  if (isLoadingLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
          <p className="text-amber-800 font-cinzel">Detecting your location...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="mx-auto mb-2 text-red-500" size={32} />
          <p className="text-red-600 font-cinzel mb-2">Location access required</p>
          <p className="text-gray-600 text-sm font-merriweather">
            {locationError || 'Please enable location services to discover wellness locations nearby.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center text-green-700">
          <Navigation size={16} className="mr-2" />
          <span className="font-cinzel text-sm">
            Location detected: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </span>
        </div>
        {locationError && (
          <p className="text-orange-600 text-xs font-merriweather mt-1">{locationError}</p>
        )}
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController
            userLocation={userLocation}
            onLocationUpdate={handleLocationUpdate}
            markedPath={markedPath}
            onPathUpdate={setPathCoordinates}
          />

          {/* User location marker */}
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-cinzel font-bold text-blue-800">Your Location</h3>
                <p className="text-sm font-merriweather">Ready for wellness adventures!</p>
              </div>
            </Popup>
          </Marker>

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
                  <p className="text-xs text-gray-600 font-merriweather mb-2">
                    {location.name}
                  </p>
                  <p className="text-sm font-merriweather mb-3">
                    {location.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cinzel text-amber-700">Quest Reward:</span>
                      <div className="flex items-center">
                        <Award size={12} className="mr-1 text-amber-600" />
                        <span className="font-bold">{location.questReward} XP</span>
                      </div>
                    </div>
                    
                    {location.discovered ? (
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                        <span className="text-green-700 font-cinzel text-xs">
                          ✓ Discovered • Visited {location.visitCount} time{location.visitCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLocationQuestComplete(location)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-cinzel transition-colors"
                      >
                        Complete Quest
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marked path */}
          {pathCoordinates && (
            <Polyline
              positions={pathCoordinates}
              color="#f59e0b"
              weight={4}
              opacity={0.8}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-amber-100">
        <h3 className="font-cinzel font-bold text-amber-800 mb-3 flex items-center">
          <Target size={16} className="mr-2" />
          Map Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Undiscovered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Discovered</span>
          </div>
          {pathCoordinates && (
            <div className="flex items-center">
              <Route size={16} className="text-amber-500 mr-2" />
              <span className="font-merriweather">Marked Path</span>
            </div>
          )}
        </div>
      </div>

      {/* Location Stats */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-cinzel font-bold text-amber-800">
              {wellnessLocations.length}
            </div>
            <div className="text-xs font-merriweather text-amber-700">
              Locations Found
            </div>
          </div>
          <div>
            <div className="text-2xl font-cinzel font-bold text-green-600">
              {wellnessLocations.filter(loc => loc.discovered).length}
            </div>
            <div className="text-xs font-merriweather text-green-700">
              Discovered
            </div>
          </div>
          <div>
            <div className="text-2xl font-cinzel font-bold text-purple-600">
              {wellnessLocations.reduce((total, loc) => total + loc.visitCount, 0)}
            </div>
            <div className="text-xs font-merriweather text-purple-700">
              Total Visits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdventureMap;