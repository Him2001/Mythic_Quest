import { MagicalLocation } from '../types';

// Enhanced magical locations with more wellness-focused venues
const MAGICAL_LOCATIONS: Omit<MagicalLocation, 'discovered' | 'visitCount'>[] = [
  // Parks and Nature
  {
    id: 'park-central',
    name: 'Central Park',
    type: 'park',
    latitude: 40.7829,
    longitude: -73.9654,
    description: 'A vast green sanctuary where ancient spirits dwell among the trees',
    magicalName: 'The Whispering Grove of Serenity',
    questReward: 100
  },
  {
    id: 'park-riverside',
    name: 'Riverside Park',
    type: 'park',
    latitude: 40.7956,
    longitude: -73.9722,
    description: 'Where flowing waters carry away stress and worry',
    magicalName: 'The Healing Waters Sanctuary',
    questReward: 90
  },
  {
    id: 'park-prospect',
    name: 'Prospect Park',
    type: 'park',
    latitude: 40.6602,
    longitude: -73.9690,
    description: 'A mystical realm where nature\'s energy flows strongest',
    magicalName: 'The Emerald Circle of Renewal',
    questReward: 95
  },
  
  // Fitness and Wellness
  {
    id: 'gym-fitness',
    name: 'Fitness Center',
    type: 'gym',
    latitude: 40.7614,
    longitude: -73.9776,
    description: 'A forge where warriors strengthen body and spirit',
    magicalName: 'The Iron Temple of Fortitude',
    questReward: 85
  },
  {
    id: 'gym-yoga',
    name: 'Yoga Studio',
    type: 'gym',
    latitude: 40.7505,
    longitude: -73.9934,
    description: 'Sacred halls where mind and body unite in harmony',
    magicalName: 'The Lotus Pavilion of Balance',
    questReward: 80
  },
  {
    id: 'pool-aquatic',
    name: 'Aquatic Center',
    type: 'gym',
    latitude: 40.7282,
    longitude: -73.9942,
    description: 'Crystal waters that cleanse both body and soul',
    magicalName: 'The Azure Pools of Vitality',
    questReward: 90
  },
  
  // Knowledge and Learning
  {
    id: 'library-main',
    name: 'Main Library',
    type: 'library',
    latitude: 40.7532,
    longitude: -73.9822,
    description: 'Ancient repository where wisdom flows like rivers',
    magicalName: 'The Archive of Eternal Knowledge',
    questReward: 75
  },
  {
    id: 'library-branch',
    name: 'Community Library',
    type: 'library',
    latitude: 40.7589,
    longitude: -73.9851,
    description: 'A quiet sanctuary for contemplation and learning',
    magicalName: 'The Scholars\' Retreat',
    questReward: 70
  },
  
  // Social and Community
  {
    id: 'cafe-wellness',
    name: 'Wellness Cafe',
    type: 'cafe',
    latitude: 40.7505,
    longitude: -73.9934,
    description: 'A gathering place where healing brews restore the spirit',
    magicalName: 'The Mystic Brew Haven',
    questReward: 60
  },
  {
    id: 'cafe-community',
    name: 'Community Center',
    type: 'cafe',
    latitude: 40.7648,
    longitude: -73.9808,
    description: 'Where kindred spirits meet and bonds are forged',
    magicalName: 'The Fellowship Hall',
    questReward: 65
  },
  
  // Landmarks and Special Places
  {
    id: 'landmark-monument',
    name: 'Peace Monument',
    type: 'landmark',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'A sacred site where tranquility radiates outward',
    magicalName: 'The Shrine of Inner Peace',
    questReward: 110
  },
  {
    id: 'temple-meditation',
    name: 'Meditation Center',
    type: 'temple',
    latitude: 40.7549,
    longitude: -73.9840,
    description: 'A sacred space where the soul finds its center',
    magicalName: 'The Temple of Mindful Awakening',
    questReward: 100
  }
];

// Location-based quest templates with wellness activities
const LOCATION_QUEST_TEMPLATES = {
  park: [
    {
      title: 'Breath of the Forest',
      description: 'Practice deep breathing exercises for 5 minutes among the ancient trees',
      duration: 5,
      activity: 'breathing'
    },
    {
      title: 'Nature\'s Meditation',
      description: 'Find a peaceful spot and meditate for 10 minutes, connecting with nature\'s energy',
      duration: 10,
      activity: 'meditation'
    },
    {
      title: 'Mindful Walking',
      description: 'Take a slow, mindful walk for 15 minutes, observing the natural world around you',
      duration: 15,
      activity: 'walking'
    },
    {
      title: 'Gratitude Ritual',
      description: 'Spend 5 minutes expressing gratitude for the natural beauty surrounding you',
      duration: 5,
      activity: 'gratitude'
    }
  ],
  gym: [
    {
      title: 'Warrior\'s Strength',
      description: 'Complete a 20-minute strength training session to forge your inner warrior',
      duration: 20,
      activity: 'strength'
    },
    {
      title: 'Flow of Power',
      description: 'Engage in 15 minutes of cardio to channel your vital energy',
      duration: 15,
      activity: 'cardio'
    },
    {
      title: 'Balance Mastery',
      description: 'Practice balance and flexibility exercises for 10 minutes',
      duration: 10,
      activity: 'balance'
    },
    {
      title: 'Aquatic Harmony',
      description: 'Swim or practice water exercises for 25 minutes to cleanse body and spirit',
      duration: 25,
      activity: 'swimming'
    }
  ],
  library: [
    {
      title: 'Wisdom Seeking',
      description: 'Spend 20 minutes reading about personal development or wellness',
      duration: 20,
      activity: 'reading'
    },
    {
      title: 'Knowledge Reflection',
      description: 'Journal about your recent learnings for 15 minutes in this sacred space',
      duration: 15,
      activity: 'journaling'
    },
    {
      title: 'Silent Contemplation',
      description: 'Practice silent meditation for 10 minutes surrounded by knowledge',
      duration: 10,
      activity: 'meditation'
    }
  ],
  cafe: [
    {
      title: 'Social Connection',
      description: 'Engage in meaningful conversation or practice active listening for 15 minutes',
      duration: 15,
      activity: 'social'
    },
    {
      title: 'Mindful Consumption',
      description: 'Practice mindful eating or drinking, savoring each moment for 10 minutes',
      duration: 10,
      activity: 'mindfulness'
    },
    {
      title: 'Community Bonds',
      description: 'Connect with others or practice kindness for 20 minutes',
      duration: 20,
      activity: 'community'
    }
  ],
  landmark: [
    {
      title: 'Sacred Pilgrimage',
      description: 'Reflect on your personal journey and set intentions for 15 minutes',
      duration: 15,
      activity: 'reflection'
    },
    {
      title: 'Monument Meditation',
      description: 'Practice gratitude meditation for 10 minutes at this sacred site',
      duration: 10,
      activity: 'meditation'
    }
  ],
  temple: [
    {
      title: 'Spiritual Awakening',
      description: 'Engage in deep meditation or prayer for 20 minutes',
      duration: 20,
      activity: 'meditation'
    },
    {
      title: 'Inner Peace Ritual',
      description: 'Practice mindfulness and seek inner peace for 15 minutes',
      duration: 15,
      activity: 'mindfulness'
    }
  ]
};

export class LocationService {
  private userLocation: { latitude: number; longitude: number } | null = null;
  private discoveredLocations: Set<string> = new Set();
  private visitCounts: Map<string, number> = new Map();

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }

  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
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
  }

  getNearbyLocations(
    userLat: number, 
    userLon: number, 
    radiusKm: number = 25
  ): MagicalLocation[] {
    // If user location is available, use it; otherwise use a default location for demo
    const searchLat = userLat;
    const searchLon = userLon;
    
    return MAGICAL_LOCATIONS
      .map(location => ({
        ...location,
        discovered: this.discoveredLocations.has(location.id),
        visitCount: this.visitCounts.get(location.id) || 0
      }))
      .filter(location => {
        const distance = this.calculateDistance(
          searchLat, searchLon, 
          location.latitude, location.longitude
        );
        return distance <= radiusKm * 1000; // Convert km to meters
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(searchLat, searchLon, a.latitude, a.longitude);
        const distanceB = this.calculateDistance(searchLat, searchLon, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
  }

  checkLocationProximity(
    userLat: number, 
    userLon: number, 
    targetLocation: MagicalLocation,
    thresholdMeters: number = 50
  ): boolean {
    const distance = this.calculateDistance(
      userLat, userLon,
      targetLocation.latitude, targetLocation.longitude
    );
    return distance <= thresholdMeters;
  }

  discoverLocation(locationId: string): void {
    this.discoveredLocations.add(locationId);
  }

  visitLocation(locationId: string): void {
    const currentCount = this.visitCounts.get(locationId) || 0;
    this.visitCounts.set(locationId, currentCount + 1);
    this.discoverLocation(locationId);
  }

  getLocationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️',
      temple: '⛩️'
    };
    return iconMap[type] || '📍';
  }

  generateLocationQuest(location: MagicalLocation): {
    title: string;
    description: string;
    duration?: number;
    activity?: string;
  } {
    const templates = LOCATION_QUEST_TEMPLATES[location.type] || [];
    
    if (templates.length === 0) {
      return {
        title: `Visit ${location.magicalName}`,
        description: `A mysterious force draws you to ${location.magicalName}. Discover what awaits you there.`,
        duration: 10,
        activity: 'exploration'
      };
    }

    // Select a random quest template for this location type
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      title: template.title,
      description: `${template.description} at ${location.magicalName}.`,
      duration: template.duration,
      activity: template.activity
    };
  }

  // Get all available locations for demo purposes
  getAllLocations(): MagicalLocation[] {
    return MAGICAL_LOCATIONS.map(location => ({
      ...location,
      discovered: this.discoveredLocations.has(location.id),
      visitCount: this.visitCounts.get(location.id) || 0
    }));
  }
}

export const locationService = new LocationService();