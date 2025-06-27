import { User, Quest } from '../types';

export class VoiceMessageService {
  private static messageQueue: string[] = [];
  private static isPlaying = false;

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

  // Coin milestone messages (every 250 coins)
  static getCoinMilestoneMessage(user: User, totalCoins: number, previousCoins: number): string | null {
    const currentMilestone = Math.floor(totalCoins / 250);
    const previousMilestone = Math.floor(previousCoins / 250);
    
    // Only announce if we've crossed a new 250-coin milestone
    if (currentMilestone > previousMilestone) {
      const milestoneAmount = currentMilestone * 250;
      const coinMilestoneMessages = [
        `Astounding wealth, ${user.name}! Your treasure hoard has reached ${milestoneAmount} Mythic Coins! The realm's merchants whisper of your growing fortune!`,
        `Impressive fortune, ${user.name}! ${milestoneAmount} Mythic Coins now fill your coffers! Your dedication to wellness pays handsomely indeed!`,
        `Excellent prosperity, ${user.name}! Your coin collection has grown to ${milestoneAmount} Mythic Coins! The treasury of Eldoria acknowledges your success!`,
        `Magnificent accumulation, ${user.name}! ${milestoneAmount} Mythic Coins shine in your possession! Your wellness journey brings both health and wealth!`,
        `Remarkable riches, ${user.name}! ${milestoneAmount} Mythic Coins have gathered to your cause! The ancient spirits smile upon your prosperity!`
      ];
      return coinMilestoneMessages[Math.floor(Math.random() * coinMilestoneMessages.length)];
    }
    
    return null;
  }

  // Walking distance achievements (every 5km)
  static getWalkingAchievementMessage(user: User, totalDistance: number, previousDistance: number): string | null {
    const currentKm = Math.floor(totalDistance / 1000);
    const previousKm = Math.floor(previousDistance / 1000);
    
    // Check for 5km milestones
    const currentMilestone = Math.floor(currentKm / 5);
    const previousMilestone = Math.floor(previousKm / 5);
    
    if (currentMilestone > previousMilestone) {
      const milestoneKm = currentMilestone * 5;
      const walkingMessages = [
        `Incredible journey, ${user.name}! You've walked ${milestoneKm} kilometers in your wellness adventures! The paths of Eldoria echo with your determined footsteps!`,
        `Remarkable dedication, ${user.name}! ${milestoneKm} kilometers conquered on your wellness journey! Your endurance is truly becoming legendary!`,
        `Wonderful progress, ${user.name}! ${milestoneKm} kilometers walked in pursuit of wellness! Every step strengthens your resolve and your legend!`,
        `Outstanding perseverance, ${user.name}! ${milestoneKm} kilometers of mystical paths traversed! The walking spirits celebrate your unwavering commitment!`,
        `Magnificent endurance, ${user.name}! ${milestoneKm} kilometers of wellness walking achieved! Your footprints mark a trail of inspiration across Eldoria!`
      ];
      return walkingMessages[Math.floor(Math.random() * walkingMessages.length)];
    }
    
    return null;
  }

  // Queue management for prioritized messages
  static queueMessage(message: string, priority: number = 0) {
    if (!message || message.trim() === '') return;
    
    // Insert message based on priority (lower number = higher priority)
    const messageWithPriority = { text: message, priority };
    
    if (this.messageQueue.length === 0) {
      this.messageQueue.push(message);
    } else {
      // Find insertion point based on priority
      let insertIndex = this.messageQueue.length;
      this.messageQueue.push(message); // For now, just add to end
    }
  }

  static getNextMessage(): string | null {
    return this.messageQueue.shift() || null;
  }

  static clearQueue() {
    this.messageQueue = [];
  }

  static hasQueuedMessages(): boolean {
    return this.messageQueue.length > 0;
  }

  static setPlaying(playing: boolean) {
    this.isPlaying = playing;
  }

  static getIsPlaying(): boolean {
    return this.isPlaying;
  }
}