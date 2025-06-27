interface OverpassLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
}

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

export class OverpassService {
  private readonly OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  private readonly SEARCH_RADIUS = 2000; // 2km radius

  async fetchNearbyWellnessLocations(
    latitude: number, 
    longitude: number
  ): Promise<WellnessLocation[]> {
    try {
      const query = this.buildOverpassQuery(latitude, longitude);
      const response = await fetch(this.OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      const locations = this.parseOverpassResponse(data);
      
      // Limit to 5 closest locations and add magical theming
      return locations
        .slice(0, 5)
        .map(location => this.enhanceLocationWithMagic(location));
    } catch (error) {
      console.warn('Failed to fetch from Overpass API, using fallback locations:', error);
      return this.getFallbackLocations(latitude, longitude);
    }
  }

  private buildOverpassQuery(latitude: number, longitude: number): string {
    const bbox = this.calculateBoundingBox(latitude, longitude, this.SEARCH_RADIUS);
    
    return `
      [out:json][timeout:25];
      (
        way["leisure"="park"](${bbox});
        relation["leisure"="park"](${bbox});
        node["leisure"="park"](${bbox});
        
        way["amenity"="library"](${bbox});
        node["amenity"="library"](${bbox});
        
        way["leisure"="fitness_centre"](${bbox});
        node["leisure"="fitness_centre"](${bbox});
        way["leisure"="sports_centre"](${bbox});
        node["leisure"="sports_centre"](${bbox});
        
        way["amenity"="cafe"](${bbox});
        node["amenity"="cafe"](${bbox});
        
        way["leisure"="garden"](${bbox});
        node["leisure"="garden"](${bbox});
        
        way["amenity"="community_centre"](${bbox});
        node["amenity"="community_centre"](${bbox});
        
        way["tourism"="attraction"](${bbox});
        node["tourism"="attraction"](${bbox});
      );
      out center meta;
    `;
  }

  private calculateBoundingBox(lat: number, lon: number, radiusMeters: number): string {
    const latDelta = radiusMeters / 111000; // Approximate meters per degree latitude
    const lonDelta = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));
    
    const south = lat - latDelta;
    const north = lat + latDelta;
    const west = lon - lonDelta;
    const east = lon + lonDelta;
    
