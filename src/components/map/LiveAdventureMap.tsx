import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { locationService } from '../../utils/locationService';
import { routingService } from '../../utils/routingService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Award, Navigation, AlertCircle, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LiveAdventureMapProps {
  onQuestComplete: (locationId: string, xpReward: number) => void;
  onLocationUpdate: (locations: any[]) => void;
  markedPath?: any;
}

// Custom hook to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

// Custom hook to handle path marking
function PathMarker({ userLocation, targetLocation }: { userLocation: any; targetLocation: any }) {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userLocation && targetLocation) {
      setIsLoading(true);
      routingService.getRoute(userLocation, targetLocation)
        .then(route => {
          if (route) {
            setRouteCoordinates(route.coordinates);
            // Fit map to show the entire route
            const bounds = L.latLngBounds(route.coordinates);
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        })
        .catch(error => {
          console.error('Failed to get route:', error);
          // Fallback to straight line
          setRouteCoordinates([
            [userLocation.latitude, userLocation.longitude],
            [targetLocation.latitude, targetLocation.longitude]
          ]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userLocation, targetLocation, map]);

  if (routeCoordinates.length > 0) {
    return (
      <Polyline
        positions={routeCoordinates}
        color="#f59e0b"
        weight={4}
        opacity={0.8}
        dashArray="10, 10"
      />
    );
  }

  return null;
}

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({ 
  onQuestComplete, 
  onLocationUpdate,
  markedPath 
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7829, -73.9654]); // Default to Central Park
  const [mapZoom, setMapZoom] = useState(13);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get user location and nearby wellness locations
  useEffect(() => {
    const initializeMap = async () => {
      setIsLoadingLocation(true);
      try {
        const location = await locationService.getCurrentLocation();
        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        setLocationError('');
        
        // Get nearby wellness locations
        const locations = locationService.getNearbyLocations(
          location.latitude, 
          location.longitude, 
          25 // 25km radius
        );
        
        setNearbyLocations(locations);
        onLocationUpdate(locations);
      } catch (error) {
        console.warn('Failed to get user location:', error);
        setLocationError('Location access denied. Showing demo locations in New York.');
        
        // Fallback to demo locations in NYC
        const demoLocation = { latitude: 40.7829, longitude: -73.9654 };
        setUserLocation(demoLocation);
        
        const demoLocations = locationService.getNearbyLocations(
          demoLocation.latitude,
          demoLocation.longitude,
          25
        );
        
        setNearbyLocations(demoLocations);
        onLocationUpdate(demoLocations);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    initializeMap();
  }, [onLocationUpdate]);

  const handleQuestComplete = (location: any) => {
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
    } else {
      alert(`You need to be within 100 meters of ${location.magicalName} to complete this quest. You are currently ${Math.round(distance)}m away.`);
    }
  };

  // Create custom icons for different location types
  const createLocationIcon = (type: string, isCompleted: boolean = false) => {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️',
      temple: '⛩️'
    };
    
    const emoji = iconMap[type] || '📍';
    const color = isCompleted ? '#10b981' : '#f59e0b';
    
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${emoji}
        </div>
      `,
      className: 'custom-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  // Create user location icon
  const userIcon = L.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  if (isLoadingLocation) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-2 text-amber-600" size={32} />
          <p className="text-amber-800 font-cinzel">Loading your adventure map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {locationError && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center text-orange-700">
            <AlertCircle size={16} className="mr-2" />
            <span className="text-sm font-merriweather">{locationError}</span>
          </div>
        </div>
      )}
      
      <div className="h-96 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
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
          {nearbyLocations.map(location => {
            const isCompleted = location.visitCount > 0;
            
            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={createLocationIcon(location.type, isCompleted)}
              >
                <Popup>
                  <div className="min-w-64">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{locationService.getLocationIcon(location.type)}</span>
                      <div>
                        <h3 className="font-cinzel font-bold text-amber-800">{location.magicalName}</h3>
                        <p className="text-sm text-gray-600">{location.name}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{location.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge color="accent" size="sm">
                        <MapPin size={12} className="mr-1" />
                        {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                      </Badge>
                      
                      <div className="flex items-center text-amber-700">
                        <Award size={14} className="mr-1" />
                        <span className="text-sm font-cinzel">{location.questReward} XP</span>
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <div className="text-center p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-green-800 font-cinzel font-bold text-sm">Quest Completed!</span>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleQuestComplete(location)}
                        icon={<Award size={14} />}
                        className="font-cinzel"
                      >
                        Complete Quest
                      </Button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Path marking */}
          {markedPath && userLocation && (
            <PathMarker userLocation={userLocation} targetLocation={markedPath} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveAdventureMap;