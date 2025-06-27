import { MagicalLocation } from '../types';

// Enhanced magical locations with more wellness-focused venues
const MAGICAL_LOCATIONS: Omit<MagicalLocation, 'discovered' | 'visitCount'>[] = [
  // Parks and Nature (New York City area)
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
  {
    id: 'park-battery',
    name: 'Battery Park',
    type: 'park',
    latitude: 40.7033,
    longitude: -74.0170,
    description: 'Where the harbor winds bring messages of hope and renewal',
    magicalName: 'The Windswept Harbor of Dreams',
    questReward: 85
  },
  {
    id: 'park-washington-square',
    name: 'Washington Square Park',
    type: 'park',
    latitude: 40.7308,
    longitude: -73.9973,
    description: 'A gathering place where creative energies converge',
    magicalName: 'The Artists\' Circle of Inspiration',
    questReward: 80
  },
  
  // Fitness and Wellness Centers
  {
    id: 'gym-equinox-midtown',
    name: 'Equinox Midtown',
    type: 'gym',
    latitude: 40.7614,
    longitude: -73.9776,
    description: 'A forge where warriors strengthen body and spirit',
    magicalName: 'The Iron Temple of Fortitude',
    questReward: 85
  },
  {
    id: 'gym-chelsea-piers',
    name: 'Chelsea Piers Fitness',
    type: 'gym',
    latitude: 40.7505,
    longitude: -74.0089,
    description: 'Where champions train by the waters edge',
    magicalName: 'The Riverside Training Grounds',
    questReward: 90
  },
  {
    id: 'gym-crunch-union-square',
    name: 'Crunch Union Square',
    type: 'gym',
    latitude: 40.7359,
    longitude: -73.9911,
    description: 'A vibrant hall where energy and music unite',
    magicalName: 'The Rhythmic Strength Sanctuary',
    questReward: 80
  },
  
  // Libraries and Learning Centers
  {
    id: 'library-nypl-main',
    name: 'New York Public Library',
    type: 'library',
    latitude: 40.7532,
    longitude: -73.9822,
    description: 'Ancient repository where wisdom flows like rivers',
    magicalName: 'The Archive of Eternal Knowledge',
    questReward: 75
  },
  {
    id: 'library-brooklyn-central',
    name: 'Brooklyn Central Library',
    type: 'library',
    latitude: 40.6732,
    longitude: -73.9689,
    description: 'A beacon of learning in the borough of dreams',
    magicalName: 'The Scholars\' Lighthouse',
    questReward: 70
  },
  
  // Cafes and Community Spaces
  {
    id: 'cafe-blue-bottle-chelsea',
    name: 'Blue Bottle Coffee Chelsea',
    type: 'cafe',
    latitude: 40.7505,
    longitude: -73.9934,
    description: 'A gathering place where healing brews restore the spirit',
    magicalName: 'The Mystic Brew Haven',
    questReward: 60
  },
  {
    id: 'cafe-stumptown-ace',
    name: 'Stumptown Coffee Ace Hotel',
    type: 'cafe',
    latitude: 40.7648,
    longitude: -73.9808,
    description: 'Where kindred spirits meet and bonds are forged',
    magicalName: 'The Fellowship Hall',
    questReward: 65
  },
  
  // Landmarks and Special Places
  {
    id: 'landmark-brooklyn-bridge',
    name: 'Brooklyn Bridge',
    type: 'landmark',
    latitude: 40.7061,
    longitude: -73.9969,
    description: 'A sacred bridge connecting realms of possibility',
    magicalName: 'The Bridge of Infinite Journeys',
    questReward: 110
  },
  {
    id: 'landmark-high-line',
    name: 'High Line Park',
    type: 'landmark',
    latitude: 40.7480,
    longitude: -74.0048,
    description: 'An elevated path where earth meets sky',
    magicalName: 'The Skyward Garden Path',
    questReward: 100
  },
  {
    id: 'landmark-statue-liberty',
    name: 'Statue of Liberty',
    type: 'landmark',
    latitude: 40.6892,
    longitude: -74.0445,
    description: 'A beacon of hope and freedom across the waters',
    magicalName: 'The Guardian of Liberty\'s Light',
    questReward: 120
  },

  // Additional locations for broader coverage
  {
    id: 'park-madison-square',
    name: 'Madison Square Park',
    type: 'park',
    latitude: 40.7414,
    longitude: -73.9882,
    description: 'An urban oasis where art and nature dance together',
    magicalName: 'The Artistic Grove of Wonder',
    questReward: 75
  },
  {
    id: 'gym-planet-fitness-times-square',
    name: 'Planet Fitness Times Square',
    type: 'gym',
    latitude: 40.7580,
    longitude: -73.9855,
    description: 'Where neon lights illuminate the path to strength',
    magicalName: 'The Neon Temple of Power',
    questReward: 85
  },
  {
    id: 'library-science-industry',
    name: 'Science, Industry & Business Library',
    type: 'library',
    latitude: 40.7532,
    longitude: -73.9822,
    description: 'Where innovation and knowledge converge',
    magicalName: 'The Innovation Sanctum',
    questReward: 80
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
          console.log('Location service got user location:', location);
          resolve(location);
        },
        (error) => {
          console.warn('Location service error:', error);
          // Provide default NYC location for demo
          const defaultLocation = { latitude: 40.7829, longitude: -73.9654 };
          this.userLocation = defaultLocation;
          resolve(defaultLocation);
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
    console.log(`Finding locations near ${userLat}, ${userLon} within ${radiusKm}km`);
    
    const locations = MAGICAL_LOCATIONS
      .map(location => ({
        ...location,
        discovered: this.discoveredLocations.has(location.id),
        visitCount: this.visitCounts.get(location.id) || 0
      }))
      .map(location => {
        const distance = this.calculateDistance(
          userLat, userLon, 
          location.latitude, location.longitude
        );
        return { ...location, distance };
      })
      .filter(location => location.distance <= radiusKm * 1000) // Convert km to meters
      .sort((a, b) => a.distance - b.distance);

    console.log(`Found ${locations.length} locations:`, locations.map(l => ({ name: l.name, distance: Math.round(l.distance) })));
    
    return locations.map(({ distance, ...location }) => location);
  }

  checkLocationProximity(
    userLat: number, 
    userLon: number, 
    targetLocation: MagicalLocation,
    thresholdMeters: number = 100
  ): boolean {
    const distance = this.calculateDistance(
      userLat, userLon,
      targetLocation.latitude, targetLocation.longitude
    );
    return distance <= thresholdMeters;
  }

  discoverLocation(locationId: string): void {
    this.discoveredLocations.add(locationId);
    console.log(`Location discovered: ${locationId}`);
  }

  visitLocation(locationId: string): void {
    const currentCount = this.visitCounts.get(locationId) || 0;
    this.visitCounts.set(locationId, currentCount + 1);
    this.discoverLocation(locationId);
    console.log(`Location visited: ${locationId}, count: ${currentCount + 1}`);
  }

  getLocationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      park: '🌳',
      gym: '💪',
      library: '📚',
      cafe: '☕',
      landmark: '🏛️'
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

  // Reset discovery state (for testing)
  resetDiscoveries(): void {
    this.discoveredLocations.clear();
    this.visitCounts.clear();
    console.log('Location discoveries reset');
  }
}

export const locationService = new LocationService();