    return `${south},${west},${north},${east}`;
  }

  private parseOverpassResponse(data: any): OverpassLocation[] {
    const locations: OverpassLocation[] = [];
    
    if (!data.elements) return locations;

    for (const element of data.elements) {
      let lat: number, lon: number;
      
      // Handle different element types (node, way, relation)
      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        continue; // Skip if no coordinates available
      }

      const name = element.tags?.name || 'Unnamed Location';
      const type = this.determineLocationType(element.tags);
      
      if (type && name !== 'Unnamed Location') {
        locations.push({
          id: `osm-${element.type}-${element.id}`,
          name,
          type,
          latitude: lat,
          longitude: lon,
          tags: element.tags || {}
        });
      }
    }

    return locations;
  }

  private determineLocationType(tags: Record<string, string>): string | null {
    if (tags.leisure === 'park' || tags.leisure === 'garden') return 'park';
    if (tags.amenity === 'library') return 'library';
    if (tags.leisure === 'fitness_centre' || tags.leisure === 'sports_centre') return 'gym';
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'community_centre' || tags.tourism === 'attraction') return 'landmark';
    
    return null;
  }

  private enhanceLocationWithMagic(location: OverpassLocation): WellnessLocation {
    const magicalNames = this.generateMagicalName(location.name, location.type);
    const questData = this.generateQuestForLocation(location.type);
    
    return {
      id: location.id,
      name: location.name,
      type: location.type as any,
      latitude: location.latitude,
      longitude: location.longitude,
      description: this.generateDescription(location.type),
      magicalName: magicalNames,
      questReward: questData.xpReward,
      questTask: questData.task,
      discovered: false,
      visitCount: 0
    };
  }

  private generateMagicalName(realName: string, type: string): string {
    const prefixes = {
      park: ['Whispering', 'Enchanted', 'Sacred', 'Mystic', 'Emerald'],
      library: ['Ancient', 'Wisdom', 'Scholar\'s', 'Arcane', 'Eternal'],
      gym: ['Iron', 'Warrior\'s', 'Temple of', 'Forge of', 'Hall of'],
      cafe: ['Mystic', 'Healing', 'Traveler\'s', 'Golden', 'Serene'],
      landmark: ['Sacred', 'Ancient', 'Legendary', 'Mystical', 'Divine']
    };

    const suffixes = {
      park: ['Grove', 'Sanctuary', 'Gardens', 'Meadow', 'Haven'],
      library: ['Archive', 'Sanctum', 'Repository', 'Hall', 'Chamber'],
      gym: ['Forge', 'Temple', 'Arena', 'Hall', 'Citadel'],
      cafe: ['Haven', 'Retreat', 'Sanctuary', 'Oasis', 'Chamber'],
      landmark: ['Monument', 'Shrine', 'Temple', 'Spire', 'Beacon']
    };

    const typeKey = type as keyof typeof prefixes;
    const prefix = prefixes[typeKey]?.[Math.floor(Math.random() * prefixes[typeKey].length)] || 'Mystical';
    const suffix = suffixes[typeKey]?.[Math.floor(Math.random() * suffixes[typeKey].length)] || 'Place';
    
    return `${prefix} ${suffix}`;
  }

  private generateQuestForLocation(type: string): { task: string; xpReward: number } {
    const questTemplates = {
      park: [
        { task: 'Sit quietly and practice deep breathing for 5 minutes', xpReward: 80 },
        { task: 'Take a mindful walk for 10 minutes, observing nature', xpReward: 100 },
        { task: 'Find a peaceful spot and meditate for 8 minutes', xpReward: 90 },
        { task: 'Practice gratitude by appreciating the natural beauty for 5 minutes', xpReward: 75 }
      ],
      library: [
        { task: 'Spend 15 minutes reading about personal development', xpReward: 85 },
        { task: 'Practice silent meditation for 10 minutes', xpReward: 80 },
        { task: 'Journal about your goals for 10 minutes', xpReward: 90 },
        { task: 'Research a topic that interests you for 20 minutes', xpReward: 95 }
      ],
      gym: [
        { task: 'Complete a 15-minute workout or exercise routine', xpReward: 120 },
        { task: 'Practice stretching and flexibility for 10 minutes', xpReward: 85 },
        { task: 'Do bodyweight exercises for 12 minutes', xpReward: 110 },
        { task: 'Practice balance and coordination exercises for 8 minutes', xpReward: 90 }
      ],
      cafe: [
        { task: 'Practice mindful eating or drinking for 10 minutes', xpReward: 70 },
        { task: 'Engage in meaningful conversation for 15 minutes', xpReward: 80 },
        { task: 'Write in your journal while enjoying a beverage', xpReward: 75 },
        { task: 'Practice active listening and social connection', xpReward: 85 }
      ],
      landmark: [
        { task: 'Reflect on your personal journey for 10 minutes', xpReward: 100 },
        { task: 'Practice gratitude meditation for 8 minutes', xpReward: 95 },
        { task: 'Set intentions for your future goals', xpReward: 90 },
        { task: 'Appreciate the historical or cultural significance', xpReward: 85 }
      ]
    };

    const templates = questTemplates[type as keyof typeof questTemplates] || questTemplates.landmark;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateDescription(type: string): string {
    const descriptions = {
      park: 'A natural sanctuary where ancient spirits dwell among the trees and flowing waters',
      library: 'A sacred repository of knowledge where wisdom flows like rivers of light',
      gym: 'A forge where warriors strengthen both body and spirit through dedicated practice',
      cafe: 'A gathering place where healing brews and meaningful connections restore the soul',
      landmark: 'A sacred site where the echoes of history and culture inspire the spirit'
    };

    return descriptions[type as keyof typeof descriptions] || 'A mystical place of power and renewal';
  }

  private getFallbackLocations(latitude: number, longitude: number): WellnessLocation[] {
    // Fallback locations near the user's position (offset by small amounts)
    const fallbackData = [
      { name: 'Local Park', type: 'park', offset: [0.005, 0.005] },
      { name: 'Community Library', type: 'library', offset: [-0.003, 0.007] },
      { name: 'Fitness Center', type: 'gym', offset: [0.008, -0.004] },
      { name: 'Wellness Cafe', type: 'cafe', offset: [-0.006, -0.002] },
      { name: 'Community Center', type: 'landmark', offset: [0.002, 0.009] }
    ];

    return fallbackData.map((item, index) => {
      const questData = this.generateQuestForLocation(item.type);
      return {
        id: `fallback-${index}`,
        name: item.name,
        type: item.type as any,
        latitude: latitude + item.offset[0],
        longitude: longitude + item.offset[1],
        description: this.generateDescription(item.type),
        magicalName: this.generateMagicalName(item.name, item.type),
        questReward: questData.xpReward,
        questTask: questData.task,
        discovered: false,
        visitCount: 0
      };
    });
  }
}

export const overpassService = new OverpassService();