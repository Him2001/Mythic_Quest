export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

export class GPSTracker {
  private watchId: number | null = null;
  private lastPosition: LocationData | null = null;
  private totalDistance: number = 0;
  private isTracking: boolean = false;
  private onDistanceUpdate: ((distance: number) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    this.totalDistance = 0;
  }

  async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    try {
      // Test if we can get location
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });
      return true;
    } catch (error) {
      throw new Error('Location permission denied or unavailable');
    }
  }

  startTracking(
    onDistanceUpdate: (distance: number) => void,
    onError: (error: string) => void
  ): void {
    if (this.isTracking) {
      return;
    }

    this.onDistanceUpdate = onDistanceUpdate;
    this.onError = onError;
    this.isTracking = true;
    this.totalDistance = 0;
    this.lastPosition = null;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleError(error),
      options
    );
  }

  stopTracking(): number {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
    this.lastPosition = null;
    const finalDistance = this.totalDistance;
    this.totalDistance = 0;
    
    return finalDistance;
  }

  private handlePositionUpdate(position: GeolocationPosition): void {
    const currentLocation: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy
    };

    // Only calculate distance if we have a previous position and accuracy is reasonable
    if (this.lastPosition && currentLocation.accuracy < 50) {
      const distance = this.calculateDistance(this.lastPosition, currentLocation);
      
      // Only add distance if it's reasonable (not a GPS jump)
      if (distance < 100 && distance > 0.5) {
        this.totalDistance += distance;
        this.onDistanceUpdate?.(this.totalDistance);
      }
    }

    this.lastPosition = currentLocation;
  }

  private handleError(error: GeolocationPositionError): void {
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }
    
    this.onError?.(errorMessage);
    this.stopTracking();
  }

  private calculateDistance(pos1: LocationData, pos2: LocationData): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  getTotalDistance(): number {
    return this.totalDistance;
  }

  getIsTracking(): boolean {
    return this.isTracking;
  }
}

export const gpsTracker = new GPSTracker();