import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MagicalLocation, LocationQuest } from '../../types';
import { locationService } from '../../utils/locationService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Target, Sparkles, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AdventureMapProps {
  onLocationQuestCreate: (quest: LocationQuest) => void;
  onLocationVisited: (locationId: string) => void;
  activeLocationQuest?: LocationQuest;
}

// Component to update map view when user location changes
const MapUpdater: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const AdventureMap: React.FC<AdventureMapProps> = ({
  onLocationQuestCreate,
  onLocationVisited,
  activeLocationQuest
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<MagicalLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MagicalLocation | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([40.7829, -73.9654]); // Default to Central Park
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    initializeLocation();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && activeLocationQuest) {
      checkLocationProximity();
    }
  }, [userLocation, activeLocationQuest]);

  const initializeLocation = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setMapCenter([location.latitude, location.longitude]);
      
      const nearby = locationService.getNearbyLocations(location.latitude, location.longitude);
      setNearbyLocations(nearby);
      
      // Start watching position for proximity detection
      startLocationWatching();
      
    } catch (err) {
      console.warn('Could not get user location, showing demo locations:', err);
      setError('Location access not available. Showing demo locations in New York.');
      
      // Show demo locations even without user location
      const demoLocations = locationService.getAllLocations();
      setNearbyLocations(demoLocations);
      
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationWatching = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(newLocation);
          setMapCenter([newLocation.latitude, newLocation.longitude]);
        },
        (error) => {
          console.error('Location watching error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    }
  };

  const checkLocationProximity = () => {
    if (!userLocation || !activeLocationQuest) return;

    const isNearTarget = locationService.checkLocationProximity(
      userLocation.latitude,
      userLocation.longitude,
      activeLocationQuest.targetLocation,
      50 // 50 meters threshold
    );

    if (isNearTarget && !activeLocationQuest.completed) {
      onLocationVisited(activeLocationQuest.targetLocation.id);
    }
  };

  const handleCreateLocationQuest = (location: MagicalLocation) => {
    const questData = locationService.generateLocationQuest(location);
    
    const locationQuest: LocationQuest = {
      id: `location-${location.id}-${Date.now()}`,
      title: questData.title,
      description: questData.description,
      targetLocation: location,
      xpReward: location.questReward,
      completed: false,
      isActive: true,
      distanceToTarget: userLocation ? locationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      ) : undefined
    };

    onLocationQuestCreate(locationQuest);
    setSelectedLocation(null);
  };

  const getLocationIcon = (location: MagicalLocation): Icon => {
    const iconColor = location.discovered ? '#10b981' : '#f59e0b';
    const isActive = activeLocationQuest?.targetLocation.id === location.id;
    const borderColor = isActive ? '#3b82f6' : '#ffffff';
    const borderWidth = isActive ? '4px' : '3px';
    
    const iconHtml = `
      <div style="
        background-color: ${iconColor};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: ${borderWidth} solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${isActive ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${locationService.getLocationIcon(location.type)}
      </div>
    `;

    const svgString = `
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="30" height="30">
          ${iconHtml}
        </foreignObject>
      </svg>
    `;

    return new Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))),
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  const getUserIcon = (): Icon => {
    const iconHtml = `
      <div style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
    `;

    const svgString = `
      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="20" height="20">
          ${iconHtml}
        </foreignObject>
      </svg>
    `;

    return new Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))),
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Navigation className="animate-spin mx-auto mb-2 text-blue-500\" size={32} />
          <p className="text-gray-600 font-cinzel">Discovering magical locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 14 : 12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapUpdater center={mapCenter} zoom={userLocation ? 14 : 12} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={getUserIcon()}
          >
            <Popup>
              <div className="text-center font-cinzel">
                <Sparkles className="mx-auto mb-1 text-blue-500" size={16} />
                <strong>Your Location</strong>
                <p className="text-xs text-gray-600">Current position in the realm</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Magical location markers */}
        {nearbyLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getLocationIcon(location)}
            eventHandlers={{
              click: () => setSelectedLocation(location)
            }}
          >
            <Popup>
              <div className="min-w-48 font-cinzel">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-amber-800">{location.magicalName}</h3>
                  <Badge 
                    color={location.discovered ? 'success' : 'warning'} 
                    size="sm"
                  >
                    {location.discovered ? 'Discovered' : 'Unknown'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{location.name}</span>
                  <span>{location.visitCount} visits</span>
                </div>

                {userLocation && (
                  <div className="flex items-center text-xs text-blue-600 mb-3">
                    <Target size={12} className="mr-1" />
                    <span>
                      {formatDistance(locationService.calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        location.latitude,
                        location.longitude
                      ))} away
                    </span>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  onClick={() => handleCreateLocationQuest(location)}
                  disabled={activeLocationQuest?.targetLocation.id === location.id}
                  className="magical-glow"
                >
                  {activeLocationQuest?.targetLocation.id === location.id 
                    ? 'Quest Active' 
                    : `Begin Quest (+${location.questReward} XP)`
                  }
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-amber-50 border border-amber-200 rounded-md p-2 z-10">
          <div className="flex items-center text-amber-700 text-sm">
            <Sparkles size={14} className="mr-1" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureMap;