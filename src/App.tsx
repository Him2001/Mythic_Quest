import React, { useState, useEffect } from 'react';
import { SupabaseAuthService } from './utils/supabaseAuthService';
import { SupabaseService } from './utils/supabaseService';
import { AuthService } from './utils/authService';
import { SoundEffects } from './utils/soundEffects';
import { User } from './types';

// Auth Components
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Main App Components
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
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
  const [authView, setAuthView] = useState<'landing' | 'signin' | 'signup' | 'forgot'>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSupabase, setHasSupabase] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

  // Initialize sound effects on app load
  useEffect(() => {
    SoundEffects.initialize();

    // Play welcome sound sequence after a short delay
    setTimeout(() => {
      SoundEffects.playWelcomeSequence();
    }, 1000);
  }, []);

  // Check for admin session on app load
  const checkAdminSession = () => {
    try {
      const adminSession = localStorage.getItem('mythic_admin_session');
      if (adminSession) {
        const { user: adminUser, timestamp } = JSON.parse(adminSession);

        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge && adminUser.isAdmin) {
          setUser(adminUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        } else {
          // Clear expired session
          localStorage.removeItem('mythic_admin_session');
        }
      }
    } catch (error) {
      console.warn('Failed to check admin session:', error);
      localStorage.removeItem('mythic_admin_session');
    }
    return false;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setConnectionError(null);

        // First check for admin session
        if (checkAdminSession()) {
          return;
        }

        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          console.log('Supabase configured, attempting connection...');
          setHasSupabase(true);

          // Set a timeout for the auth check
          const authCheckPromise = SupabaseAuthService.getCurrentSession();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );

          try {
            const { user, error } = await Promise.race([authCheckPromise, timeoutPromise]) as any;

            if (error) {
              throw new Error(error);
            }

            if (user) {
              console.log('User authenticated:', user.name);
              setUser(user);
              setIsAuthenticated(true);
            } else {
              console.log('No authenticated user found');
              // Don't auto-login, just show sign-in page
            }
          } catch (authError) {
            console.warn('Supabase auth check failed:', authError);
            // Don't set connection error or auto-login
            // Just mark Supabase as unavailable and show sign-in page
            setHasSupabase(false);
          }
        } else {
          console.log('Supabase not configured');
          setHasSupabase(false);
          // Don't auto-login, just show sign-in page
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Don't set connection error or auto-login
        setHasSupabase(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up auth state listener only after initial check
  // Set up auth state listener only after initial check
  useEffect(() => {
    if (!hasSupabase || user?.isAdmin) return;

    let subscription: any = null;

    try {
      const { data } = SupabaseAuthService.onAuthStateChange((user) => {
        console.log('Auth state changed:', user ? user.name : 'signed out');

        // Don't override admin users
        if (user?.isAdmin) return;

        // Don't override face recognition users
        // Check if current user is logged in via face recognition
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.authMethod === 'face') {
          console.log('⚠️ Ignoring Supabase auth change - user logged in via face recognition');
          return;
        }

        setUser(user);
        setIsAuthenticated(!!user);
      });

      subscription = data?.subscription;
    } catch (error) {
      console.warn('Failed to set up auth state listener:', error);
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [hasSupabase, user?.isAdmin]); // Remove isAuthenticated from dependencies
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
    setAuthView('signin'); // ADD THIS LINE to ensure we're on signin view
    setConnectionError(null);

    // Play portal sound for sign in
    SoundEffects.playSound('portal');
  };

  const handleSignOut = async () => {
    try {
      // Clear admin session if it exists
      localStorage.removeItem('mythic_admin_session');

      if (hasSupabase && !user?.isAdmin) {
        await SupabaseAuthService.signOut();
      }
      setUser(null);
      setIsAuthenticated(false);
      setAuthView('signin'); // ADD THIS LINE
      setActiveTab('home');
      setConnectionError(null);

      // Play portal sound for sign out
      SoundEffects.playSound('portal');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force sign out even if there's an error
      setUser(null);
      setIsAuthenticated(false);
      setAuthView('signin'); // ADD THIS LINE
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

    // Update in Supabase if available
    if (hasSupabase && !user.isAdmin) {
      try {
        await SupabaseAuthService.updateWalkingDistance(
          user.id,
          newDailyDistance,
          newTotalDistance,
          today
        );
      } catch (error) {
        console.warn('Failed to update walking distance in Supabase:', error);
      }
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

    // Update in Supabase if available
    if (hasSupabase && !user.isAdmin) {
      try {
        await SupabaseAuthService.updateUserCoins(user.id, newCoinBalance);
      } catch (error) {
        console.warn('Failed to update coins in Supabase:', error);
      }
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

    // Update in Supabase if available
    if (hasSupabase && !user.isAdmin) {
      try {
        await SupabaseAuthService.updateUserCoins(user.id, newCoinBalance);
      } catch (error) {
        console.warn('Failed to update coins in Supabase:', error);
      }
    }

    // Create transaction record
    const transaction = CoinSystem.createTransaction(-amount, 'purchase', description);
    setCoinTransactions(prev => [transaction, ...prev]);

    // Play coin spend sound
    SoundEffects.playSound('coin');
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

      // Update in Supabase if available
      if (hasSupabase && !user.isAdmin) {
        try {
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
        } catch (error) {
          console.warn('Failed to update progress in Supabase:', error);
        }
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

    // Update in Supabase if available
    if (hasSupabase && !user.isAdmin) {
      try {
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
      } catch (error) {
        console.warn('Failed to update progress in Supabase:', error);
      }
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

    // Save chronicle to Supabase if available
    if (hasSupabase && !user.isAdmin) {
      try {
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
      } catch (error) {
        console.warn('Failed to save chronicle to Supabase:', error);
        // Fallback to local storage
        setChronicles(prev => [chronicle, ...prev]);
      }
    } else {
      // Local storage fallback
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-100 font-cinzel text-xl">Loading Mythic Quest...</p>
          <p className="text-amber-200 font-merriweather text-sm mt-2">
            Connecting to your wellness realm...
          </p>
        </div>
      </div>
    );
  }

  // Check for admin login
  if (authView === 'signin' && !isAuthenticated) {
    const adminEmail = 'admin@123';
    const adminPassword = 'admin123';

    // Check if admin credentials were entered
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const password = urlParams.get('password');

    if (email === adminEmail && password === adminPassword) {
      // Create admin user
      const adminUser: User = {
        ...mockUser,
        id: 'admin-user',
        name: 'Administrator',
        email: adminEmail,
        isAdmin: true
      };

      // Store admin session
      localStorage.setItem('mythic_admin_session', JSON.stringify({
        user: adminUser,
        timestamp: Date.now()
      }));

      // Set admin user
      setUser(adminUser);
      setIsAuthenticated(true);
    }
  }

  // Authentication flow (skip if in demo mode)
  if (!isAuthenticated) {
    switch (authView) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={() => setAuthView('signup')}
            onSignIn={() => setAuthView('signin')}
          />
        );
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
      case 'signin':
        return (
          <SignInForm
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setAuthView('signup')}
            onForgotPassword={() => setAuthView('forgot')}
          />
        );
      default:
        return (
          <LandingPage
            onGetStarted={() => setAuthView('signup')}
            onSignIn={() => setAuthView('signin')}
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

  // Ensure user is not null before rendering main app
  if (!user) {
    return (
      <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-100 font-cinzel text-xl">Initializing your adventure...</p>
          <p className="text-amber-200 font-merriweather text-sm mt-2">
            Preparing your wellness realm...
          </p>
        </div>
      </div>
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
            user={user}
            onUserUpdate={handleUserUpdate}
            pendingLevelUpShare={pendingLevelUpShare}
            onLevelUpShareProcessed={() => setPendingLevelUpShare(null)}
          />
        );
      case 'marketplace':
        return (
          <MarketplacePage
            userCoins={user.mythicCoins || 0}
            onCoinSpent={spendCoins}
            onInventoryUpdate={addToInventory}
          />
        );
      case 'chronicles':
        return (
          <ChroniclesPage
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      default:
        return (
          <HomePage
            user={user}
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

      {/* Connection status banner - REMOVED */}
      {/* {connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white text-center py-2 z-50">
          <p className="text-xs sm:text-sm font-cinzel px-2">
            ⚠️ {connectionError}
          </p>
        </div>
      )} */}

      {/* Demo mode banner */}
      {/* {!hasSupabase && !connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white text-center py-2 z-50">
          <p className="text-xs sm:text-sm font-cinzel px-2">
            <span className="ml-2 text-amber-200 hidden sm:inline">Connect Supabase for full functionality</span>
          </p>
        </div>
      )} */}

      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        quests={quests}
      />

      <main className={`relative ${(!hasSupabase || connectionError) ? 'pt-20 sm:pt-28' : 'pt-16 sm:pt-20'} pb-4 sm:pb-6`}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="relative backdrop-blur-sm bg-white/80 rounded-lg sm:rounded-2xl shadow-xl border border-amber-100/20 overflow-hidden">
            <div className="absolute inset-0 border-2 sm:border-4 border-amber-500/10 rounded-lg sm:rounded-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative p-3 sm:p-6">
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
      {showLevelUpPopup && levelUpData && (
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