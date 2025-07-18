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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastCoinCount, setLastCoinCount] = useState<number>(user.mythicCoins);
  const [lastLevel, setLastLevel] = useState<number>(user.level);
  const [lastWalkingDistance, setLastWalkingDistance] = useState<number>(user.totalWalkingDistance);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [hasUserInteractedForAudio, setHasUserInteractedForAudio] = useState<boolean>(false);
  const [voiceKey, setVoiceKey] = useState<string>('');
  
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
  
  // Handle user interaction for audio
  const handleUserInteraction = () => {
    if (!hasUserInteractedForAudio) {
      setHasUserInteractedForAudio(true);
      console.log('🎵 AUDIO: User interaction detected, audio playback now enabled');
    }
  };

  // Welcome message on mount - ONLY ONCE PER SESSION AND AFTER USER INTERACTION
  useEffect(() => {
    if (!hasInitialized && hasUserInteractedForAudio) {
      const activeQuestCount = activeQuests.length;
      
      // Set screen message based on quest count
      let screenMessage = '';
      let voiceMessage = '';
      
      if (activeQuestCount === 0) {
        const noQuestMessages = [
          "Behold! You have achieved the legendary status of 'Quest Master' - all adventures completed! The realm celebrates your dedication.",
          "Magnificent! Your quest log stands empty, a testament to your unwavering commitment to wellness. What new challenges shall we discover?",
          "Extraordinary! You've conquered every quest in sight. The mystical realm awaits your next great adventure!"
        ];
        screenMessage = noQuestMessages[Math.floor(Math.random() * noQuestMessages.length)];
        voiceMessage = `Greetings, ${user.name}! You've achieved the legendary status of Quest Master! All adventures completed. The realm celebrates your dedication to wellness!`;
      } else if (activeQuestCount > 5) {
        const lazyMessages = [
          `Oh my! ${activeQuestCount} quests await your attention. Perhaps it's time to transform intention into action, brave adventurer?`,
          `I see ${activeQuestCount} quests have gathered in your log like eager students. Shall we begin the lessons of completion?`,
          `Your quest collection has grown to ${activeQuestCount} items! Time to turn this impressive library into legendary achievements.`
        ];
        screenMessage = lazyMessages[Math.floor(Math.random() * lazyMessages.length)];
        voiceMessage = `Welcome back, ${user.name}! I see you've been collecting quests like rare artifacts! ${activeQuestCount} pending adventures await your attention. Perhaps it's time to start adventuring?`;
      } else {
        const regularMessages = [
          `You have ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} awaiting your attention. Each completed quest brings both XP and precious Mythic Coins to your treasury.`,
          `${activeQuestCount} adventure${activeQuestCount > 1 ? 's' : ''} stand${activeQuestCount === 1 ? 's' : ''} ready for your heroic touch. Your wellness journey continues to unfold!`,
          `The realm presents ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} for your consideration. Each victory strengthens both body and spirit.`
        ];
        screenMessage = regularMessages[Math.floor(Math.random() * regularMessages.length)];
        voiceMessage = `Welcome back, ${user.name}! Ready to continue your wellness journey? You have ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} awaiting your heroic attention!`;
      }
      
      setAvatarMessage(screenMessage);
      
      // Set voice message with unique key to ensure it plays
      const uniqueKey = `welcome-${user.id}-${Date.now()}`;
      setVoiceKey(uniqueKey);
      setVoiceText(voiceMessage);
      
      setHasInitialized(true);
      
      console.log('🎵 VOICE PRIORITY: Setting welcome message for', user.name);
    }
  }, [user.name, activeQuests.length, hasInitialized, hasUserInteractedForAudio, user.id]);

  // Set initial screen message without voice (before user interaction)
  useEffect(() => {
    if (!hasInitialized && !hasUserInteractedForAudio) {
      const activeQuestCount = activeQuests.length;
      
      let screenMessage = '';
      
      if (activeQuestCount === 0) {
        const noQuestMessages = [
          "Behold! You have achieved the legendary status of 'Quest Master' - all adventures completed! The realm celebrates your dedication.",
          "Magnificent! Your quest log stands empty, a testament to your unwavering commitment to wellness. What new challenges shall we discover?",
          "Extraordinary! You've conquered every quest in sight. The mystical realm awaits your next great adventure!"
        ];
        screenMessage = noQuestMessages[Math.floor(Math.random() * noQuestMessages.length)];
      } else if (activeQuestCount > 5) {
        const lazyMessages = [
          `Oh my! ${activeQuestCount} quests await your attention. Perhaps it's time to transform intention into action, brave adventurer?`,
          `I see ${activeQuestCount} quests have gathered in your log like eager students. Shall we begin the lessons of completion?`,
          `Your quest collection has grown to ${activeQuestCount} items! Time to turn this impressive library into legendary achievements.`
        ];
        screenMessage = lazyMessages[Math.floor(Math.random() * lazyMessages.length)];
      } else {
        const regularMessages = [
          `You have ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} awaiting your attention. Each completed quest brings both XP and precious Mythic Coins to your treasury.`,
          `${activeQuestCount} adventure${activeQuestCount > 1 ? 's' : ''} stand${activeQuestCount === 1 ? 's' : ''} ready for your heroic touch. Your wellness journey continues to unfold!`,
          `The realm presents ${activeQuestCount} quest${activeQuestCount > 1 ? 's' : ''} for your consideration. Each victory strengthens both body and spirit.`
        ];
        screenMessage = regularMessages[Math.floor(Math.random() * regularMessages.length)];
      }
      
      setAvatarMessage(screenMessage);
    }
  }, [activeQuests.length, hasInitialized, hasUserInteractedForAudio]);

  // Check for level ups
  useEffect(() => {
    if (hasInitialized && hasUserInteractedForAudio && user.level > lastLevel) {
      const levelUpMessage = `Magnificent! ${user.name}, you have ascended to Level ${user.level}! The mystical energies of Eldoria surge through you, and your coin purse swells with 100 additional Mythic Coins!`;
      const uniqueKey = `levelup-${user.id}-${user.level}-${Date.now()}`;
      setVoiceKey(uniqueKey);
      setVoiceText(levelUpMessage);
      setLastLevel(user.level);
      
      console.log('🎵 VOICE PRIORITY: Level up message for level', user.level);
    }
  }, [user.level, lastLevel, hasInitialized, hasUserInteractedForAudio, user.name, user.id]);

  // Check for coin milestones (every 250 coins)
  useEffect(() => {
    if (hasInitialized && hasUserInteractedForAudio && user.mythicCoins > lastCoinCount) {
      const coinMilestone = VoiceMessageService.getCoinMilestoneMessage(user, user.mythicCoins, lastCoinCount);
      if (coinMilestone) {
        const uniqueKey = `coins-${user.id}-${user.mythicCoins}-${Date.now()}`;
        setVoiceKey(uniqueKey);
        setVoiceText(coinMilestone);
        
        console.log('🎵 VOICE PRIORITY: Coin milestone message for', user.mythicCoins, 'coins');
      }
      setLastCoinCount(user.mythicCoins);
    }
  }, [user.mythicCoins, lastCoinCount, hasInitialized, hasUserInteractedForAudio, user]);

  // Check for walking achievements (every 5km)
  useEffect(() => {
    if (hasInitialized && hasUserInteractedForAudio && user.totalWalkingDistance > lastWalkingDistance) {
      const walkingAchievement = VoiceMessageService.getWalkingAchievementMessage(user, user.totalWalkingDistance, lastWalkingDistance);
      if (walkingAchievement) {
        const uniqueKey = `walking-${user.id}-${user.totalWalkingDistance}-${Date.now()}`;
        setVoiceKey(uniqueKey);
        setVoiceText(walkingAchievement);
        
        console.log('🎵 VOICE PRIORITY: Walking achievement message for', Math.floor(user.totalWalkingDistance / 1000), 'km');
      }
      setLastWalkingDistance(user.totalWalkingDistance);
    }
  }, [user.totalWalkingDistance, lastWalkingDistance, hasInitialized, hasUserInteractedForAudio, user]);

  const handleVoiceComplete = () => {
    console.log('🎵 VOICE PRIORITY: Voice playback completed, clearing voice text');
    setVoiceText('');
    setIsSpeaking(false);
  };

  const handleVoiceError = (error: string) => {
    console.warn('🎵 VOICE PRIORITY: Voice playback error:', error);
    setVoiceText('');
    setIsSpeaking(false);
  };

  const handleSpeakingChange = (speaking: boolean) => {
    console.log('🎭 AVATAR ANIMATION: Speaking state changed:', speaking);
    setIsSpeaking(speaking);
  };

  // Handle quest completion with voice feedback
  const handleQuestComplete = (questId: string, distanceWalked?: number) => {
    const completedQuest = quests.find(q => q.id === questId);
    if (completedQuest && !completedQuest.completed && hasUserInteractedForAudio) {
      // Set quest completion message for voice
      const questMessage = `Excellent work! You've completed "${completedQuest.title}"! Your dedication earns you ${completedQuest.xpReward} XP and ${CoinSystem.calculateQuestReward(completedQuest.type, completedQuest.difficulty)} Mythic Coins!`;
      const uniqueKey = `quest-${questId}-${Date.now()}`;
      setVoiceKey(uniqueKey);
      setVoiceText(questMessage);
      
      console.log('🎵 VOICE PRIORITY: Quest completion message for', completedQuest.title);
    }
    
    // Call the original handler
    onCompleteQuest(questId, distanceWalked);
  };
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 relative" onClick={handleUserInteraction}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column - Avatar and Progress */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md">
            <AvatarDisplay 
              avatar={avatar} 
              message={avatarMessage}
              isSpeaking={isSpeaking}
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
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-md p-4 sm:p-5 border-2 border-amber-200 magical-glow">
            <div className="flex items-center mb-3">
              <Coins className="text-amber-600 mr-2 magical-glow" size={20} />
              <h3 className="font-cinzel font-bold text-amber-800">Coin Treasury</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-cinzel text-sm">Current Balance</span>
                <span className="font-cinzel font-bold text-amber-800 text-base sm:text-lg">
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
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
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
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
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
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <h2 className="text-lg sm:text-xl font-bold text-purple-900 mr-3">Active Quests</h2>
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
                className="self-start sm:self-auto"
              >
                View All
              </Button>
            </div>
            
            {activeQuests.length === 0 ? (
              <div className="bg-white rounded-lg p-4 sm:p-6 text-center text-gray-500">
                <p>You've completed all your quests! Check back later for more adventures.</p>
                <div className="mt-2 flex items-center justify-center text-amber-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span className="text-sm font-cinzel">Your coin treasury grows with each quest!</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {activeQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleQuestComplete}
                    onStart={() => {}}
                    onUpdateProgress={onUpdateProgress}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* VOICE INTEGRATION - HIGHEST PRIORITY */}
      {voiceText && hasUserInteractedForAudio && (
        <ElevenLabsVoice 
          key={voiceKey}
          text={voiceText} 
          voiceId="MezYwaNLTOfydzsFJwwt"
          onComplete={handleVoiceComplete}
          onError={handleVoiceError}
          onSpeakingChange={handleSpeakingChange}
        />
      )}
    </div>
  );
};

export default HomePage;