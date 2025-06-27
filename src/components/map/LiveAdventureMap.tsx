import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MagicalLocation } from '../../types';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Award, Navigation, Target, Zap, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LiveAdventureMapProps {
  onQuestComplete: (locationId: string, xpReward: number) => void;
  onLocationUpdate: (locations: MagicalLocation[]) => void;
  markedPath?: MagicalLocation | null;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: LatLngTuple; markedPath?: MagicalLocation | null; userLocation?: LatLngTuple | null }> = ({ 
  center, 
  markedPath, 
  userLocation 
}) => {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngTuple[]>([]);

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  useEffect(() => {
    const drawRoute = async () => {
      if (markedPath && userLocation) {
        try {
          const route = await routingService.getRoute(
            { latitude: userLocation[0], longitude: userLocation[1] },
            { latitude: markedPath.latitude, longitude: markedPath.longitude }
          );
          
          if (route) {
            setRouteCoordinates(route.coordinates as LatLngTuple[]);
          }
        } catch (error) {
          console.error('Failed to get route:', error);
          // Fallback to straight line
          setRouteCoordinates([userLocation, [markedPath.latitude, markedPath.longitude]]);
        }
      } else {
        setRouteCoordinates([]);
      }
    };

    drawRoute();
  }, [markedPath, userLocation]);

  return routeCoordinates.length > 0 ? (
    <Polyline
      positions={routeCoordinates}
      color="#f59e0b"
      weight={4}
      opacity={0.8}
      dashArray="10, 10"
    />
  ) : null;
};

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({ 
  onQuestComplete, 
  onLocationUpdate,
  markedPath 
}) => {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<MagicalLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MagicalLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string>('');
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);

  // Default center (New York City) for demo purposes
  const defaultCenter: LatLngTuple = [40.7128, -74.0060];
  const mapCenter = userLocation || defaultCenter;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyLocations();
    }
  }, [userLocation]);

  useEffect(() => {
    onLocationUpdate(nearbyLocations);
  }, [nearbyLocations, onLocationUpdate]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation([location.latitude, location.longitude]);
    } catch (error) {
      console.warn('Failed to get user location:', error);
      setLocationError('Location access denied. Using default location for demo.');
      // Use default location for demo
      setUserLocation(defaultCenter);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadNearbyLocations = () => {
    if (!userLocation) return;

    const locations = locationService.getNearbyLocations(
      userLocation[0],
      userLocation[1],
      25 // 25km radius
    );

    setNearbyLocations(locations);
  };

  const handleQuestComplete = (location: MagicalLocation) => {
    if (completedQuests.has(location.id)) return;

    // Mark as completed
    setCompletedQuests(prev => new Set([...prev, location.id]));
    
    // Visit the location
    locationService.visitLocation(location.id);
    
    // Update the location in our state
    setNearbyLocations(prev => 
      prev.map(loc => 
        loc.id === location.id 
          ? { ...loc, discovered: true, visitCount: loc.visitCount + 1 }
          : loc
      )
    );

    // Notify parent component
    onQuestComplete(location.id, location.questReward);
    
    // Close popup
    setSelectedLocation(null);
  };

  const checkProximity = (location: MagicalLocation): boolean => {
    if (!userLocation) return false;
    
    return locationService.checkLocationProximity(
      userLocation[0],
      userLocation[1],
      location,
      100 // 100 meter threshold
    );
  };

  // Custom icons for different location types
  const getLocationIcon = (location: MagicalLocation): Icon => {
    const isCompleted = completedQuests.has(location.id);
    const isNearby = checkProximity(location);
    
    let iconColor = '#3b82f6'; // blue
    if (isCompleted) iconColor = '#10b981'; // green
    else if (isNearby) iconColor = '#f59e0b'; // amber

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${iconColor}"/>
          <circle cx="12.5" cy="12.5" r="6" fill="white"/>
          <text x="12.5" y="16" text-anchor="middle" font-size="12" fill="${iconColor}">${locationService.getLocationIcon(location.type)}</text>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const userIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `)}`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  if (isLoadingLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
          <p className="text-amber-800 font-cinzel">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {locationError && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <p className="text-orange-800 text-sm font-merriweather">
            ⚠️ {locationError}
          </p>
        </div>
      )}

      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater 
            center={mapCenter} 
            markedPath={markedPath}
            userLocation={userLocation}
          />

          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-cinzel font-bold text-amber-800">Your Location</h3>
                  <p className="text-sm font-merriweather">You are here, brave adventurer!</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Wellness location markers */}
          {nearbyLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={getLocationIcon(location)}
              eventHandlers={{
                click: () => setSelectedLocation(location)
              }}
            >
              <Popup>
                <div className="min-w-64 max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      color={completedQuests.has(location.id) ? 'success' : 'primary'}
                      className="magical-glow"
                    >
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </Badge>
                    {completedQuests.has(location.id) && (
                      <Award className="text-green-500 magical-glow" size={16} />
                    )}
                  </div>

                  <h3 className="font-cinzel font-bold text-amber-800 mb-2 magical-glow">
                    {location.magicalName}
                  </h3>
                  
                  <p className="text-sm text-gray-600 font-merriweather mb-2">
                    {location.name}
                  </p>
                  
                  <p className="text-sm text-gray-700 font-merriweather mb-3">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-600">
                      <Award size={14} className="mr-1 magical-glow" />
                      <span className="font-cinzel text-sm">+{location.questReward} XP</span>
                    </div>
                    
                    {userLocation && (
                      <div className="flex items-center text-blue-600">
                        <Navigation size={14} className="mr-1" />
                        <span className="font-cinzel text-sm">
                          {routingService.formatDistance(
                            locationService.calculateDistance(
                              userLocation[0], userLocation[1],
                              location.latitude, location.longitude
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {completedQuests.has(location.id) ? (
                    <div className="flex items-center justify-center p-2 bg-green-100 border border-green-300 rounded">
                      <Award className="text-green-600 mr-2" size={16} />
                      <span className="font-cinzel text-green-800 font-bold text-sm">
                        Quest Completed!
                      </span>
                    </div>
                  ) : checkProximity(location) ? (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleQuestComplete(location)}
                      icon={<Zap size={14} />}
                      className="font-cinzel magical-glow"
                    >
                      Complete Quest
                    </Button>
                  ) : (
                    <div className="text-center p-2 bg-amber-50 border border-amber-200 rounded">
                      <div className="flex items-center justify-center text-amber-700 text-sm">
                        <Target size={14} className="mr-1" />
                        <span className="font-cinzel">Get closer to complete quest</span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-4 p-3 bg-white rounded-lg shadow-md border border-amber-200">
        <h4 className="font-cinzel font-bold text-amber-800 mb-2 text-sm">Map Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Wellness Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Nearby (Can Complete)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="font-merriweather">Completed</span>
          </div>
          {markedPath && (
            <div className="flex items-center">
              <div className="w-4 h-1 bg-amber-500 mr-2" style={{ borderTop: '2px dashed #f59e0b' }}></div>
              <span className="font-merriweather">Marked Path</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAdventureMap;