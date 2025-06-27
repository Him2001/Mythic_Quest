import { SocialPost, User } from '../types';
import { SocialService } from './socialService';

export class AchievementService {
  static createLevelUpPost(
    user: User,
    newLevel: number,
    xpEarned: number,
    coinsEarned: number
  ): SocialPost {
    const congratulatoryMessages = [
      `🎉 Just reached Level ${newLevel}! The mystical energies of Eldoria grow stronger with my dedication to wellness! ✨`,
      `⚡ Level ${newLevel} achieved! Another milestone on my legendary wellness journey through the realms of Eldoria! 🏆`,
      `🌟 Ascended to Level ${newLevel}! My commitment to health and wellness has unlocked new powers in the mystical realm! 💪`,
      `🔥 Level ${newLevel} unlocked! The ancient spirits of wellness have blessed my journey with incredible growth! 🙏`,
      `✨ Reached Level ${newLevel}! Every quest completed, every challenge overcome brings me closer to wellness mastery! 🎯`
    ];

    const randomMessage = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];
    
    // Create achievement tag
    const achievementTag = {
      achievementId: `level-${newLevel}`,
      achievementTitle: `Level ${newLevel} Achieved`,
      achievementType: 'level_up'
    };

    // Use a magical level-up image
    const levelUpImages = [
      'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=800', // Mountain peak
      'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800', // Magical forest
      'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800', // Sunrise meditation
      'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=800', // Peaceful nature
      'https://images.pexels.com/photos/6945775/pexels-photo-6945775.jpeg?auto=compress&cs=tinysrgb&w=800'  // Wellness journey
    ];

    const randomImage = levelUpImages[Math.floor(Math.random() * levelUpImages.length)];

    // Add rewards information to the message
    const fullMessage = `${randomMessage}\n\n🏆 Rewards Earned:\n⚡ +${xpEarned} XP\n💰 +${coinsEarned} Mythic Coins\n\n#WellnessJourney #LevelUp #MythicQuest #HealthGoals`;

