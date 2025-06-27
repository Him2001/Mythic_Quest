import React, { useState, useEffect } from 'react';
import { SupabaseAuthService } from './utils/supabaseAuthService';
import { SupabaseService } from './utils/supabaseService';
import { User } from './types';

// Auth Components
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Main App Components
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import QuestsPage from './pages/QuestsPage';
import HeroesPage from './pages/HeroesPage';
import AdventureMapPage from './pages/AdventureMapPage';
import MarketplacePage from './pages/MarketplacePage';
import ChroniclesPage from './pages/ChroniclesPage';
import { mockUser, mockAvatars, mockQuests, mockSocialPosts } from './data/mockData';
import { SocialService } from './utils/socialService';
import TavusVideoAvatar from './components/integrations/TavusVideoAvatar';
import CoinAnimation from './components/ui/CoinAnimation';
import LevelUpPopup from './components/ui/LevelUpPopup';
import { CoinSystem } from './utils/coinSystem';
import { AchievementService } from './utils/achievementService';
import { CoinTransaction, InventoryItem } from './types';

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');

  // App state
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [avatar] = useState(mockAvatars[0]);
  const [quests, setQuests] = useState(mockQuests);
  const [chronicles, setChronicles] = useState<any[]>([]);
  const [tavusText, setTavusText] = useState('');
  
  // Coin system state
  const [coinAnimationTrigger, setCoinAnimationTrigger] = useState(false);
  const [lastCoinReward, setLastCoinReward] = useState(0);
  const [coinAnimationType, setCoinAnimationType] = useState<'quest' | 'level_up' | 'bonus'>('quest');
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  // Level up popup state
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);

  // Level up sharing state
  const [pendingLevelUpShare, setPendingLevelUpShare] = useState<{
    newLevel: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);

  // Check authentication on app load with better error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthError('');
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Supabase not configured, using mock authentication');
          // Use mock user for demo
          setUser(mockUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        const { user, error } = await SupabaseAuthService.getCurrentSession();
        
        if (error) {
          console.warn('Auth error:', error);
          setAuthError(error);
        }
        
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthError('Failed to initialize authentication');
        // Fallback to mock user for demo
        setUser(mockUser);
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout reached, using fallback');
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    checkAuth();

    // Listen for auth state changes only if Supabase is configured
    let subscription: any = null;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        subscription = SupabaseAuthService.onAuthStateChange((user) => {
          setUser(user);
          setIsAuthenticated(!!user);
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.warn('Could not set up auth listener:', error);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Initialize social posts on first load
  useEffect(() => {
    if (isAuthenticated) {
      const storedData = SocialService.getStoredData();
      if (storedData.posts.length === 0) {
        const updatedData = { ...storedData, posts: mockSocialPosts };
        SocialService.saveStoredData(updatedData);
      }
    }
  }, [isAuthenticated]);

  const handleSignIn = async (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleSignOut = async () => {
    try {
      // Only call Supabase signOut if it's configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        await SupabaseAuthService.signOut();
      }
      
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab('home');
      setAuthError('');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force sign out even if there's an error
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab('home');
    }
  };

  const updateDailyWalkingDistance = async (additionalDistance: number) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.lastWalkingDate !== today;
    const newDailyDistance = isNewDay ? additionalDistance : user.dailyWalkingDistance + additionalDistance;
    const newTotalDistance = user.totalWalkingDistance + additionalDistance;
    
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        dailyWalkingDistance: newDailyDistance,
        totalWalkingDistance: newTotalDistance,
        lastWalkingDate: today
      };
    });

    // Update in Supabase only if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        await SupabaseAuthService.updateWalkingDistance(
          user.id,
          newDailyDistance,
          newTotalDistance,
          today
        );
      }
    } catch (error) {
      console.warn('Could not update walking distance in database:', error);
    }
  };

  const awardCoins = async (amount: number, type: CoinTransaction['type'], description: string, animationType: 'quest' | 'level_up' | 'bonus' = 'quest') => {
    if (!user) return;
    
    const newCoinBalance = user.mythicCoins + amount;
    
    // Update user's coin balance
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        mythicCoins: newCoinBalance
      };
    });

    // Update in Supabase only if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        await SupabaseAuthService.updateUserCoins(user.id, newCoinBalance);
      }
    } catch (error) {
      console.warn('Could not update coins in database:', error);
    }

    // Create transaction record
    const transaction = CoinSystem.createTransaction(amount, type, description);
    setCoinTransactions(prev => [transaction, ...prev]);

    // Trigger coin animation
    setLastCoinReward(amount);
    setCoinAnimationType(animationType);
    setCoinAnimationTrigger(true);
    setShowCoinAnimation(true);

    // Reset animation trigger after a short delay
    setTimeout(() => {
      setCoinAnimationTrigger(false);
    }, 100);
  };

  const spendCoins = async (amount: number, description: string) => {
    if (!user) return;
    
    const newCoinBalance = user.mythicCoins - amount;
    
    // Update user's coin balance
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        mythicCoins: newCoinBalance
      };
    });

    // Update in Supabase only if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        await SupabaseAuthService.updateUserCoins(user.id, newCoinBalance);
      }
    } catch (error) {
      console.warn('Could not update coins in database:', error);
    }

    // Create transaction record
    const transaction = CoinSystem.createTransaction(-amount, 'purchase', description);
    setCoinTransactions(prev => [transaction, ...prev]);
  };

  const addToInventory = (item: InventoryItem) => {
    if (!user) return;
    
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        inventory: [...prevUser.inventory, item]
      };
    });
  };

  const handleCompleteQuest = async (questId: string, distanceWalked?: number) => {
    if (!user) return;
    
    setQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId ? { ...quest, completed: true, isTracking: false } : quest
      )
    );
    
    const completedQuest = quests.find(q => q.id === questId);
    if (completedQuest && !completedQuest.completed) {
      // Update walking distance if it's a walking quest
      if (completedQuest.type === 'walking' && distanceWalked) {
        await updateDailyWalkingDistance(distanceWalked);
      }

      const oldLevel = user.level;
      const newXP = user.xp + completedQuest.xpReward;
      let newLevel = user.level;
      let newXpToNextLevel = user.xpToNextLevel;
      let leveledUp = false;
      
      if (newXP >= user.xpToNextLevel) {
        newLevel += 1;
        newXpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
        leveledUp = true;
        setTavusText(`Congratulations! You've reached level ${newLevel} in your journey. The realms of Eldoria grow stronger with your dedication.`);
      }
      
      const newQuestsCompleted = user.questsCompleted + 1;
      
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          xp: newXP,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
          questsCompleted: newQuestsCompleted
        };
      });

      // Update in Supabase only if configured
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          await SupabaseAuthService.updateUserProgress(user.id, newXP, newLevel, user.mythicCoins);
          await SupabaseAuthService.updateQuestsCompleted(user.id, newQuestsCompleted);
          
          // Record quest completion in Supabase
          const questCoinReward = completedQuest.coinReward || CoinSystem.calculateQuestReward(completedQuest.type, completedQuest.difficulty);
          await SupabaseAuthService.recordQuestCompletion(
            user.id,
            completedQuest.title,
            completedQuest.type,
            completedQuest.xpReward,
            questCoinReward
          );
        }
      } catch (error) {
        console.warn('Could not update progress in database:', error);
      }

      // Award coins for quest completion
      const questCoinReward = completedQuest.coinReward || CoinSystem.calculateQuestReward(completedQuest.type, completedQuest.difficulty);
      await awardCoins(
        questCoinReward,
        'quest_completion',
        `Completed quest: ${completedQuest.title}`,
        'quest'
      );

      // Show level up popup if leveled up
      if (leveledUp) {
        const levelUpRewards = AchievementService.calculateLevelUpRewards(newLevel);
        setLevelUpData({
          newLevel,
          xpEarned: completedQuest.xpReward,
          coinsEarned: levelUpRewards.coinsEarned
        });
        setShowLevelUpPopup(true);

        // Award level up bonus coins
        setTimeout(async () => {
          await awardCoins(
            levelUpRewards.coinsEarned,
            'level_up',
            `Reached level ${newLevel}!`,
            'level_up'
          );
        }, 2000);
      }
    }
  };

  const handleLocationQuestComplete = async (questId: string, xpReward: number) => {
    if (!user) return;
    
    const oldLevel = user.level;
    const newXP = user.xp + xpReward;
    let newLevel = user.level;
    let newXpToNextLevel = user.xpToNextLevel;
    let leveledUp = false;
    
    if (newXP >= user.xpToNextLevel) {
      newLevel += 1;
      newXpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      leveledUp = true;
      setTavusText(`Congratulations! You've discovered a magical location and reached level ${newLevel}! Your wellness journey grows ever stronger.`);
    }
    
    const newQuestsCompleted = user.questsCompleted + 1;
    
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        questsCompleted: newQuestsCompleted
      };
    });

    // Update in Supabase only if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        await SupabaseAuthService.updateUserProgress(user.id, newXP, newLevel, user.mythicCoins);
        await SupabaseAuthService.updateQuestsCompleted(user.id, newQuestsCompleted);
        
        // Record location quest completion
        const locationCoinReward = CoinSystem.calculateQuestReward('location', 'medium');
        await SupabaseAuthService.recordQuestCompletion(
          user.id,
          'Location-based wellness quest',
          'location',
          xpReward,
          locationCoinReward
        );
      }
    } catch (error) {
      console.warn('Could not update progress in database:', error);
    }

    // Award coins for location quest completion
    const locationCoinReward = CoinSystem.calculateQuestReward('location', 'medium');
    await awardCoins(
      locationCoinReward,
      'quest_completion',
      'Completed location-based wellness quest',
      'quest'
    );

    // Show level up popup if leveled up
    if (leveledUp) {
      const levelUpRewards = AchievementService.calculateLevelUpRewards(newLevel);
      setLevelUpData({
        newLevel,
        xpEarned: xpReward,
        coinsEarned: levelUpRewards.coinsEarned
      });
      setShowLevelUpPopup(true);

      // Award level up bonus coins
      setTimeout(async () => {
        await awardCoins(
          levelUpRewards.coinsEarned,
          'level_up',
          `Reached level ${newLevel}!`,
          'level_up'
        );
      }, 2000);
    }
  };

  const handleStartQuest = (questId: string) => {
    setQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId ? { ...quest, isTracking: true } : quest
      )
    );
  };

  const handleUpdateQuestProgress = (questId: string, progress: number) => {
    setQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId ? { ...quest, progress } : quest
      )
    );
  };

  const handleChronicleAdd = async (chronicle: any) => {
    if (!user) return;
    
    // Save chronicle to Supabase only if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const savedChronicle = await SupabaseService.createChronicle(
          user.id,
          chronicle.title,
          chronicle.content,
          chronicle.mood,
          chronicle.weekNumber,
          chronicle.xpGained,
          chronicle.coinsEarned,
          chronicle.imageUrl,
          chronicle.isPrivate || false
        );
        
        if (savedChronicle) {
          setChronicles(prev => [savedChronicle, ...prev]);
        }
      } else {
        // Fallback for demo mode
        setChronicles(prev => [chronicle, ...prev]);
      }
    } catch (error) {
      console.warn('Could not save chronicle to database:', error);
      // Fallback for demo mode
      setChronicles(prev => [chronicle, ...prev]);
    }
  };

  const handleCoinAnimationComplete = () => {
    setShowCoinAnimation(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleShareLevelUpAchievement = () => {
    if (!user || !levelUpData) return;

    // Store the level up data for the Heroes page
    setPendingLevelUpShare({
      newLevel: levelUpData.newLevel,
      xpEarned: levelUpData.xpEarned,
      coinsEarned: levelUpData.coinsEarned
    });

    // Navigate to Heroes page
    setActiveTab('heroes');
  };

  // Loading state with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-100 font-cinzel text-xl mb-2">Loading Mythic Quest...</p>
          {authError && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-md mx-auto">
              <p className="text-red-200 text-sm">{authError}</p>
              <p className="text-red-300 text-xs mt-2">Falling back to demo mode...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authentication flow
  if (!isAuthenticated) {
    switch (authView) {
      case 'signup':
        return (
          <SignUpForm
            onSignUp={handleSignIn}
            onSwitchToSignIn={() => setAuthView('signin')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            onBackToSignIn={() => setAuthView('signin')}
          />
        );
      default:
        return (
          <SignInForm
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setAuthView('signup')}
            onForgotPassword={() => setAuthView('forgot')}
          />
        );
    }
  }

  // Admin dashboard for admin users
  if (user?.isAdmin) {
    return (
      <AdminDashboard
        currentUser={user}
        onSignOut={handleSignOut}
      />
    );
  }

  // Main app for regular users
  const renderPage = () => {
    switch (activeTab) {
      case 'quests':
        return (
          <QuestsPage 
            quests={quests} 
            onCompleteQuest={handleCompleteQuest} 
            onStartQuest={handleStartQuest}
            onUpdateProgress={handleUpdateQuestProgress}
          />
        );
      case 'map':
        return (
          <AdventureMapPage
            onQuestComplete={handleLocationQuestComplete}
            onChronicleAdd={handleChronicleAdd}
          />
        );
      case 'heroes':
        return (
          <HeroesPage 
            user={user!}
            onUserUpdate={handleUserUpdate}
            pendingLevelUpShare={pendingLevelUpShare}
            onLevelUpShareProcessed={() => setPendingLevelUpShare(null)}
          />
        );
      case 'marketplace':
        return (
          <MarketplacePage
            userCoins={user?.mythicCoins || 0}
            onCoinSpent={spendCoins}
            onInventoryUpdate={addToInventory}
          />
        );
      case 'chronicles':
        return (
          <ChroniclesPage
            user={user!}
            onUserUpdate={handleUserUpdate}
          />
        );
      default:
        return (
          <HomePage 
            user={user!}
            avatar={avatar}
            quests={quests}
            onCompleteQuest={handleCompleteQuest}
            onUpdateProgress={handleUpdateQuestProgress}
            onViewAllQuests={() => setActiveTab('quests')}
            showCoinAnimation={showCoinAnimation}
            onCoinAnimationComplete={handleCoinAnimationComplete}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
      
      <Navbar 
        user={user!} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        quests={quests}
      />
      
      <main className="relative pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="relative backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-amber-100/20 overflow-hidden">
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative p-6">
              {renderPage()}
            </div>
          </div>
        </div>
      </main>
      
      {/* Magical particle effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="magical-particles" />
      </div>
      
      {/* Coin Animation */}
      <CoinAnimation
        amount={lastCoinReward}
        trigger={coinAnimationTrigger}
        onComplete={handleCoinAnimationComplete}
        position="top-right"
        type={coinAnimationType}
      />

      {/* Level Up Popup */}
      {showLevelUpPopup && levelUpData && user && (
        <LevelUpPopup
          isVisible={showLevelUpPopup}
          user={user}
          newLevel={levelUpData.newLevel}
          xpEarned={levelUpData.xpEarned}
          coinsEarned={levelUpData.coinsEarned}
          onClose={() => setShowLevelUpPopup(false)}
          onShareAchievement={handleShareLevelUpAchievement}
        />
      )}
      
      {/* Tavus video integration */}
      {tavusText && (
        <TavusVideoAvatar 
          text={tavusText} 
          templateId={avatar.videoTemplateId}
        />
      )}
    </div>
  );
}

export default App;