import { Avatar, Quest, User, StoryChapter, Fellow, SocialPost } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Adventurer',
  email: 'user@example.com',
  level: 3,
  xp: 340,
  xpToNextLevel: 500,
  avatarUrl: 'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=600',
  joinDate: new Date('2024-01-15'),
  questsCompleted: 12,
  dailyWalkingDistance: 0,
  totalWalkingDistance: 0,
  lastWalkingDate: new Date().toISOString().split('T')[0],
  mythicCoins: 240, // Starting with some coins based on completed quests (12 * 20)
  inventory: [], // Empty inventory to start
  posts: [],
  following: ['2', '3'],
  followers: ['2', '3', '4'],
  bio: 'On a journey to wellness and self-discovery through the mystical realms of Eldoria.',
  authMethod: 'email',
  isAdmin: false,
  isActive: true,
  lastLoginDate: new Date(),
  createdAt: new Date('2024-01-15')
};

export const mockAvatars: Avatar[] = [
  {
    id: '1',
    name: 'Eldrin',
    imageUrl: '/20250603_1533_Wizard\'s+Enchanting+Dusk_simple_compose_01jwtky0xvehssba9p4hp9zdaf.gif',
    type: 'mage'
  },
  {
    id: '2',
    name: 'Thorna',
    imageUrl: 'https://images.pexels.com/photos/6945775/pexels-photo-6945775.jpeg?auto=compress&cs=tinysrgb&w=600',
    type: 'warrior'
  },
  {
    id: '3',
    name: 'Sylva',
    imageUrl: 'https://images.pexels.com/photos/8107167/pexels-photo-8107167.jpeg?auto=compress&cs=tinysrgb&w=600',
    type: 'healer'
  }
];

export const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Morning Stretch Ritual',
    description: 'Complete a 10-minute stretching routine to prepare your body for the day ahead.',
    type: 'exercise',
    difficulty: 'easy',
    xpReward: 50,
    coinReward: 20,
    completed: false
  },
  {
    id: '2',
    title: 'Forest Explorer',
    description: 'Walk 5 kilometers through the mystical forests of Eldoria using GPS tracking.',
    type: 'walking',
    difficulty: 'medium',
    xpReward: 100,
    coinReward: 20,
    completed: false,
    progress: 0,
    targetDistance: 5000,
    isTracking: false
  },
  {
    id: '3',
    title: 'Chronicles of the Mind',
    description: 'Write in your journal about your goals and dreams for 15 minutes.',
    type: 'journaling',
    difficulty: 'medium',
    xpReward: 75,
    coinReward: 20,
    completed: true
  },
  {
    id: '4',
    title: 'Meditation Mastery',
    description: 'Practice mindfulness meditation for 10 minutes to center your energy.',
    type: 'meditation',
    difficulty: 'easy',
    xpReward: 60,
    coinReward: 20,
    completed: false
  },
  {
    id: '5',
    title: 'Mountain Pilgrim',
    description: 'Embark on a 3-kilometer journey to strengthen your resolve and endurance.',
    type: 'walking',
    difficulty: 'easy',
    xpReward: 75,
    coinReward: 20,
    completed: false,
    progress: 0,
    targetDistance: 3000,
    isTracking: false
  }
];

export const mockStoryChapters: StoryChapter[] = [
  {
    id: '1',
    title: 'The Awakening',
    content: 'You arrive in the magical land of Eldoria, where the ancient spirits have chosen you to restore balance to the realm. Your journey begins in the Whispering Woods, where your magical companion first reveals themselves to you.',
    imageUrl: 'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlockedAt: new Date('2024-01-15'),
    questsLinked: ['1']
  },
  {
    id: '2',
    title: 'The First Trial',
    content: 'After proving your dedication through daily rituals, you face your first challenge: traversing the Misty Peaks. Each step you take in your world strengthens your ability to navigate this treacherous terrain.',
    imageUrl: 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlockedAt: new Date('2024-01-22'),
    questsLinked: ['2']
  }
];

export const mockFellows: Fellow[] = [
  {
    id: '2',
    name: 'Lyra Starweaver',
    level: 12,
    avatarUrl: 'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=600',
    specialty: 'Astral Magic',
    achievements: ['Mountain Conqueror', 'Manuscript Scholar'],
    online: true,
    bio: 'Weaving magic through mindful movement and celestial meditation.',
    posts: [],
    following: ['1', '3'],
    followers: ['1', '3', '4'],
    lastActive: new Date()
  },
  {
    id: '3',
    name: 'Grimthor',
    level: 8,
    avatarUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    specialty: 'Battle Tactics',
    achievements: ['Iron Will', 'Daily Streak: 30 Days'],
    online: false,
    bio: 'Forging strength through discipline and unwavering determination.',
    posts: [],
    following: ['1'],
    followers: ['1', '2'],
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '4',
    name: 'Elyndra',
    level: 15,
    avatarUrl: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=600',
    specialty: 'Nature Harmony',
    achievements: ['Grand Herbalist', 'Forest Guardian'],
    online: true,
    bio: 'Finding balance through nature\'s wisdom and herbal knowledge.',
    posts: [],
    following: ['1', '2', '3'],
    followers: ['1', '2'],
    lastActive: new Date()
  }
];

// Sample social posts
export const mockSocialPosts: SocialPost[] = [
  {
    id: 'post-1',
    userId: '2',
    userName: 'Lyra Starweaver',
    userAvatar: 'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=600',
    userLevel: 12,
    content: {
      caption: 'Just completed my morning meditation quest! The sunrise energy was incredible today. Feeling so centered and ready to take on whatever challenges await. ✨🧘‍♀️',
      mediaUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
      mediaType: 'image'
    },
    questTag: {
      questId: '4',
      questTitle: 'Meditation Mastery',
      questType: 'meditation'
    },
    likes: ['1', '3', '4'],
    comments: [
      {
        id: 'comment-1',
        userId: '1',
        userName: 'Adventurer',
        userAvatar: 'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=600',
        content: 'Beautiful shot! I need to start my meditation practice too.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'post-2',
    userId: '3',
    userName: 'Grimthor',
    userAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    userLevel: 8,
    content: {
      caption: 'Crushed my strength training session today! 💪 Nothing beats the feeling of pushing your limits and coming out stronger. The Iron Temple was calling my name!',
      mediaUrl: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800',
      mediaType: 'image'
    },
    achievementTag: {
      achievementId: 'iron-will',
      achievementTitle: 'Iron Will',
      achievementType: 'strength'
    },
    likes: ['1', '2'],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 'post-3',
    userId: '4',
    userName: 'Elyndra',
    userAvatar: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=600',
    userLevel: 15,
    content: {
      caption: 'Discovered this magical grove during my walking quest today! 🌿 Nature always has the best surprises when you take the time to truly explore. The energy here is incredible!',
      mediaUrl: 'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800',
      mediaType: 'image'
    },
    questTag: {
      questId: '2',
      questTitle: 'Forest Explorer',
      questType: 'walking'
    },
    likes: ['1', '2', '3'],
    comments: [
      {
        id: 'comment-2',
        userId: '2',
        userName: 'Lyra Starweaver',
        userAvatar: 'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=600',
        content: 'Wow, this place looks absolutely magical! Where is this?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'comment-3',
        userId: '1',
        userName: 'Adventurer',
        userAvatar: 'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=600',
        content: 'I need to find places like this for my own quests!',
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];