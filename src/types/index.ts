export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Added password field
  level: number;
  xp: number;
  xpToNextLevel: number;
  avatarUrl: string;
  joinDate: Date;
  questsCompleted: number;
  dailyWalkingDistance: number; // meters walked today
  totalWalkingDistance: number; // total meters walked all time
  lastWalkingDate: string; // ISO date string for daily reset
  dailyStepCount: number; // steps taken today
  totalStepCount: number; // total steps taken all time
  lastStepCountDate: string; // ISO date string for daily step reset
  mythicCoins: number; // New currency system
  inventory: InventoryItem[]; // User's purchased items
  posts: SocialPost[]; // User's social media posts
  following: string[]; // IDs of users they follow
  followers: string[]; // IDs of users following them
  bio?: string; // User bio
  authMethod: 'email' | 'google' | 'facebook' | 'github' | 'face';
  isAdmin?: boolean;
  isActive: boolean;
  lastLoginDate: Date;
  createdAt: Date;
  isOnline?: boolean; // Online status
  lastSeenAt?: Date; // Last seen timestamp
  chronicles: Chronicle[]; // User's weekly chronicles
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestsCompleted: number;
  totalXPEarned: number;
  totalCoinsEarned: number;
  totalPosts: number;
  newUsersThisWeek: number;
  averageLevel: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  mythicCoins: number;
  questsCompleted: number;
  postsCount: number;
  joinDate: Date;
  lastLoginDate: Date;
  isActive: boolean;
  authMethod: string;
}

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  type: 'warrior' | 'mage' | 'rogue' | 'healer';
  voiceId?: string;
  videoTemplateId?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'walking' | 'exercise' | 'journaling' | 'meditation' | 'reading' | 'social' | 'location';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  coinReward?: number; // Optional coin reward for special quests
  completed: boolean;
  deadline?: Date;
  progress?: number;
  totalRequired?: number;
  isTracking?: boolean; // for GPS tracking quests
  targetDistance?: number; // in meters for walking quests
  targetSteps?: number; // target steps for walking quests
  currentSteps?: number; // current step count for walking quests
  targetLocation?: MagicalLocation; // for location-based quests
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  unlockedAt: Date;
  questsLinked: string[];
}

export interface Fellow {
  id: string;
  name: string;
  level: number;
  avatarUrl: string;
  specialty: string;
  achievements: string[];
  online: boolean;
  bio?: string;
  posts: SocialPost[];
  following: string[];
  followers: string[];
  lastActive: Date;
}

export interface Chronicle {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood?: string;
  questsCompleted: string[];
  fellowInteractions: string[];
  imageUrl?: string;
  weekNumber?: number; // Week number of the year
  isPrivate?: boolean; // Privacy setting for friends viewing
  xpGained?: number; // XP gained during this week
  coinsEarned?: number; // Coins earned during this week
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

export interface MagicalLocation {
  id: string;
  name: string;
  type: 'park' | 'gym' | 'library' | 'cafe' | 'landmark' | 'temple';
  latitude: number;
  longitude: number;
  description: string;
  magicalName: string;
  questReward: number;
  discovered: boolean;
  visitCount: number;
}

export interface LocationQuest {
  id: string;
  title: string;
  description: string;
  targetLocation: MagicalLocation;
  xpReward: number;
  completed: boolean;
  isActive: boolean;
  distanceToTarget?: number;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'quest_completion' | 'level_up' | 'daily_bonus' | 'achievement' | 'purchase';
  description: string;
  timestamp: Date;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'equipment' | 'clothing' | 'supplements' | 'accessories' | 'books';
  brand: string;
  priceUSD: number;
  priceCoins: number;
  discount?: {
    percentage: number;
    originalPriceUSD: number;
    originalPriceCoins: number;
    label: string;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  specifications?: Record<string, string>;
}

export interface InventoryItem {
  id: string;
  marketplaceItemId: string;
  purchaseDate: Date;
  purchaseMethod: 'coins' | 'card';
  pricePaid: number;
  quantity: number;
}

export interface CartItem {
  marketplaceItem: MarketplaceItem;
  quantity: number;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  transactionId?: string;
  inventoryItem?: InventoryItem;
}

// Friend Request System
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
}

// Social Media Types
export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  content: {
    caption: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  };
  questTag?: {
    questId: string;
    questTitle: string;
    questType: string;
  };
  achievementTag?: {
    achievementId: string;
    achievementTitle: string;
    achievementType: string;
  };
  likes: string[]; // Array of user IDs who liked
  comments: PostComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Date;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: DirectMessage;
  updatedAt: Date;
  unreadCount: Record<string, number>; // userId -> unread count
}

export interface SocialStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
}

// Notification System
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'comment' | 'like' | 'friend_request' | 'friend_accepted';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    postId?: string;
    conversationId?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  unreadMessages: number;
  lastChecked: Date;
}