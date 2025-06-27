import { User, Quest, SocialPost, Chronicle } from '../types';

interface WeeklyActivityData {
  questsCompleted: Quest[];
  xpGained: number;
  coinsEarned: number;
  postsCreated: SocialPost[];
  walkingDistance: number;
  levelUps: number;
  achievements: string[];
  friendInteractions: number;
}

interface ChapterGenerationRequest {
  user: User;
  weeklyData: WeeklyActivityData;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}

export class ClaudeService {
  private static readonly CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
  private static readonly API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

  static async generateWeeklyChapter(request: ChapterGenerationRequest): Promise<Chronicle> {
    try {
      if (!this.API_KEY) {
        console.warn('Claude API key not configured, generating fallback chapter');
        return this.generateFallbackChapter(request);
      }

      const prompt = this.buildChapterPrompt(request);
      
      const response = await fetch(this.CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.8,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const chapterContent = data.content[0].text;

      return this.parseChapterResponse(chapterContent, request);
    } catch (error) {
      console.warn('Failed to generate chapter with Claude, using fallback:', error);
      return this.generateFallbackChapter(request);
    }
  }

  private static buildChapterPrompt(request: ChapterGenerationRequest): string {
    const { user, weeklyData, weekNumber, startDate, endDate } = request;
    
    const hasActivity = weeklyData.questsCompleted.length > 0 || 
                       weeklyData.postsCreated.length > 0 || 
                       weeklyData.walkingDistance > 0;

    const activitySummary = hasActivity ? 
      this.buildActivitySummary(weeklyData) : 
      "No significant activity detected this week.";

    return `You are Eldrin the Mage Guide, narrator of the mystical wellness realm of Eldoria. Write a weekly chapter for ${user.name}'s wellness journey.

IMPORTANT STYLE REQUIREMENTS:
- Write as Eldrin the Mage Guide in first person, addressing ${user.name} directly
- Use fantasy/mystical language with magical metaphors
- Include lighthearted humor and gentle sarcasm when appropriate
- If little/no activity: Use comical, mock-serious tone (e.g., "The Great Week of Eternal Napping")
- Keep it engaging, motivational, and entertaining
- Length: 150-250 words

USER PROFILE:
- Name: ${user.name}
- Current Level: ${user.level}
- Total XP: ${user.xp}
- Mythic Coins: ${user.mythicCoins}
- Quests Completed (All Time): ${user.questsCompleted}

WEEK ${weekNumber} ACTIVITY (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}):
${activitySummary}

${hasActivity ? 
  'Focus on their achievements with mystical flair and encouragement for continued growth.' :
  'Create a humorous chapter about their "legendary" week of rest, with gentle motivation to return to action.'
}

FORMAT YOUR RESPONSE AS:
TITLE: [Creative chapter title like "Chapter ${weekNumber}: The Great Treadmill Escape"]
CONTENT: [The narrative content]
MOOD: [happy/determined/lazy/motivated/reflective]`;
  }

  private static buildActivitySummary(data: WeeklyActivityData): string {
    let summary = '';

    if (data.questsCompleted.length > 0) {
      summary += `Quests Completed (${data.questsCompleted.length}):\n`;
      data.questsCompleted.forEach(quest => {
        summary += `- ${quest.title} (${quest.type}, ${quest.xpReward} XP)\n`;
      });
      summary += '\n';
    }

    if (data.walkingDistance > 0) {
      summary += `Walking Distance: ${(data.walkingDistance / 1000).toFixed(2)} km\n`;
    }

    if (data.xpGained > 0) {
      summary += `Total XP Gained: ${data.xpGained}\n`;
    }

    if (data.coinsEarned > 0) {
      summary += `Mythic Coins Earned: ${data.coinsEarned}\n`;
    }

    if (data.levelUps > 0) {
      summary += `Level Ups: ${data.levelUps}\n`;
    }

    if (data.postsCreated.length > 0) {
      summary += `Social Posts Created: ${data.postsCreated.length}\n`;
      data.postsCreated.forEach(post => {
        const preview = post.content.caption.substring(0, 50) + '...';
        summary += `- "${preview}"\n`;
      });
    }

    if (data.friendInteractions > 0) {
      summary += `Friend Interactions: ${data.friendInteractions}\n`;
    }

    return summary || 'No significant activity this week.';
  }

  private static parseChapterResponse(response: string, request: ChapterGenerationRequest): Chronicle {
    const lines = response.split('\n');
    let title = `Chapter ${request.weekNumber}: The Weekly Chronicle`;
    let content = response;
    let mood = 'neutral';

    // Extract title if provided
    const titleLine = lines.find(line => line.startsWith('TITLE:'));
    if (titleLine) {
      title = titleLine.replace('TITLE:', '').trim();
    }

    // Extract content
    const contentStart = lines.findIndex(line => line.startsWith('CONTENT:'));
    if (contentStart !== -1) {
      content = lines.slice(contentStart + 1)
        .filter(line => !line.startsWith('MOOD:'))
        .join('\n')
        .trim();
    }

    // Extract mood
    const moodLine = lines.find(line => line.startsWith('MOOD:'));
    if (moodLine) {
      mood = moodLine.replace('MOOD:', '').trim().toLowerCase();
    }

    return {
      id: crypto.randomUUID(),
      date: request.endDate,
      title,
      content,
      mood,
      questsCompleted: request.weeklyData.questsCompleted.map(q => q.id),
      fellowInteractions: [],
      imageUrl: this.selectChapterImage(mood, request.weeklyData),
      weekNumber: request.weekNumber,
      isPrivate: false,
      xpGained: request.weeklyData.xpGained,
      coinsEarned: request.weeklyData.coinsEarned
    };
  }

  private static generateFallbackChapter(request: ChapterGenerationRequest): Chronicle {
    const { user, weeklyData, weekNumber, endDate } = request;
    
    const hasActivity = weeklyData.questsCompleted.length > 0 || 
                       weeklyData.walkingDistance > 0 || 
                       weeklyData.postsCreated.length > 0;

    let title: string;
    let content: string;
    let mood: string;

    if (!hasActivity) {
      // Humorous lazy week chapters
      const lazyTitles = [
        `Chapter ${weekNumber}: The Great Week of Eternal Napping`,
        `Chapter ${weekNumber}: Sir Sleeps-A-Lot Strikes Again`,
        `Chapter ${weekNumber}: The Legendary Couch Conquest`,
        `Chapter ${weekNumber}: The Mystical Art of Doing Nothing`,
        `Chapter ${weekNumber}: The Week That Time Forgot`
      ];

      const lazyContents = [
        `Greetings, ${user.name}! Eldrin here, and I must say, this week you've mastered the ancient art of... well, absolutely nothing! 😴\n\nThe mystical realm of Eldoria watched in awe as you demonstrated the legendary "Couch Guardian" technique for seven straight days. Your dedication to rest was so profound that even the laziest dragons took notes!\n\nBut fear not, dear adventurer! Every hero needs their rest, and you've certainly earned yours. The realm awaits your return with open arms and plenty of quests ready for your legendary comeback! ⚡✨`,
        
        `Ah, ${user.name}! What a week it has been... or should I say, what a week it HASN'T been! 🧙‍♂️\n\nYour mastery of the "Invisible Adventurer" spell was so complete that I almost forgot you existed! The quest boards gathered dust, the walking paths grew lonely, and even your Mythic Coins started wondering if they'd been abandoned.\n\nBut every great saga has its quiet chapters, and yours was beautifully... quiet. Perhaps next week we'll see the triumphant return of the legendary ${user.name}? The realm is ready when you are! 🌟`,
        
        `Dearest ${user.name}, Eldrin speaking from the mystical realm where... well, where nothing happened! 📜\n\nThis week you achieved something truly remarkable: you made time stand still! Not through powerful magic, mind you, but through the sheer force of inactivity. The ancient spirits are impressed by your commitment to the "Do Nothing" philosophy.\n\nBut I sense great potential stirring within you. The wellness realm calls your name, and adventure awaits! Ready to shake off the dust and reclaim your destiny? ⚔️✨`
      ];

      title = lazyTitles[Math.floor(Math.random() * lazyTitles.length)];
      content = lazyContents[Math.floor(Math.random() * lazyContents.length)];
      mood = 'lazy';
    } else {
      // Active week chapters
      title = `Chapter ${weekNumber}: The Wellness Warrior's Week`;
      
      const questCount = weeklyData.questsCompleted.length;
      const walkingKm = (weeklyData.walkingDistance / 1000).toFixed(1);
      
      content = `Greetings, mighty ${user.name}! Eldrin here with tales of your legendary week! ⚔️✨\n\n`;
      
      if (questCount > 0) {
        content += `You conquered ${questCount} quest${questCount > 1 ? 's' : ''} with the determination of a true wellness warrior! `;
      }
      
      if (weeklyData.walkingDistance > 0) {
        content += `Your feet carried you ${walkingKm} kilometers through the mystical paths of Eldoria! `;
      }
      
      if (weeklyData.xpGained > 0) {
        content += `You gained ${weeklyData.xpGained} XP, growing stronger with each challenge! `;
      }
      
      if (weeklyData.coinsEarned > 0) {
        content += `Your treasure hoard increased by ${weeklyData.coinsEarned} Mythic Coins! `;
      }
      
      content += `\n\nThe realm celebrates your dedication, and the ancient spirits whisper of even greater adventures ahead. Keep walking the path of wellness, brave adventurer! 🌟🏆`;
      
      mood = 'determined';
    }

    return {
      id: crypto.randomUUID(),
      date: endDate,
      title,
      content,
      mood,
      questsCompleted: weeklyData.questsCompleted.map(q => q.id),
      fellowInteractions: [],
      imageUrl: this.selectChapterImage(mood, weeklyData),
      weekNumber,
      isPrivate: false,
      xpGained: weeklyData.xpGained,
      coinsEarned: weeklyData.coinsEarned
    };
  }

  private static selectChapterImage(mood: string, data: WeeklyActivityData): string {
    const imageMap: Record<string, string[]> = {
      lazy: [
        'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      determined: [
        'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      happy: [
        'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      motivated: [
        'https://images.pexels.com/photos/6945775/pexels-photo-6945775.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/8107167/pexels-photo-8107167.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    };

    const moodImages = imageMap[mood] || imageMap.determined;
    return moodImages[Math.floor(Math.random() * moodImages.length)];
  }

  static calculateWeeklyActivity(user: User, startDate: Date, endDate: Date): WeeklyActivityData {
    // In a real app, this would query actual user activity data
    // For now, we'll simulate based on current user state
    
    const weeklyQuests = user.posts
      .filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= startDate && postDate <= endDate && post.questTag;
      })
      .map(post => ({
        id: post.questTag!.questId,
        title: post.questTag!.questTitle,
        type: post.questTag!.questType as any,
        xpReward: 50, // Estimated
        completed: true
      }));

    const weeklyPosts = user.posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= startDate && postDate <= endDate;
    });

    // Simulate weekly data based on user's overall progress
    const estimatedXP = weeklyQuests.length * 50;
    const estimatedCoins = weeklyQuests.length * 20;
    const estimatedWalking = Math.random() * 10000; // 0-10km
    const estimatedInteractions = weeklyPosts.length * 2;

    return {
      questsCompleted: weeklyQuests,
      xpGained: estimatedXP,
      coinsEarned: estimatedCoins,
      postsCreated: weeklyPosts,
      walkingDistance: estimatedWalking,
      levelUps: 0, // Would be calculated from XP changes
      achievements: [],
      friendInteractions: estimatedInteractions
    };
  }

  static getWeekDateRange(weekOffset: number = 0): { start: Date; end: Date } {
    const now = new Date();
    const currentDay = now.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday - (weekOffset * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { start: weekStart, end: weekEnd };
  }

  static getCurrentWeekNumber(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  }
}