import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { overpassService } from '../../utils/overpassService';
import { routingService } from '../../utils/routingService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, Navigation, Target, Sparkles, Clock, Award, Route, Zap, RotateCcw, ExternalLink, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
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

interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

interface LiveAdventureMapProps {
  onQuestComplete: (locationId: string, xpReward: number) => void;
  onLocationUpdate: (locations: WellnessLocation[]) => void;
  onMarkPath?: (locationId: string) => void;
}

const LiveAdventureMap: React.FC<LiveAdventureMapProps> = ({
  onQuestComplete,
  onLocationUpdate,
  onMarkPath
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [wellnessLocations, setWellnessLocations] = useState<WellnessLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<WellnessLocation | null>(null);
  const [pathToLocation, setPathToLocation] = useState<WellnessLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapZoom, setMapZoom] = useState(15);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<any>(null);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    initializeLocation();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      checkProximityToLocations();
      // Update route if path is marked
      if (pathToLocation) {
        updateRoute();
      }
    }
  }, [userLocation, wellnessLocations, pathToLocation]);

  // Expose the markPathToLocation function globally for quest panel access
  useEffect(() => {
    // Create a global function that the quest panel can call
    (window as any).markPathFromPanel = (locationId: string) => {
      const location = wellnessLocations.find(loc => loc.id === locationId);
      if (location) {
        markPathToLocation(location);
      }
    };
    
    return () => {
      // Clean up the global function
      if ((window as any).markPathFromPanel) {
        delete (window as any).markPathFromPanel;
      }
    };
  }, [wellnessLocations]); // Re-run when locations change

  const initializeLocation = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Fetch nearby wellness locations
      const locations = await overpassService.fetchNearbyWellnessLocations(
        location.latitude, 
        location.longitude
      );
      setWellnessLocations(locations);
      onLocationUpdate(locations);
      
      // Start watching position for live tracking
      startLocationWatching();
      
    } catch (err) {
      console.warn('Could not get user location:', err);
      setError('Location access not available. Please enable location services for live tracking and proximity detection.');
      
      // Use fallback location (Central Park, NYC)
      const fallbackLocation = { latitude: 40.7829, longitude: -73.9654 };
      setUserLocation(fallbackLocation);
      
      const fallbackLocations = await overpassService.fetchNearbyWellnessLocations(
        fallbackLocation.latitude,
        fallbackLocation.longitude
      );
      setWellnessLocations(fallbackLocations);
      onLocationUpdate(fallbackLocations);
      
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationAccuracy(position.coords.accuracy);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
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
          setLocationAccuracy(position.coords.accuracy);
        },
        (error) => {
          console.error('Location watching error:', error);
          if (error.code !== error.TIMEOUT) {
            setError('GPS tracking interrupted. Some features may be limited.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000 // Update more frequently for live tracking
        }
      );
    }
  };

  const updateRoute = async () => {
    if (!userLocation || !pathToLocation) return;

    setIsLoadingRoute(true);
    try {
      const route = await routingService.getRoute(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: pathToLocation.latitude, longitude: pathToLocation.longitude }
      );
      
      if (route) {
        setRouteInfo(route);
        
        // Fit map to show entire route
        if (mapRef.current && route.coordinates.length > 0) {
          const bounds = route.coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
          }, new (window as any).L.LatLngBounds(route.coordinates[0], route.coordinates[0]));
          
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    } catch (error) {
      console.warn('Failed to get route:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const checkProximityToLocations = () => {
    if (!userLocation) return;

    wellnessLocations.forEach(location => {
      if (completedQuests.has(location.id)) return;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      );

      // If within 50 meters, complete the quest
      if (distance <= 50) {
        setCompletedQuests(prev => new Set([...prev, location.id]));
        onQuestComplete(location.id, location.questReward);
        
        // Show success notification
        showSuccessNotification(location);
        
        // Clear path if this was the target
        if (pathToLocation?.id === location.id) {
          setPathToLocation(null);
          setRouteInfo(null);
        }
      }
    });
  };

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

  const showSuccessNotification = (location: WellnessLocation) => {
    // Create a magical success popup
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-2xl z-50 transform animate-bounce border-4 border-green-300';
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="text-3xl mr-3 animate-pulse">✨</span>
        <div>
          <div class="font-bold text-lg">Quest Completed!</div>
          <div class="text-sm opacity-90">${location.magicalName}</div>
          <div class="text-sm font-bold text-yellow-200">+${location.questReward} XP Earned!</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  // Create simple colored circle icons instead of complex SVG
  const getLocationIcon = (location: WellnessLocation): Icon => {
    const isCompleted = completedQuests.has(location.id);
    const isPathTarget = pathToLocation?.id === location.id;
    
    let color = '#f59e0b'; // Default amber
    
    if (isCompleted) {
      color = '#10b981'; // Green for completed
    } else if (isPathTarget) {
      color = '#3b82f6'; // Blue for path target
    }
    
    // Use a simple circle marker instead of complex SVG
    return new Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="3"/>
          <circle cx="15" cy="15" r="6" fill="white"/>
        </svg>
      `)}`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  const getUserIcon = (): Icon => {
    // Simple blue circle for user location
    return new Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
          <circle cx="10" cy="10" r="3" fill="white"/>
        </svg>
      `)}`,
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

  const markPathToLocation = async (location: WellnessLocation) => {
    console.log('markPathToLocation called for:', location.magicalName);
    
    // Close any open popups first
    setSelectedLocation(null);
    
    // Close all popups on the map
    if (mapRef.current) {
      mapRef.current.closePopup();
    }
    
    if (pathToLocation?.id === location.id) {
      // If already showing path to this location, clear it
      console.log('Clearing existing path');
      setPathToLocation(null);
      setRouteInfo(null);
    } else {
      // Mark path to new location
      console.log('Setting new path to:', location.magicalName);
      setPathToLocation(location);
      
      if (userLocation) {
        setIsLoadingRoute(true);
        try {
          const route = await routingService.getRoute(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: location.latitude, longitude: location.longitude }
          );
          
          if (route) {
            console.log('Route found:', route);
            setRouteInfo(route);
            
            // Fit map to show entire route
            if (mapRef.current && route.coordinates.length > 0) {
              const bounds = route.coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
              }, new (window as any).L.LatLngBounds(route.coordinates[0], route.coordinates[0]));
              
              mapRef.current.fitBounds(bounds, { padding: [20, 20] });
            }
          }
        } catch (error) {
          console.warn('Failed to get route:', error);
          // Fallback to straight line
          setRouteInfo({
            coordinates: [
              [userLocation.latitude, userLocation.longitude],
              [location.latitude, location.longitude]
            ],
            distance: calculateDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude),
            duration: 0
          });
        } finally {
          setIsLoadingRoute(false);
        }
      }
    }
  };

  const openGoogleMaps = (location: WellnessLocation) => {
    // Close popup first
    setSelectedLocation(null);
    if (mapRef.current) {
      mapRef.current.closePopup();
    }
    
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to just showing the location
      const url = `https://www.google.com/maps/search/${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const recenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
      setMapZoom(15);
    }
  };

  const clearPath = () => {
    console.log('clearPath called - clearing route');
    setPathToLocation(null);
    setRouteInfo(null);
    
    // Close any open popups
    setSelectedLocation(null);
    if (mapRef.current) {
      mapRef.current.closePopup();
    }
  };

  // Handle map click to close popups
  const handleMapClick = () => {
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-amber-50 to-purple-50 rounded-lg border-2 border-amber-200">
        <div className="text-center">
          <Navigation className="animate-spin mx-auto mb-3 text-amber-600 magical-glow\" size={40} />
          <p className="text-amber-800 font-cinzel font-bold">Discovering magical wellness locations...</p>
          <p className="text-amber-600 font-merriweather text-sm mt-2">Connecting to the mystical realm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Status */}
      {pathToLocation && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-4 magical-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Route className="text-purple-600 mr-3 animate-pulse magical-glow\" size={24} />
              <div>
                <h3 className="font-cinzel font-bold text-purple-800">
                  {isLoadingRoute ? 'Calculating Route...' : 'Road Path Marked'}
                </h3>
                <p className="text-sm text-purple-700 font-merriweather">{pathToLocation.magicalName}</p>
                {routeInfo && (
                  <div className="flex items-center space-x-4 text-xs text-purple-600 mt-1">
                    <span>📍 {routingService.formatDistance(routeInfo.distance)}</span>
                    {routeInfo.duration > 0 && (
                      <span>⏱️ {routingService.formatDuration(routeInfo.duration)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearPath}
              className="font-cinzel"
            >
              Clear Route
            </Button>
          </div>
        </div>
      )}

      <div className="h-96 rounded-lg overflow-hidden shadow-xl border-4 border-amber-300 relative">
        {/* Magical border effect */}
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-lg pointer-events-none magical-glow"></div>
        
        {/* Control Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={recenterMap}
            icon={<RotateCcw size={16} />}
            className="bg-white/90 backdrop-blur-sm font-cinzel shadow-lg"
          >
            Recenter
          </Button>
          
          {pathToLocation && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearPath}
              icon={<X size={16} />}
              className="bg-white/90 backdrop-blur-sm font-cinzel shadow-lg"
            >
              Clear Path
            </Button>
          )}
        </div>
        
        <MapContainer
          center={userLocation ? [userLocation.latitude, userLocation.longitude] : [40.7829, -73.9654]}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          ref={mapRef}
          eventHandlers={{
            click: handleMapClick
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Road-based route line */}
          {routeInfo && routeInfo.coordinates.length > 0 && (
            <Polyline
              positions={routeInfo.coordinates}
              color="#8b5cf6"
              weight={6}
              opacity={0.8}
              dashArray="10, 5"
              className="magical-glow"
            />
          )}
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={getUserIcon()}
            >
              <Popup>
                <div className="text-center font-cinzel p-2">
                  <Sparkles className="mx-auto mb-2 text-blue-500 magical-glow" size={20} />
                  <strong className="text-blue-800">Your Live Location</strong>
                  <p className="text-xs text-gray-600 mt-1">GPS tracking active</p>
                  {locationAccuracy && (
                    <p className="text-xs text-blue-600">
                      Accuracy: ±{Math.round(locationAccuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Wellness location markers */}
          {wellnessLocations.map((location) => {
            const isCompleted = completedQuests.has(location.id);
            const isPathTarget = pathToLocation?.id === location.id;
            const distance = userLocation ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              location.latitude,
              location.longitude
            ) : null;

            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={getLocationIcon(location)}
                eventHandlers={{
                  click: () => setSelectedLocation(location)
                }}
              >
                <Popup>
                  <div className="min-w-64 font-cinzel p-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-amber-800 text-lg magical-glow">
                        {location.magicalName}
                      </h3>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          color={isCompleted ? 'success' : isPathTarget ? 'primary' : 'warning'} 
                          size="sm"
                          className="magical-glow"
                        >
                          {isCompleted ? 'Completed' : isPathTarget ? 'Route Active' : 'Available'}
                        </Badge>
                        {distance && (
                          <span className="text-xs text-blue-600 flex items-center">
                            <MapPin size={10} className="mr-1" />
                            {formatDistance(distance)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 font-merriweather italic">
                      {location.description}
                    </p>
                    
                    <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                        <Target size={14} className="mr-1" />
                        Wellness Quest
                      </h4>
                      <p className="text-sm text-amber-700 font-merriweather">
                        {location.questTask}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600 font-merriweather">{location.name}</span>
                      <div className="flex items-center text-amber-700">
                        <Award size={16} className="mr-1 magical-glow" />
                        <span className="font-bold">{location.questReward} XP</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!isCompleted && (
                        <>
                          <Button
                            size="sm"
                            variant={isPathTarget ? "secondary" : "primary"}
                            onClick={() => markPathToLocation(location)}
                            icon={<Route size={14} />}
                            className="magical-glow flex-1"
                            disabled={isLoadingRoute}
                          >
                            {isLoadingRoute ? 'Loading...' : isPathTarget ? 'Clear Route' : 'Mark Route'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openGoogleMaps(location)}
                            icon={<ExternalLink size={14} />}
                            className="magical-glow flex-1"
                          >
                            Google Maps
                          </Button>
                        </>
                      )}
                      
                      {isCompleted && (
                        <div className="flex-1 text-center">
                          <Badge color="success" size="sm" className="magical-glow">
                            <Zap size={12} className="mr-1" />
                            Quest Complete!
                          </Badge>
                        </div>
                      )}
                    </div>

                    {distance && distance <= 50 && !isCompleted && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center text-green-700 text-xs font-cinzel">
                          <Sparkles size={12} className="mr-1 magical-glow" />
                          You're within range! Quest will auto-complete.
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {error && (
          <div className="absolute top-4 left-4 right-20 bg-amber-50 border-2 border-amber-300 rounded-lg p-3 z-10 magical-glow">
            <div className="flex items-center text-amber-800">
              <Sparkles size={16} className="mr-2" />
              <span className="font-cinzel text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Live tracking indicator */}
        {userLocation && !error && (
          <div className="absolute bottom-4 left-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-2 z-10">
            <div className="flex items-center text-blue-700 text-xs font-cinzel">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Live GPS Tracking
            </div>
          </div>
        )}

        {/* Route status indicator */}
        {routeInfo && (
          <div className="absolute bottom-4 right-4 bg-purple-50 border-2 border-purple-300 rounded-lg p-2 z-10">
            <div className="flex items-center text-purple-700 text-xs font-cinzel">
              <Route className="w-3 h-3 mr-1 magical-glow" />
              Road Route Active
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAdventureMap;