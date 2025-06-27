import { User, Quest } from '../types';

interface QueuedMessage {
  text: string;
  priority: number;
  id: string;
}

export class VoiceMessageService {
  private static messageQueue: QueuedMessage[] = [];
  private static isPlaying = false;
  private static currentMessageId: string | null = null;
  private static rateLimitCooldownUntil: number = 0;
  private static readonly COOLDOWN_DURATION = 60000; // 1 minute cooldown

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
    } else if (totalCoins >= 500 && totalCoins < 550) {
      return `Impressive fortune, ${user.name}! ${totalCoins} Mythic Coins now fill your coffers! Your dedication to wellness pays handsomely!`;
    } else if (totalCoins >= 100 && totalCoins < 150) {
      return `Excellent progress, ${user.name}! Your coin collection has grown to ${totalCoins} Mythic Coins! The realm rewards your consistency!`;
    }
    return null;
  }

  // Walking distance achievements
  static getWalkingAchievementMessage(user: User, totalDistance: number): string | null {
    const distanceKm = Math.floor(totalDistance / 1000);
    if (distanceKm >= 100 && distanceKm < 105) {
      return `Incredible journey, ${user.name}! You've walked over ${distanceKm} kilometers in your wellness adventures! The paths of Eldoria echo with your footsteps!`;
    } else if (distanceKm >= 50 && distanceKm < 55) {
      return `Remarkable dedication, ${user.name}! ${distanceKm} kilometers conquered on your wellness journey! Your endurance is truly legendary!`;
    } else if (distanceKm >= 10 && distanceKm < 15) {
      return `Wonderful progress, ${user.name}! ${distanceKm} kilometers walked in pursuit of wellness! Every step strengthens your resolve!`;
    }
    return null;
  }

  // Handle rate limit error by setting cooldown
  static handleRateLimitError() {
    this.rateLimitCooldownUntil = Date.now() + this.COOLDOWN_DURATION;
    console.warn(`ElevenLabs rate limit hit. Voice messages disabled until ${new Date(this.rateLimitCooldownUntil).toLocaleTimeString()}`);
    
    // Clear the current queue to prevent further rate limit hits
    this.clearQueue();
    this.setPlaying(false);
  }

  // Check if we're still in cooldown period
  static isInCooldown(): boolean {
    return Date.now() < this.rateLimitCooldownUntil;
  }

  // Get remaining cooldown time in seconds
  static getRemainingCooldownTime(): number {
    if (!this.isInCooldown()) return 0;
    return Math.ceil((this.rateLimitCooldownUntil - Date.now()) / 1000);
  }

  // Queue management with strict prioritization
  static queueMessage(message: string, priority: number = 5) {
    if (!message || message.trim() === '') return;
    
    // Don't queue messages if we're in cooldown
    if (this.isInCooldown()) {
      console.warn(`Voice message queuing disabled due to rate limit cooldown. ${this.getRemainingCooldownTime()}s remaining.`);
      return;
    }
    
    // Clear any existing messages with the same priority to prevent duplicates
    this.messageQueue = this.messageQueue.filter(msg => msg.priority !== priority);
    
    const queuedMessage: QueuedMessage = {
      text: message,
      priority,
      id: crypto.randomUUID()
    };
    
    // Insert message in priority order (lower number = higher priority)
    let insertIndex = this.messageQueue.length;
    for (let i = 0; i < this.messageQueue.length; i++) {
      if (this.messageQueue[i].priority > priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.messageQueue.splice(insertIndex, 0, queuedMessage);
    
    console.log(`Queued message with priority ${priority}:`, message.substring(0, 50) + '...');
    console.log('Current queue length:', this.messageQueue.length);
  }

  static getNextMessage(): string | null {
    // Don't return messages if we're in cooldown
    if (this.isInCooldown()) {
      console.warn(`Voice messages disabled due to rate limit cooldown. ${this.getRemainingCooldownTime()}s remaining.`);
      return null;
    }
    
    if (this.messageQueue.length === 0) return null;
    
    const nextMessage = this.messageQueue.shift();
    if (nextMessage) {
      this.currentMessageId = nextMessage.id;
      console.log(`Playing message with priority ${nextMessage.priority}:`, nextMessage.text.substring(0, 50) + '...');
      return nextMessage.text;
    }
    
    return null;
  }

  static clearQueue() {
    console.log('Clearing voice message queue');
    this.messageQueue = [];
    this.currentMessageId = null;
  }

  static hasQueuedMessages(): boolean {
    return this.messageQueue.length > 0;
  }

  static setPlaying(playing: boolean) {
    console.log(`Voice playing status changed to: ${playing}`);
    this.isPlaying = playing;
    
    if (!playing) {
      this.currentMessageId = null;
    }
  }

  static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  static getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }

  // Priority constants for easy reference
  static readonly PRIORITY = {
    WELCOME: 1,
    QUEST_COMPLETION: 2,
    LEVEL_UP: 3,
    FRIEND_MESSAGE: 4,
    COIN_MILESTONE: 5
  } as const;
}