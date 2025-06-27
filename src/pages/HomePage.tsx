import React, { useState, useEffect } from 'react';
import AvatarDisplay from '../components/avatarSystem/AvatarDisplay';
import XPProgress from '../components/progressSystem/XPProgress';
import QuestCard from '../components/questSystem/QuestCard';
import { User, Avatar, Quest } from '../types';
import Button from '../components/ui/Button';
import { Sparkles, ArrowRight, MapPin, Coins, TrendingUp } from 'lucide-react';
import ElevenLabsVoice from '../components/integrations/ElevenLabsVoice';
import { CoinSystem } from '../utils/coinSystem';
import { VoiceMessageService } from '../utils/voiceMessageService';

interface HomePageProps {
  user: User;
  avatar: Avatar;
  quests: Quest[];
  onCompleteQuest: (questId: string, distanceWalked?: number) => void;
  onUpdateProgress?: (questId: string, progress: number) => void;
  onViewAllQuests: () => void;
  showCoinAnimation?: boolean;
  onCoinAnimationComplete?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  user,
  avatar,
  quests,
  onCompleteQuest,
  onUpdateProgress,
  onViewAllQuests,
  showCoinAnimation = false,
  onCoinAnimationComplete
}) => {
  const [avatarMessage, setAvatarMessage] = useState<string>('');
  const [voiceText, setVoiceText] = useState<string>('');
  const [lastCoinCount, setLastCoinCount] = useState<number>(user.mythicCoins);
  const [lastLevel, setLastLevel] = useState<number>(user.level);
  const [lastQuestCount, setLastQuestCount] = useState<number>(user.questsCompleted);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);
  
  // Get active quests
  const activeQuests = quests.filter(quest => !quest.completed).slice(0, 3);

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Calculate coin statistics
  const totalPossibleCoins = quests.length * 20; // Assuming 20 coins per quest
  const earnedCoins = user.mythicCoins;
  const coinProgress = totalPossibleCoins > 0 ? (earnedCoins / totalPossibleCoins) * 100 : 0;
  
  // Welcome message on mount based on quest count
  useEffect(() => {
    if (!hasInitialized) {
      const activeQuestCount = activeQuests.length;
      const welcomeMessage = VoiceMessageService.getWelcomeMessage(user, activeQuestCount);
      
      setAvatarMessage(welcomeMessage);
      
      // Queue welcome message with highest priority
      VoiceMessageService.queueMessage(welcomeMessage, VoiceMessageService.PRIORITY.WELCOME);
      
      setHasInitialized(true);
    }
  }, [user.name, activeQuests.length, hasInitialized]);

  // Check for quest completions FIRST (priority 2)
  useEffect(() => {
    if (hasInitialized && user.questsCompleted > lastQuestCount) {
      // Find the most recently completed quest
      const completedQuest = quests.find(q => q.completed);
      if (completedQuest) {
        const questMessage = VoiceMessageService.getQuestCompletionMessage(
          user, 
          completedQuest.title, 
          completedQuest.type, 
          CoinSystem.calculateQuestReward(completedQuest.type, completedQuest.difficulty)
        );
        VoiceMessageService.queueMessage(questMessage, VoiceMessageService.PRIORITY.QUEST_COMPLETION);
      }
      setLastQuestCount(user.questsCompleted);
    }
  }, [user.questsCompleted, lastQuestCount, hasInitialized, quests, user]);

  // Check for level ups SECOND (priority 3)
  useEffect(() => {
    if (hasInitialized && user.level > lastLevel) {
      const levelUpMessage = VoiceMessageService.getLevelUpMessage(user, user.level, 100);
      VoiceMessageService.queueMessage(levelUpMessage, VoiceMessageService.PRIORITY.LEVEL_UP);
      setLastLevel(user.level);
    }
  }, [user.level, lastLevel, hasInitialized, user]);

  // Check for coin milestones LAST (priority 5)
  useEffect(() => {
    if (hasInitialized && user.mythicCoins > lastCoinCount) {
      const coinMilestone = VoiceMessageService.getCoinMilestoneMessage(user, user.mythicCoins);
      if (coinMilestone) {
        VoiceMessageService.queueMessage(coinMilestone, VoiceMessageService.PRIORITY.COIN_MILESTONE);
      }
      
      // Check walking achievements
      const walkingAchievement = VoiceMessageService.getWalkingAchievementMessage(user, user.totalWalkingDistance);
      if (walkingAchievement) {
        VoiceMessageService.queueMessage(walkingAchievement, VoiceMessageService.PRIORITY.COIN_MILESTONE);
      }
      
      setLastCoinCount(user.mythicCoins);
    }
  }, [user.mythicCoins, lastCoinCount, hasInitialized, user]);

  // Voice message queue processor - strict sequential processing
  useEffect(() => {
    const processVoiceQueue = () => {
      // Only process if not currently playing and not already processing
      if (!VoiceMessageService.getIsPlaying() && !isProcessingQueue && VoiceMessageService.hasQueuedMessages()) {
        const nextMessage = VoiceMessageService.getNextMessage();
        if (nextMessage) {
          console.log('Processing next voice message from queue');
          setIsProcessingQueue(true);
          setVoiceText(nextMessage);
          VoiceMessageService.setPlaying(true);
        }
      }
    };

    const interval = setInterval(processVoiceQueue, 1000); // Check every second
    return () => clearInterval(interval);
  }, [isProcessingQueue]);

  const handleVoiceComplete = () => {
    console.log('Voice playback completed, waiting before next message');
    VoiceMessageService.setPlaying(false);
    setVoiceText('');
    setIsProcessingQueue(false);
    
    // Wait 1 second before allowing next message to process
    setTimeout(() => {
      console.log('Ready for next voice message');
    }, 1000);
  };

  const handleVoiceError = () => {
    console.log('Voice playback error, continuing to next message');
    VoiceMessageService.setPlaying(false);
    setVoiceText('');
    setIsProcessingQueue(false);
  };

  const handleRateLimitExceeded = () => {
    console.log('ElevenLabs rate limit exceeded, implementing cooldown');
    VoiceMessageService.handleRateLimitError();
    setVoiceText('');
    setIsProcessingQueue(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar and Progress */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-purple-50 to-white rounded-2xl p-6 shadow-md mb-6">
            <AvatarDisplay 
              avatar={avatar} 
              message={avatarMessage}
            />
          </div>
          
          <XPProgress 
            level={user.level} 
            currentXP={user.xp} 
            xpToNextLevel={user.xpToNextLevel}
            mythicCoins={user.mythicCoins}
            showCoinAnimation={showCoinAnimation}
            onCoinAnimationComplete={onCoinAnimationComplete}
          />
          
          {/* Coin Treasury Stats */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-md p-5 mb-6 border-2 border-amber-200 magical-glow">
            <div className="flex items-center mb-3">
              <Coins className="text-amber-600 mr-2 magical-glow" size={20} />
              <h3 className="font-cinzel font-bold text-amber-800">Coin Treasury</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-cinzel text-sm">Current Balance</span>
                <span className="font-cinzel font-bold text-amber-800 text-lg">
                  {CoinSystem.formatCoins(user.mythicCoins)} Coins
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-cinzel text-sm">Quest Rewards</span>
                <span className="font-cinzel text-amber-600 text-sm">+20 per quest</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-cinzel text-sm">Level Up Bonus</span>
                <span className="font-cinzel text-amber-600 text-sm">+100 coins</span>
              </div>

              <div className="pt-2 border-t border-amber-200">
                <div className="flex items-center justify-between text-xs text-amber-600 mb-1">
                  <span className="font-cinzel">Collection Progress</span>
                  <span className="font-cinzel">{Math.round(coinProgress)}%</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-500 magical-glow"
                    style={{ width: `${Math.min(coinProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <div className="flex items-center mb-3">
              <Sparkles className="text-amber-500 mr-2" size={18} />
              <h3 className="font-bold text-gray-800">Your Journey</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Level</span>
                <span className="font-medium">{user.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quests Completed</span>
                <span className="font-medium">{user.questsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Active</span>
                <span className="font-medium">
                  {Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coin Rank</span>
                <span className="font-medium capitalize text-amber-600">
                  {CoinSystem.getCoinRarity(user.mythicCoins)}
                </span>
              </div>
            </div>
          </div>

          {/* Walking Stats */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-3">
              <MapPin className="text-blue-500 mr-2" size={18} />
              <h3 className="font-bold text-gray-800">Walking Progress</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-medium">{formatDistance(user.dailyWalkingDistance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Distance</span>
                <span className="font-medium">{formatDistance(user.totalWalkingDistance)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Quests */}
        <div className="lg:col-span-2">
          {/* Active Quests Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-purple-900 mr-3">Active Quests</h2>
                <div className="flex items-center bg-amber-100 px-2 py-1 rounded-full border border-amber-300">
                  <Coins size={14} className="text-amber-600 mr-1" />
                  <span className="text-xs font-cinzel text-amber-700">+20 coins each</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                icon={<ArrowRight size={16} />}
                onClick={onViewAllQuests}
              >
                View All
              </Button>
            </div>
            
            {activeQuests.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                <p>You've completed all your quests! Check back later for more adventures.</p>
                <div className="mt-2 flex items-center justify-center text-amber-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span className="text-sm font-cinzel">Your coin treasury grows with each quest!</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {activeQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={onCompleteQuest}
                    onStart={() => {}}
                    onUpdateProgress={onUpdateProgress}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bolt.new Badge - Fixed position in bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform duration-200 hover:scale-105 hover:shadow-lg"
        >
          <img
            src="/white_circle_360x360.png"
            alt="Built with Bolt.new"
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          />
        </a>
      </div>
      
      {/* Voice integration - only render when there's text to speak */}
      {voiceText && (
        <ElevenLabsVoice 
          text={voiceText} 
          voiceId="MezYwaNLTOfydzsFJwwt"
          onComplete={handleVoiceComplete}
          onError={handleVoiceError}
          onRateLimitExceeded={handleRateLimitExceeded}
        />
      )}
    </div>
  );
};

export default HomePage;