    return SocialService.createPost(
      user.id,
      user.name,
      user.avatarUrl,
      newLevel, // Use the new level
      fullMessage,
      randomImage,
      'image',
      undefined, // No quest tag for level up posts
      achievementTag
    );
  }

  static createQuestCompletionPost(
    user: User,
    questTitle: string,
    questType: string,
    xpEarned: number,
    coinsEarned: number
  ): SocialPost {
    const questMessages = {
      walking: [
        `🚶‍♀️ Just completed "${questTitle}"! Every step brings me closer to wellness mastery! 👟✨`,
        `🌟 Conquered the walking quest "${questTitle}"! The paths of Eldoria have strengthened my resolve! 🏃‍♀️`,
        `⚡ Finished "${questTitle}" - my feet have carried me to new heights of wellness! 🦶💪`
      ],
      exercise: [
        `💪 Crushed the exercise quest "${questTitle}"! My body grows stronger with each challenge! 🏋️‍♀️`,
        `🔥 Completed "${questTitle}" - forging my warrior spirit through physical trials! ⚔️`,
        `🏆 Conquered "${questTitle}"! The Iron Temple has blessed my dedication! 💯`
      ],
      meditation: [
        `🧘‍♀️ Found inner peace through "${questTitle}"! The mystical energies flow through me! ✨`,
        `🌸 Completed "${questTitle}" - my mind is clearer, my spirit stronger! 🙏`,
        `⭐ Finished "${questTitle}" - the ancient wisdom guides my wellness journey! 🕯️`
      ],
      journaling: [
        `📝 Completed "${questTitle}"! My thoughts are now chronicles in the mystical realm! 📚`,
        `✍️ Finished "${questTitle}" - wisdom flows from pen to parchment! 📜`,
        `🌟 Conquered "${questTitle}" - my reflections light the path forward! 💭`
      ],
      reading: [
        `📚 Completed "${questTitle}"! Knowledge is the greatest treasure in any realm! 🧠`,
        `📖 Finished "${questTitle}" - wisdom gained, mind expanded! 🌟`,
        `⭐ Conquered "${questTitle}" - the ancient texts reveal their secrets! 📜`
      ]
    };

    const typeMessages = questMessages[questType as keyof typeof questMessages] || [
      `🎯 Completed "${questTitle}"! Another victory on my wellness journey! 🏆`
    ];

    const randomMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];
    
    // Add rewards information
    const fullMessage = `${randomMessage}\n\n🏆 Quest Rewards:\n⚡ +${xpEarned} XP\n💰 +${coinsEarned} Mythic Coins\n\n#QuestComplete #WellnessJourney #MythicQuest #HealthGoals`;

    // Select appropriate image based on quest type
    const questImages = {
      walking: 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=800',
      exercise: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800',
      meditation: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
      journaling: 'https://images.pexels.com/photos/4041389/pexels-photo-4041389.jpeg?auto=compress&cs=tinysrgb&w=800',
      reading: 'https://images.pexels.com/photos/4041388/pexels-photo-4041388.jpeg?auto=compress&cs=tinysrgb&w=800'
    };

    const questImage = questImages[questType as keyof typeof questImages] || 
                      'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800';

    const questTag = {
      questId: crypto.randomUUID(),
      questTitle,
      questType
    };

    return SocialService.createPost(
      user.id,
      user.name,
      user.avatarUrl,
      user.level,
      fullMessage,
      questImage,
      'image',
      questTag,
      undefined
    );
  }

  static createMilestonePost(
    user: User,
    milestoneType: 'first_quest' | 'streak_week' | 'streak_month' | 'coin_milestone',
    milestoneValue?: number
  ): SocialPost {
    const milestoneMessages = {
      first_quest: [
        `🎉 Just completed my very first quest in the mystical realm of Eldoria! The wellness journey begins! ✨`,
        `🌟 First quest conquered! Every legendary journey starts with a single step! 👣`,
        `⚡ My wellness adventure has officially begun with my first completed quest! 🚀`
      ],
      streak_week: [
        `🔥 7-day wellness streak achieved! The mystical energies grow stronger with consistency! 📅`,
        `⭐ One week of dedicated wellness practice complete! The realm rewards persistence! 🏆`,
        `💪 Seven days of commitment to my wellness journey - the streak continues! 🌟`
      ],
      streak_month: [
        `🏆 30-day wellness streak unlocked! I am becoming a true master of consistency! 👑`,
        `🌟 One month of unwavering dedication to wellness! The ancient spirits are pleased! ✨`,
        `⚡ 30 days of wellness mastery achieved! My commitment knows no bounds! 💯`
      ],
      coin_milestone: [
        `💰 Reached ${milestoneValue} Mythic Coins! My treasure hoard grows with each wellness victory! 🪙`,
        `🏆 ${milestoneValue} Mythic Coins collected! The realm rewards my dedication richly! 💎`,
        `⭐ Milestone achieved: ${milestoneValue} Mythic Coins! Wealth through wellness! 💰`
      ]
    };

    const typeMessages = milestoneMessages[milestoneType];
    const randomMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];
    
    const fullMessage = `${randomMessage}\n\n#Milestone #WellnessJourney #MythicQuest #Achievement #HealthGoals`;

    // Select appropriate image for milestone
    const milestoneImages = {
      first_quest: 'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800',
      streak_week: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
      streak_month: 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=800',
      coin_milestone: 'https://images.pexels.com/photos/6945775/pexels-photo-6945775.jpeg?auto=compress&cs=tinysrgb&w=800'
    };

    const achievementTag = {
      achievementId: `${milestoneType}-${Date.now()}`,
      achievementTitle: milestoneType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      achievementType: 'milestone'
    };

    return SocialService.createPost(
      user.id,
      user.name,
      user.avatarUrl,
      user.level,
      fullMessage,
      milestoneImages[milestoneType],
      'image',
      undefined,
      achievementTag
    );
  }

  static shouldShowLevelUpPopup(oldLevel: number, newLevel: number): boolean {
    return newLevel > oldLevel;
  }

  static calculateLevelUpRewards(newLevel: number): { xpEarned: number; coinsEarned: number } {
    // Base rewards that scale with level
    const baseXP = 50;
    const baseCoins = 100;
    
    // Bonus for higher levels
    const levelBonus = Math.floor(newLevel / 5) * 25;
    
    return {
      xpEarned: baseXP + levelBonus,
      coinsEarned: baseCoins + levelBonus
    };
  }
}