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

  const handleGenerateWeeklyChronicle = async () => {
    setIsGenerating(true);
    try {
      // Use the local chronicle service for generation, then save to Supabase
      await ChronicleService.generateWeeklyChronicle(user.id);
      loadChronicles();
    } catch (error) {
      console.error('Failed to generate chronicle:', error);
      alert('Failed to generate weekly chronicle. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMissingChronicles = async () => {
    setIsGenerating(true);
    try {
      await ChronicleService.generateMissingChronicles(user.id, 4);
      loadChronicles();
    } catch (error) {
      console.error('Failed to generate missing chronicles:', error);
      alert('Failed to generate missing chronicles. Please try again.');
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
                Weekly tales of your wellness journey, narrated by Eldrin the Mage
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleGenerateMissingChronicles}
              disabled={isGenerating}
              icon={<RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />}
              className="magical-glow"
            >
              Generate Missing
            </Button>
            
            <Button
              variant="primary"
              onClick={handleGenerateWeeklyChronicle}
              disabled={isGenerating}
              icon={<PenTool size={16} />}
              className="magical-glow"
            >
              {isGenerating ? 'Generating...' : 'Generate This Week'}
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
                Your weekly wellness adventures await chronicling by Eldrin the Mage!
              </p>
              <Button
                variant="primary"
                onClick={handleGenerateWeeklyChronicle}
                disabled={isGenerating}
                icon={<PenTool size={16} />}
                className="magical-glow"
              >
                {isGenerating ? 'Generating...' : 'Create Your First Chronicle'}
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

export default ChroniclesPage;