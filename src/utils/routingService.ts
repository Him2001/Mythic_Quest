interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export class RoutingService {
  private readonly OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

  async getRoute(start: RoutePoint, end: RoutePoint): Promise<RouteResponse | null> {
    try {
      const url = `${this.OSRM_URL}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]); // Flip lon,lat to lat,lon for Leaflet

      return {
        coordinates,
        distance: route.distance, // in meters
        duration: route.duration  // in seconds
      };
    } catch (error) {
      console.warn('Failed to get route from OSRM:', error);
      
      // Fallback to straight line
      return {
        coordinates: [
          [start.latitude, start.longitude],
          [end.latitude, end.longitude]
        ],
        distance: this.calculateStraightLineDistance(start, end),
        duration: 0
      };
    }
  }

  private calculateStraightLineDistance(start: RoutePoint, end: RoutePoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (start.latitude * Math.PI) / 180;
    const φ2 = (end.latitude * Math.PI) / 180;
    const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
    const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes} min`;
  }
}

export const routingService = new RoutingService();