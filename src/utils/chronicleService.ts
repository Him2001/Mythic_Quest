import { Chronicle, User } from '../types';
import { ClaudeService } from './claudeService';
import { AuthService } from './authService';
import { SocialService } from './socialService';

export class ChronicleService {
  private static readonly STORAGE_KEY = 'mythic_chronicles';

  static getStoredData(): Record<string, Chronicle[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load chronicle data:', error);
      return {};
    }
  }

  static saveStoredData(data: Record<string, Chronicle[]>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save chronicle data:', error);
    }
  }

  static getUserChronicles(userId: string): Chronicle[] {
    const data = this.getStoredData();
    return data[userId] || [];
  }

  static addChronicle(userId: string, chronicle: Chronicle): void {
    const data = this.getStoredData();
    if (!data[userId]) {
      data[userId] = [];
    }
    
    // Add to beginning for newest first
    data[userId].unshift(chronicle);
    
    // Keep only last 52 weeks (1 year)
    if (data[userId].length > 52) {
      data[userId] = data[userId].slice(0, 52);
    }
    
    this.saveStoredData(data);
  }

  static updateChroniclePrivacy(userId: string, chronicleId: string, isPrivate: boolean): boolean {
    const data = this.getStoredData();
    const userChronicles = data[userId] || [];
    
    const chronicle = userChronicles.find(c => c.id === chronicleId);
    if (!chronicle) return false;
    
    chronicle.isPrivate = isPrivate;
    this.saveStoredData(data);
    return true;
  }

  static deleteChronicle(userId: string, chronicleId: string): boolean {
    const data = this.getStoredData();
    const userChronicles = data[userId] || [];
    
    const index = userChronicles.findIndex(c => c.id === chronicleId);
    if (index === -1) return false;
    
    userChronicles.splice(index, 1);
    this.saveStoredData(data);
    return true;
  }

  static async generateWeeklyChronicle(userId: string, weekOffset: number = 0): Promise<Chronicle> {
    const user = AuthService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { start, end } = ClaudeService.getWeekDateRange(weekOffset);
    const weekNumber = ClaudeService.getCurrentWeekNumber() - weekOffset;
    const weeklyData = ClaudeService.calculateWeeklyActivity(user, start, end);

    const chronicle = await ClaudeService.generateWeeklyChapter({
      user,
      weeklyData,
      weekNumber,
      startDate: start,
      endDate: end
    });

    // Save the chronicle
    this.addChronicle(userId, chronicle);
    
    return chronicle;
  }

  static getFriendsChronicles(userId: string): { user: User; chronicles: Chronicle[] }[] {
    const friends = SocialService.getFriends(userId);
    const friendsChronicles: { user: User; chronicles: Chronicle[] }[] = [];

    friends.forEach(friendId => {
      const friend = AuthService.getUserById(friendId);
      if (friend) {
        const chronicles = this.getUserChronicles(friendId)
          .filter(chronicle => !chronicle.isPrivate) // Only show public chronicles
          .slice(0, 3); // Show only latest 3 chronicles
        
        if (chronicles.length > 0) {
          friendsChronicles.push({ user: friend, chronicles });
        }
      }
    });

    return friendsChronicles.sort((a, b) => {
      // Sort by most recent chronicle
      const aLatest = a.chronicles[0]?.date || new Date(0);
      const bLatest = b.chronicles[0]?.date || new Date(0);
      return new Date(bLatest).getTime() - new Date(aLatest).getTime();
    });
  }

  static hasChronicleForWeek(userId: string, weekOffset: number = 0): boolean {
    const { start, end } = ClaudeService.getWeekDateRange(weekOffset);
    const chronicles = this.getUserChronicles(userId);
    
    return chronicles.some(chronicle => {
      const chronicleDate = new Date(chronicle.date);
      return chronicleDate >= start && chronicleDate <= end;
    });
  }

  static getChronicleForWeek(userId: string, weekOffset: number = 0): Chronicle | null {
    const { start, end } = ClaudeService.getWeekDateRange(weekOffset);
    const chronicles = this.getUserChronicles(userId);
    
    return chronicles.find(chronicle => {
      const chronicleDate = new Date(chronicle.date);
      return chronicleDate >= start && chronicleDate <= end;
    }) || null;
  }

  static async generateMissingChronicles(userId: string, weeksBack: number = 4): Promise<Chronicle[]> {
    const generatedChronicles: Chronicle[] = [];
    
    for (let i = 0; i < weeksBack; i++) {
      if (!this.hasChronicleForWeek(userId, i)) {
        try {
          const chronicle = await this.generateWeeklyChronicle(userId, i);
          generatedChronicles.push(chronicle);
          
          // Add delay between generations to avoid rate limiting
          if (i < weeksBack - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Failed to generate chronicle for week ${i}:`, error);
        }
      }
    }
    
    return generatedChronicles;
  }

  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (24 * 60 * 60 * 1000));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return '1 week ago';
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 60) return '1 month ago';
    
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  static getMoodEmoji(mood: string): string {
    const moodMap: Record<string, string> = {
      happy: '😊',
      determined: '💪',
      lazy: '😴',
      motivated: '🔥',
      reflective: '🤔',
      accomplished: '🏆',
      peaceful: '🧘‍♀️',
      energetic: '⚡',
      content: '😌'
    };
    return moodMap[mood] || '📖';
  }
}