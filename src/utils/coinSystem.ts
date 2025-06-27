import { CoinTransaction } from '../types';

export class CoinSystem {
  private static readonly QUEST_COMPLETION_REWARD = 20;
  private static readonly LEVEL_UP_REWARD = 100;
  private static readonly DAILY_BONUS_REWARD = 10;

  static calculateQuestReward(questType: string, difficulty: string): number {
    const baseReward = this.QUEST_COMPLETION_REWARD;
    
    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };

    // Quest type bonus
    const typeBonus = {
      walking: 5,
      exercise: 5,
      meditation: 3,
      journaling: 3,
      reading: 2,
      social: 4,
      location: 10
    };

    const multiplier = difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1;
    const bonus = typeBonus[questType as keyof typeof typeBonus] || 0;

    return Math.round(baseReward * multiplier + bonus);
  }

  static calculateLevelUpReward(newLevel: number): number {
    // Bonus coins for reaching higher levels
    const levelBonus = Math.floor(newLevel / 5) * 25; // Extra 25 coins every 5 levels
    return this.LEVEL_UP_REWARD + levelBonus;
  }

  static createTransaction(
    amount: number,
    type: CoinTransaction['type'],
    description: string
  ): CoinTransaction {
    return {
      id: crypto.randomUUID(),
      amount,
      type,
      description,
      timestamp: new Date()
    };
  }

  static formatCoins(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  }

  static getCoinRarity(amount: number): 'common' | 'rare' | 'epic' | 'legendary' {
    if (amount >= 200) return 'legendary';
    if (amount >= 100) return 'epic';
    if (amount >= 50) return 'rare';
    return 'common';
  }

  static getDailyBonusAmount(consecutiveDays: number): number {
    // Increase daily bonus for consecutive days
    const streakBonus = Math.min(consecutiveDays * 2, 50); // Max 50 bonus
    return this.DAILY_BONUS_REWARD + streakBonus;
  }

  static getAchievementReward(achievementType: string): number {
    const rewards = {
      first_quest: 50,
      first_level_up: 100,
      week_streak: 150,
      month_streak: 500,
      hundred_quests: 1000,
      max_level: 2000
    };

    return rewards[achievementType as keyof typeof rewards] || 25;
  }
}