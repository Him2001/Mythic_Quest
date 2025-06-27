import { User, Quest } from '../types';
import { supabase } from './supabaseClient';

interface QueuedMessage {
  id: string;
  text: string;
  priority: number;
  userId: string;
  type: 'welcome' | 'quest_completion' | 'level_up' | 'friend_message' | 'coin_milestone';
  timestamp: Date;
  played: boolean;
}

export class VoiceMessageService {
  private static messageQueue: QueuedMessage[] = [];
  private static isPlaying = false;
  private static currentPlayingId: string | null = null;
  private static playbackTimeout: NodeJS.Timeout | null = null;
  private static supabasePersistenceEnabled = true;

  // Priority levels (lower number = higher priority)
  private static readonly PRIORITIES = {
    welcome: 1,
    quest_completion: 2,
    level_up: 3,
    friend_message: 4,
    coin_milestone: 5
  };

  // Load queue from Supabase on initialization
  static async initializeQueue(userId: string) {
    if (!supabase || !this.supabasePersistenceEnabled) return;

    try {
      const { data, error } = await supabase
        .from('voice_message_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('played', false)
        .order('priority', { ascending: true })
        .order('timestamp', { ascending: true });

      if (error) {
        // Check if the error is due to missing table
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Voice message queue table does not exist, falling back to local-only mode');
          this.supabasePersistenceEnabled = false;
          return;
        }
        throw error;
      }

      if (data) {
        this.messageQueue = data.map(item => ({
          id: item.id,
          text: item.message_text,
          priority: item.priority,
          userId: item.user_id,
          type: item.message_type,
          timestamp: new Date(item.timestamp),
          played: item.played
        }));
      }
    } catch (error) {
      console.warn('Failed to load voice queue from Supabase:', error);
      this.supabasePersistenceEnabled = false;
    }
  }

  // Save message to Supabase
  private static async saveMessageToSupabase(message: QueuedMessage) {
    if (!supabase || !this.supabasePersistenceEnabled) return;

    try {
      await supabase
        .from('voice_message_queue')
        .insert({
          id: message.id,
          user_id: message.userId,
          message_text: message.text,
          message_type: message.type,
          priority: message.priority,
          timestamp: message.timestamp.toISOString(),
          played: message.played
        });
    } catch (error) {
      console.warn('Failed to save voice message to Supabase:', error);
      this.supabasePersistenceEnabled = false;
    }
  }

  // Mark message as played in Supabase
  private static async markMessageAsPlayed(messageId: string) {
    if (!supabase || !this.supabasePersistenceEnabled) return;

    try {
      await supabase
        .from('voice_message_queue')
        .update({ played: true })
        .eq('id', messageId);
    } catch (error) {
      console.warn('Failed to mark message as played in Supabase:', error);
      this.supabasePersistenceEnabled = false;
    }
  }

  // Clean up old played messages from Supabase
  private static async cleanupOldMessages(userId: string) {
    if (!supabase || !this.supabasePersistenceEnabled) return;

    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      await supabase
        .from('voice_message_queue')
        .delete()
        .eq('user_id', userId)
        .eq('played', true)
        .lt('timestamp', oneDayAgo.toISOString());
    } catch (error) {
      console.warn('Failed to cleanup old messages:', error);
      this.supabasePersistenceEnabled = false;
    }
  }

  // Queue a new message with priority
  static async queueMessage(
    userId: string,
    text: string, 
    type: QueuedMessage['type'],
    priority?: number
  ) {
    if (!text || text.trim() === '') return;

    const message: QueuedMessage = {
      id: crypto.randomUUID(),
      text: text.trim(),
      priority: priority || this.PRIORITIES[type],
      userId,
      type,
      timestamp: new Date(),
      played: false
    };

    // Add to local queue
    this.messageQueue.push(message);
    
    // Sort queue by priority, then by timestamp
    this.messageQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    // Save to Supabase only if persistence is enabled
    if (this.supabasePersistenceEnabled) {
      await this.saveMessageToSupabase(message);
    }

    // Start processing if not already playing
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  // Process the queue with proper timing
  private static async processQueue() {
    if (this.isPlaying || this.messageQueue.length === 0) return;

    const nextMessage = this.messageQueue.find(msg => !msg.played);
    if (!nextMessage) return;

    this.isPlaying = true;
    this.currentPlayingId = nextMessage.id;

    // Mark message as played locally
    nextMessage.played = true;
    
    // Mark as played in Supabase only if persistence is enabled
    if (this.supabasePersistenceEnabled) {
      await this.markMessageAsPlayed(nextMessage.id);
    }

    // Remove from local queue
    this.messageQueue = this.messageQueue.filter(msg => msg.id !== nextMessage.id);

    // Trigger voice playback (this will be handled by the component)
    this.triggerVoicePlayback(nextMessage.text);
  }

  // This method will be called by the voice component when playback completes
  static async onVoicePlaybackComplete() {
    this.isPlaying = false;
    this.currentPlayingId = null;

    // Clear any existing timeout
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
    }

    // Wait 1 second before processing next message
    this.playbackTimeout = setTimeout(() => {
      this.processQueue();
    }, 1000);
  }

  // Get the next message to play (for the voice component)
  static getNextMessageToPlay(): string | null {
    if (!this.isPlaying) return null;
    
    const playingMessage = this.messageQueue.find(msg => msg.id === this.currentPlayingId);
    return playingMessage ? playingMessage.text : null;
  }

  // Check if currently playing
  static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Get current playing message ID
  static getCurrentPlayingId(): string | null {
    return this.currentPlayingId;
  }

  // Clear all messages for a user
  static async clearAllMessages(userId: string) {
    this.messageQueue = this.messageQueue.filter(msg => msg.userId !== userId);
    
    if (supabase && this.supabasePersistenceEnabled) {
      try {
        await supabase
          .from('voice_message_queue')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Failed to clear messages from Supabase:', error);
        this.supabasePersistenceEnabled = false;
      }
    }
  }

  // Force stop current playback
  static forceStop() {
    this.isPlaying = false;
    this.currentPlayingId = null;
    
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }
  }

  // Trigger voice playback (to be overridden by the component)
  private static triggerVoicePlayback(text: string) {
    // This will be handled by the voice component through a callback
    window.dispatchEvent(new CustomEvent('playVoiceMessage', { detail: { text } }));
  }

  // Welcome messages based on quest count
  static getWelcomeMessage(user: User, activeQuestCount: number): string {
    if (activeQuestCount === 0) {
      const noQuestMessages = [
        `Ah, ${user.name}! I see you've achieved the legendary status of "Quest Completionist"! The realm is so peaceful without any pending adventures... perhaps too peaceful?`,
        `Greetings, ${user.name}! You've reached the mystical state of having zero quests remaining. The ancient scrolls speak of this as "Peak Productivity" - a rare and wondrous achievement!`,
        `Well, well, ${user.name}! Look who's conquered every challenge in sight! The quest board stands empty, trembling in awe of your dedication. Time to rest those heroic laurels!`,
        `Behold, ${user.name}! You've achieved what few dare attempt - a completely clear quest log! The realm celebrates your efficiency while secretly wondering what you'll do with all this free time.`
      ];
      return noQuestMessages[Math.floor(Math.random() * noQuestMessages.length)];
    } else if (activeQuestCount > 5) {
      const lazyMessages = [
        `Oh my, ${user.name}! I see you've been... "collecting" quests like rare artifacts! ${activeQuestCount} pending adventures await your attention. Perhaps it's time to stop window shopping and start adventuring?`,
        `Greetings, ${user.name}! Your quest collection has grown to an impressive ${activeQuestCount} items! At this rate, you'll need a separate realm just to store them all. Shall we perhaps... complete one or two?`,
        `Well hello there, ${user.name}! I couldn't help but notice your ${activeQuestCount} quests patiently waiting like loyal pets. They're starting to form a support group called "The Forgotten Adventures." Time to show them some love?`,
        `Ah, ${user.name}! Your ${activeQuestCount} pending quests have been having quite the party in your quest log. They've even elected a spokesperson to ask when you might grace them with your presence!`
      ];
      return lazyMessages[Math.floor(Math.random() * lazyMessages.length)];
    } else {
      const regularMessages = [
        `Welcome back, ${user.name}! Ready to continue your journey today? You have ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} awaiting your heroic attention!`,
        `The magical realms of Eldoria await your next adventure, ${user.name}! ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} stand${activeQuestCount === 1 ? 's' : ''} ready to test your resolve.`,
        `Greetings, brave one! Your destiny in Eldoria continues to unfold with ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} ready for completion.`,
        `Your coin purse grows heavier with each quest, ${user.name}! ${activeQuestCount} adventure${activeQuestCount > 1 ? 's' : ''} await${activeQuestCount === 1 ? 's' : ''} your legendary touch.`
      ];
      return regularMessages[Math.floor(Math.random() * regularMessages.length)];
    }
  }

  // Level up congratulations
  static getLevelUpMessage(user: User, newLevel: number, coinsEarned: number): string {
    const levelUpMessages = [
      `Magnificent! ${user.name}, you have ascended to Level ${newLevel}! The mystical energies of Eldoria surge through you, and your coin purse swells with ${coinsEarned} additional Mythic Coins!`,
      `Behold! Level ${newLevel} achieved, ${user.name}! The ancient spirits celebrate your dedication, blessing you with ${coinsEarned} precious Mythic Coins as reward for your perseverance!`,
      `Extraordinary! ${user.name}, your wellness journey has elevated you to Level ${newLevel}! The realm acknowledges your growth with ${coinsEarned} gleaming Mythic Coins!`,
      `Splendid work, ${user.name}! Level ${newLevel} unlocked! Your commitment to wellness has earned you not just power, but ${coinsEarned} valuable Mythic Coins to aid your future adventures!`,
      `Remarkable achievement! ${user.name}, you now stand at Level ${newLevel}! The treasury of Eldoria opens to grant you ${coinsEarned} Mythic Coins in recognition of your legendary progress!`
    ];
    return levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
  }

  // Quest completion messages
  static getQuestCompletionMessage(user: User, questTitle: string, questType: string, coinsEarned: number): string {
    const questMessages = {
      walking: [
        `Excellent work, ${user.name}! You've conquered "${questTitle}" with every step! Your journey rewards you with ${coinsEarned} Mythic Coins. The paths of Eldoria sing of your dedication!`,
        `Bravo! "${questTitle}" completed, ${user.name}! Your feet have carried you to victory, earning ${coinsEarned} precious Mythic Coins. The walking spirits are most pleased!`,
        `Outstanding! ${user.name}, "${questTitle}" falls before your determined stride! ${coinsEarned} Mythic Coins now grace your purse as testament to your perseverance!`
      ],
      exercise: [
        `Magnificent! ${user.name}, you've crushed "${questTitle}" with the strength of a true warrior! Your physical prowess earns you ${coinsEarned} Mythic Coins!`,
        `Incredible! "${questTitle}" conquered through sheer determination, ${user.name}! The Iron Temple blesses you with ${coinsEarned} Mythic Coins for your dedication!`,
        `Phenomenal! ${user.name}, "${questTitle}" yields to your mighty efforts! ${coinsEarned} Mythic Coins are yours as reward for your physical mastery!`
      ],
      meditation: [
        `Serene and powerful! ${user.name}, you've found inner peace through "${questTitle}"! The mystical energies reward your tranquility with ${coinsEarned} Mythic Coins!`,
        `Beautifully done! "${questTitle}" completed with perfect mindfulness, ${user.name}! Your centered spirit earns ${coinsEarned} precious Mythic Coins!`,
        `Wonderfully peaceful! ${user.name}, "${questTitle}" brings you closer to enlightenment and ${coinsEarned} Mythic Coins richer!`
      ],
      journaling: [
        `Thoughtfully executed! ${user.name}, "${questTitle}" captures your wisdom perfectly! Your reflective nature earns you ${coinsEarned} Mythic Coins!`,
        `Brilliantly written! "${questTitle}" completed, ${user.name}! Your chronicles are rewarded with ${coinsEarned} gleaming Mythic Coins!`,
        `Masterfully reflected! ${user.name}, "${questTitle}" showcases your inner wisdom, earning ${coinsEarned} valuable Mythic Coins!`
      ],
      reading: [
        `Intellectually stimulating! ${user.name}, you've absorbed the wisdom of "${questTitle}"! Knowledge and ${coinsEarned} Mythic Coins are now yours!`,
        `Scholarly achievement! "${questTitle}" completed, ${user.name}! Your thirst for knowledge rewards you with ${coinsEarned} precious Mythic Coins!`,
        `Wisely pursued! ${user.name}, "${questTitle}" expands your mind and your wealth by ${coinsEarned} Mythic Coins!`
      ]
    };

    const typeMessages = questMessages[questType as keyof typeof questMessages] || [
      `Excellently done! ${user.name}, you've completed "${questTitle}" with remarkable skill! Your achievement earns you ${coinsEarned} Mythic Coins!`
    ];

    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  // Friend message notifications
  static getFriendMessageNotification(friendName: string): string {
    const messageNotifications = [
      `Ah! A message has arrived from your fellow adventurer, ${friendName}! They seek your attention in the realm of friendship.`,
      `Wonderful! ${friendName} has sent word from their own wellness journey! A message awaits your reading.`,
      `Delightful! Your friend ${friendName} has reached out across the mystical networks! Their message sparkles with friendship.`,
      `Marvelous! ${friendName} sends greetings from their adventures! A friendly message has materialized in your communications.`,
      `Splendid! ${friendName} has shared thoughts from their quest! Their message glows with the warmth of camaraderie.`
    ];
    return messageNotifications[Math.floor(Math.random() * messageNotifications.length)];
  }

  // Coin milestone messages
  static getCoinMilestoneMessage(user: User, totalCoins: number): string | null {
    if (totalCoins >= 1000 && totalCoins < 1100) {
      return `Astounding wealth, ${user.name}! Your treasure hoard has reached ${totalCoins} Mythic Coins! You're becoming quite the wealthy adventurer in Eldoria!`;
    } else if (totalCoins >= 500 && totalCoins < 600) {
      return `Impressive fortune, ${user.name}! ${totalCoins} Mythic Coins now fill your coffers! Your dedication to wellness pays handsomely!`;
    } else if (totalCoins >= 100 && totalCoins < 200) {
      return `Excellent progress, ${user.name}! Your coin collection has grown to ${totalCoins} Mythic Coins! The realm rewards your consistency!`;
    }
    return null;
  }

  // Walking distance achievements
  static getWalkingAchievementMessage(user: User, totalDistance: number): string | null {
    const distanceKm = Math.floor(totalDistance / 1000);
    if (distanceKm >= 100 && distanceKm < 110) {
      return `Incredible journey, ${user.name}! You've walked over ${distanceKm} kilometers in your wellness adventures! The paths of Eldoria echo with your footsteps!`;
    } else if (distanceKm >= 50 && distanceKm < 60) {
      return `Remarkable dedication, ${user.name}! ${distanceKm} kilometers conquered on your wellness journey! Your endurance is truly legendary!`;
    } else if (distanceKm >= 10 && distanceKm < 20) {
      return `Wonderful progress, ${user.name}! ${distanceKm} kilometers walked in pursuit of wellness! Every step strengthens your resolve!`;
    }
    return null;
  }

  // Cleanup method to be called periodically
  static async performCleanup(userId: string) {
    if (this.supabasePersistenceEnabled) {
      await this.cleanupOldMessages(userId);
    }
  }
}