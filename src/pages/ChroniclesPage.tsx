import React, { useState, useEffect } from 'react';
import { Chronicle, User } from '../types';
import { ChronicleService } from '../utils/chronicleService';
import { SocialService } from '../utils/socialService';
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
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [friendsChronicles, setFriendsChronicles] = useState<{ user: User; chronicles: Chronicle[] }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChronicles();
    loadFriendsChronicles();
  }, [user.id]);

  const loadChronicles = () => {
    setIsLoading(true);
    try {
      const userChronicles = ChronicleService.getUserChronicles(user.id);
      setChronicles(userChronicles);
    } catch (error) {
      console.error('Failed to load chronicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendsChronicles = () => {
    try {
      const friendsData = ChronicleService.getFriendsChronicles(user.id);
      setFriendsChronicles(friendsData);
    } catch (error) {
      console.error('Failed to load friends chronicles:', error);
    }
  };

  const handleGenerateWeeklyChronicle = async () => {
    setIsGenerating(true);
    try {
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

  const handleTogglePrivacy = (chronicleId: string, isPrivate: boolean) => {
    const success = ChronicleService.updateChroniclePrivacy(user.id, chronicleId, isPrivate);
    if (success) {
      loadChronicles();
      loadFriendsChronicles();
    }
  };

  const handleDeleteChronicle = (chronicleId: string) => {
    if (confirm('Are you sure you want to delete this chronicle? This action cannot be undone.')) {
      const success = ChronicleService.deleteChronicle(user.id, chronicleId);
      if (success) {
        loadChronicles();
      }
    }
  };

  const sortedChronicles = [...chronicles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const months = Array.from(
    new Set(
      chronicles.map(c => {
        const date = new Date(c.date);
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
        const date = new Date(c.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });

  const friendsCount = SocialService.getFriends(user.id).length;

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
                  <ChronicleEntry chronicle={chronicle} />
                  
                  {/* Chronicle Controls */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePrivacy(chronicle.id, !chronicle.isPrivate)}
                      className={`p-2 rounded-full transition-colors ${
                        chronicle.isPrivate 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={chronicle.isPrivate ? 'Make public' : 'Make private'}
                    >
                      {chronicle.isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        {ChronicleService.formatTimeAgo(chronicle.date)}
                      </span>
                      {chronicle.weekNumber && (
                        <span className="font-cinzel">Week {chronicle.weekNumber}</span>
                      )}
                      {chronicle.mood && (
                        <div className="flex items-center">
                          <span className="mr-1">{ChronicleService.getMoodEmoji(chronicle.mood)}</span>
                          <span className="font-merriweather capitalize">{chronicle.mood}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {chronicle.xpGained && chronicle.xpGained > 0 && (
                        <Badge color="primary" size="sm">
                          +{chronicle.xpGained} XP
                        </Badge>
                      )}
                      {chronicle.coinsEarned && chronicle.coinsEarned > 0 && (
                        <Badge color="warning" size="sm">
                          +{chronicle.coinsEarned} Coins
                        </Badge>
                      )}
                      <Badge color={chronicle.isPrivate ? 'error' : 'success'} size="sm">
                        {chronicle.isPrivate ? <Lock size={12} className="mr-1" /> : <Unlock size={12} className="mr-1" />}
                        {chronicle.isPrivate ? 'Private' : 'Public'}
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
                No Friends Yet
              </h3>
              <p className="text-gray-500 font-merriweather">
                Add friends to read their wellness chronicles and share in their adventures!
              </p>
            </div>
          ) : friendsChronicles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <ScrollText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                No Friend Chronicles Available
              </h3>
              <p className="text-gray-500 font-merriweather">
                Your friends haven't shared any public chronicles yet, or they're still writing their first adventures!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {friendsChronicles.map(({ user: friend, chronicles: friendChronicles }) => (
                <div key={friend.id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Friend Header */}
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <Avatar
                      src={friend.avatarUrl}
                      alt={friend.name}
                      size="lg"
                      className="mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-cinzel font-bold text-amber-800">
                        {friend.name}'s Chronicles
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge color="accent" size="sm">
                          Level {friend.level}
                        </Badge>
                        <span className="text-sm text-gray-600 font-merriweather">
                          {friend.questsCompleted} quests completed
                        </span>
                        <span className="text-sm text-gray-600 font-merriweather">
                          {friend.mythicCoins} coins
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge color="primary" size="sm">
                        {friendChronicles.length} Public Chronicles
                      </Badge>
                    </div>
                  </div>

                  {/* Friend's Chronicles */}
                  <div className="space-y-4">
                    {friendChronicles.map(chronicle => (
                      <div key={chronicle.id} className="border-l-4 border-amber-300 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-cinzel font-bold text-amber-800 text-lg">
                            {chronicle.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {chronicle.mood && (
                              <span>{ChronicleService.getMoodEmoji(chronicle.mood)}</span>
                            )}
                            <span className="font-merriweather">
                              {ChronicleService.formatTimeAgo(chronicle.date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="prose prose-amber max-w-none">
                          <p className="font-merriweather text-gray-700 leading-relaxed">
                            {chronicle.content}
                          </p>
                        </div>

                        {chronicle.imageUrl && (
                          <div className="mt-3">
                            <img 
                              src={chronicle.imageUrl} 
                              alt={chronicle.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            {chronicle.xpGained && chronicle.xpGained > 0 && (
                              <Badge color="primary" size="sm">
                                +{chronicle.xpGained} XP
                              </Badge>
                            )}
                            {chronicle.coinsEarned && chronicle.coinsEarned > 0 && (
                              <Badge color="warning" size="sm">
                                +{chronicle.coinsEarned} Coins
                              </Badge>
                            )}
                          </div>
                          
                          {chronicle.weekNumber && (
                            <span className="text-xs text-gray-500 font-cinzel">
                              Week {chronicle.weekNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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