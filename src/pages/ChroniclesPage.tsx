import React, { useState, useEffect } from 'react';
import { Chronicle, User } from '../types';
import { SupabaseService } from '../utils/supabaseService';
import { ChronicleService } from '../utils/chronicleService';
import ChronicleEntry from '../components/storySystem/ChronicleEntry';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { ScrollText, PenTool, Calendar, Users, Lock, Unlock, Sparkles, BookOpen, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ChroniclesPageProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const ChroniclesPage: React.FC<ChroniclesPageProps> = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'my-chronicles' | 'friends-chronicles'>('my-chronicles');
  const [chronicles, setChronicles] = useState<any[]>([]);
  const [friendsChronicles, setFriendsChronicles] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChronicles();
    loadFriendsChronicles();
  }, [user.id]);

  const loadChronicles = async () => {
    setIsLoading(true);
    try {
      const userChronicles = await SupabaseService.getUserChronicles(user.id);
      setChronicles(userChronicles);
    } catch (error) {
      console.error('Failed to load chronicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendsChronicles = async () => {
    try {
      const friendsData = await SupabaseService.getFriendsChronicles(user.id);
      setFriendsChronicles(friendsData);
    } catch (error) {
      console.error('Failed to load friends chronicles:', error);
    }
  };

  const generateFantasyTale = async () => {
    setIsGenerating(true);
    try {
      // Generate a fantasy tale based on user's achievements
      const tale = await generateUserFantasyTale(user);
      
      // Create chronicle entry
      const chronicle = await SupabaseService.createChronicle(
        user.id,
        tale.title,
        tale.content,
        tale.mood,
        getCurrentWeekNumber(),
        tale.xpGained,
        tale.coinsEarned,
        tale.imageUrl,
        false // Public by default
      );
      
      if (chronicle) {
        loadChronicles();
      }
    } catch (error) {
      console.error('Failed to generate fantasy tale:', error);
      alert('Failed to generate your fantasy tale. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePrivacy = async (chronicleId: string, isPrivate: boolean) => {
    const success = await SupabaseService.updateChroniclePrivacy(chronicleId, isPrivate);
    if (success) {
      loadChronicles();
      loadFriendsChronicles();
    }
  };

  const handleDeleteChronicle = async (chronicleId: string) => {
    if (confirm('Are you sure you want to delete this chronicle? This action cannot be undone.')) {
      const success = await SupabaseService.deleteChronicle(chronicleId);
      if (success) {
        loadChronicles();
      }
    }
  };

  const sortedChronicles = [...chronicles].sort(
    (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  const months = Array.from(
    new Set(
      chronicles.map(c => {
        const date = new Date(c.date_created);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).map(monthKey => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      key: monthKey,
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    };
  });

  const filteredChronicles = selectedMonth === 'all'
    ? sortedChronicles
    : sortedChronicles.filter(c => {
        const date = new Date(c.date_created);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });

  const friendsCount = friendsChronicles.length;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ScrollText className="text-amber-600 mr-3 magical-glow" size={28} />
            <div>
              <h1 className="text-2xl font-cinzel font-bold text-amber-800 magical-glow">
                Chronicles of Eldoria
              </h1>
              <p className="text-amber-700 font-merriweather">
                Epic tales of your wellness journey, woven by the mystical realm
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              onClick={generateFantasyTale}
              disabled={isGenerating}
              icon={<PenTool size={16} />}
              className="magical-glow"
            >
              {isGenerating ? 'Weaving Tale...' : 'Generate Epic Tale'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveTab('my-chronicles')}
            className={`flex-1 py-2 px-4 rounded-md font-cinzel font-bold transition-all duration-200 flex items-center justify-center ${
              activeTab === 'my-chronicles'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <BookOpen size={16} className="mr-2" />
            My Chronicles
          </button>
          <button
            onClick={() => setActiveTab('friends-chronicles')}
            className={`flex-1 py-2 px-4 rounded-md font-cinzel font-bold transition-all duration-200 flex items-center justify-center ${
              activeTab === 'friends-chronicles'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Users size={16} className="mr-2" />
            Fellow Adventurers ({friendsCount})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'my-chronicles' ? (
        <div>
          {/* Month Filter */}
          {months.length > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <Calendar size={20} className="text-amber-600" />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedMonth === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedMonth('all')}
                >
                  All Time
                </Button>
                {months.map(month => (
                  <Button
                    key={month.key}
                    variant={selectedMonth === month.key ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedMonth(month.key)}
                  >
                    {month.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chronicles List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-amber-800 font-cinzel">Loading your chronicles...</p>
              </div>
            </div>
          ) : filteredChronicles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <ScrollText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                No Chronicles Yet
              </h3>
              <p className="text-gray-500 font-merriweather mb-4">
                Your epic wellness adventures await chronicling by the mystical realm!
              </p>
              <Button
                variant="primary"
                onClick={generateFantasyTale}
                disabled={isGenerating}
                icon={<PenTool size={16} />}
                className="magical-glow"
              >
                {isGenerating ? 'Weaving Tale...' : 'Create Your First Epic Tale'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredChronicles.map(chronicle => (
                <div key={chronicle.id} className="relative">
                  <ChronicleEntry chronicle={{
                    id: chronicle.id,
                    date: new Date(chronicle.date_created),
                    title: chronicle.title,
                    content: chronicle.content,
                    mood: chronicle.mood,
                    questsCompleted: [],
                    fellowInteractions: [],
                    imageUrl: chronicle.image_url,
                    weekNumber: chronicle.week_number,
                    isPrivate: chronicle.is_private,
                    xpGained: chronicle.xp_gained,
                    coinsEarned: chronicle.coins_earned
                  }} />
                  
                  {/* Chronicle Controls */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePrivacy(chronicle.id, !chronicle.is_private)}
                      className={`p-2 rounded-full transition-colors ${
                        chronicle.is_private 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={chronicle.is_private ? 'Make public' : 'Make private'}
                    >
                      {chronicle.is_private ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteChronicle(chronicle.id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete chronicle"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Week Info */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="font-cinzel">
                        {ChronicleService.formatTimeAgo(new Date(chronicle.date_created))}
                      </span>
                      {chronicle.week_number && (
                        <span className="font-cinzel">Week {chronicle.week_number}</span>
                      )}
                      {chronicle.mood && (
                        <div className="flex items-center">
                          <span className="mr-1">{ChronicleService.getMoodEmoji(chronicle.mood)}</span>
                          <span className="font-merriweather capitalize">{chronicle.mood}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {chronicle.xp_gained && chronicle.xp_gained > 0 && (
                        <Badge color="primary" size="sm">
                          +{chronicle.xp_gained} XP
                        </Badge>
                      )}
                      {chronicle.coins_earned && chronicle.coins_earned > 0 && (
                        <Badge color="warning" size="sm">
                          +{chronicle.coins_earned} Coins
                        </Badge>
                      )}
                      <Badge color={chronicle.is_private ? 'error' : 'success'} size="sm">
                        {chronicle.is_private ? <Lock size={12} className="mr-1" /> : <Unlock size={12} className="mr-1" />}
                        {chronicle.is_private ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Friends Chronicles */
        <div>
          {friendsCount === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                No Friend Chronicles Available
              </h3>
              <p className="text-gray-500 font-merriweather">
                Your friends haven't shared any public chronicles yet, or they're still writing their first adventures!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {friendsChronicles.map(chronicle => (
                <div key={chronicle.id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Friend Header */}
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <Avatar
                      src={chronicle.user_profiles?.avatar_url}
                      alt={chronicle.user_profiles?.username}
                      size="lg"
                      className="mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-cinzel font-bold text-amber-800">
                        {chronicle.user_profiles?.username}'s Chronicle
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge color="accent" size="sm">
                          Level {chronicle.user_profiles?.level}
                        </Badge>
                        <span className="text-sm text-gray-600 font-merriweather">
                          {ChronicleService.formatTimeAgo(new Date(chronicle.date_created))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chronicle Content */}
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-cinzel font-bold text-amber-800 text-lg mb-2">
                      {chronicle.title}
                    </h4>
                    
                    <div className="prose prose-amber max-w-none">
                      <p className="font-merriweather text-gray-700 leading-relaxed">
                        {chronicle.content}
                      </p>
                    </div>

                    {chronicle.image_url && (
                      <div className="mt-3">
                        <img 
                          src={chronicle.image_url} 
                          alt={chronicle.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        {chronicle.xp_gained && chronicle.xp_gained > 0 && (
                          <Badge color="primary" size="sm">
                            +{chronicle.xp_gained} XP
                          </Badge>
                        )}
                        {chronicle.coins_earned && chronicle.coins_earned > 0 && (
                          <Badge color="warning" size="sm">
                            +{chronicle.coins_earned} Coins
                          </Badge>
                        )}
                        {chronicle.mood && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-1">{ChronicleService.getMoodEmoji(chronicle.mood)}</span>
                            <span className="font-merriweather capitalize">{chronicle.mood}</span>
                          </div>
                        )}
                      </div>
                      
                      {chronicle.week_number && (
                        <span className="text-xs text-gray-500 font-cinzel">
                          Week {chronicle.week_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Fantasy Tale Generator based on user achievements
async function generateUserFantasyTale(user: User): Promise<{
  title: string;
  content: string;
  mood: string;
  xpGained: number;
  coinsEarned: number;
  imageUrl: string;
}> {
  // Analyze user's achievements
  const level = user.level;
  const questsCompleted = user.questsCompleted;
  const coinsEarned = user.mythicCoins;
  const walkingDistance = Math.floor(user.totalWalkingDistance / 1000); // km
  
  // Generate title based on achievements
  const titles = [
    `The Legend of ${user.name}: Chapter ${level}`,
    `${user.name} and the ${questsCompleted > 50 ? 'Hundred' : questsCompleted > 20 ? 'Many' : 'First'} Quests`,
    `The Chronicles of ${user.name}: The ${getAchievementTitle(level, questsCompleted)}`,
    `${user.name}'s Journey Through the Mystical Realm`,
    `The Wellness Warrior: ${user.name}'s Epic Tale`
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  // Generate epic fantasy content
  const content = generateEpicContent(user, level, questsCompleted, coinsEarned, walkingDistance);
  
  // Determine mood based on achievements
  const mood = determineMood(level, questsCompleted);
  
  // Select thematic image
  const imageUrl = selectFantasyImage(level, questsCompleted);
  
  return {
    title,
    content,
    mood,
    xpGained: Math.floor(level * 10 + questsCompleted * 5),
    coinsEarned: Math.floor(level * 25 + questsCompleted * 10),
    imageUrl
  };
}

function generateEpicContent(user: User, level: number, quests: number, coins: number, walkingKm: number): string {
  const openings = [
    `In the mystical realm of Eldoria, where wellness and magic intertwine, there lived a legendary adventurer known as ${user.name}.`,
    `Long ago, in the enchanted lands where health and harmony reign supreme, ${user.name} began an extraordinary journey.`,
    `Within the sacred boundaries of Eldoria, where every step strengthens both body and spirit, ${user.name} carved their legend.`,
    `In times when the realm needed heroes most, ${user.name} answered the call to wellness and adventure.`
  ];
  
  const achievements = [
    `Through ${quests} completed quests, they proved their unwavering dedication to the path of wellness.`,
    `Having reached the prestigious Level ${level}, ${user.name} commanded respect from all corners of the realm.`,
    `With ${coins} Mythic Coins in their treasury, they became known as one of the realm's most prosperous adventurers.`,
    walkingKm > 0 ? `Their feet had carried them across ${walkingKm} kilometers of mystical paths, each step a testament to their endurance.` : `Their journey had just begun, but already the realm whispered of their potential.`
  ];
  
  const challenges = [
    `But the path was not without its trials. Dark forces of laziness and doubt constantly threatened to derail their progress.`,
    `Ancient curses of procrastination and self-doubt plagued the land, testing even the strongest of wills.`,
    `The Shadow of Comfort Zone loomed large, tempting adventurers to abandon their noble quests.`,
    `Mystical barriers of habit and routine stood between ${user.name} and their ultimate destiny.`
  ];
  
  const victories = [
    `Yet ${user.name} persevered, wielding the twin blades of Determination and Consistency against all odds.`,
    `With each quest completed, their inner light grew brighter, illuminating the path for other adventurers.`,
    `The ancient spirits of wellness blessed their journey, granting them strength beyond measure.`,
    `Through meditation, movement, and mindful living, they unlocked powers that few could comprehend.`
  ];
  
  const futures = [
    `And so the legend continues, with each new day bringing fresh opportunities for growth and adventure.`,
    `The realm watches with anticipation as ${user.name} writes the next chapter of their epic tale.`,
    `Their story serves as inspiration to all who seek the path of wellness and self-improvement.`,
    `In the annals of Eldoria, ${user.name}'s name shall be remembered as a true champion of wellness.`
  ];
  
  const opening = openings[Math.floor(Math.random() * openings.length)];
  const achievement = achievements[Math.floor(Math.random() * achievements.length)];
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  const victory = victories[Math.floor(Math.random() * victories.length)];
  const future = futures[Math.floor(Math.random() * futures.length)];
  
  return `${opening}\n\n${achievement} ${challenge}\n\n${victory}\n\n${future}\n\nThe mystical energies of Eldoria continue to flow through ${user.name}, empowering them for the adventures that lie ahead. Their wellness journey has become the stuff of legends, inspiring countless others to embark upon their own paths of transformation and growth.`;
}

function getAchievementTitle(level: number, quests: number): string {
  if (level >= 20) return 'Grandmaster of Wellness';
  if (level >= 15) return 'Master of Balance';
  if (level >= 10) return 'Champion of Health';
  if (level >= 5) return 'Guardian of Vitality';
  if (quests >= 50) return 'Quest Conqueror';
  if (quests >= 20) return 'Dedicated Seeker';
  if (quests >= 10) return 'Rising Hero';
  return 'Brave Beginner';
}

function determineMood(level: number, quests: number): string {
  if (level >= 15 || quests >= 40) return 'triumphant';
  if (level >= 10 || quests >= 20) return 'accomplished';
  if (level >= 5 || quests >= 10) return 'determined';
  return 'hopeful';
}

function selectFantasyImage(level: number, quests: number): string {
  const images = [
    'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=800', // Mountain peak
    'https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg?auto=compress&cs=tinysrgb&w=800', // Magical forest
    'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800', // Meditation scene
    'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=800', // Peaceful nature
    'https://images.pexels.com/photos/6945775/pexels-photo-6945775.jpeg?auto=compress&cs=tinysrgb&w=800', // Wellness journey
    'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800'  // Strength training
  ];
  
  // Select image based on achievement level
  if (level >= 15) return images[0]; // Mountain peak for high achievers
  if (level >= 10) return images[1]; // Magical forest for intermediate
  if (quests >= 20) return images[2]; // Meditation for quest masters
  if (quests >= 10) return images[3]; // Nature for active users
  return images[Math.floor(Math.random() * images.length)];
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
}

export default ChroniclesPage;