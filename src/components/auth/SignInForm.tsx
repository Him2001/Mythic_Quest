import React, { useState } from 'react';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import { User } from '../../types';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, Shield, Crown } from 'lucide-react';

interface SignInFormProps {
  onSignIn: (user: User) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onSignIn,
  onSwitchToSignUp,
  onForgotPassword
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createAdminUser = (): User => {
    return {
      id: 'admin-user-id',
      name: 'Administrator',
      email: 'admin@mythicquest.com',
      password: '',
      level: 99,
      xp: 999999,
      xpToNextLevel: 999999,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=BrownDark&facialHairType=Blank&clotheType=Hoodie&clotheColor=PastelBlue&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Light',
      joinDate: new Date('2024-01-01'),
      questsCompleted: 999,
      dailyWalkingDistance: 10000,
      totalWalkingDistance: 1000000,
      lastWalkingDate: new Date().toISOString().split('T')[0],
      mythicCoins: 999999,
      inventory: [],
      posts: [],
      following: [],
      followers: [],
      bio: 'Supreme Administrator of the Mythic Realm',
      authMethod: 'email',
      isAdmin: true,
      isActive: true,
      lastLoginDate: new Date(),
      createdAt: new Date('2024-01-01'),
      isOnline: true,
      lastSeenAt: new Date(),
      chronicles: []
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check for admin credentials first
      if (email === 'admin@123' && password === 'admin@123') {
        const adminUser = createAdminUser();
        
        // Store admin session in localStorage for persistence
        localStorage.setItem('mythic_admin_session', JSON.stringify({
          user: adminUser,
          timestamp: Date.now()
        }));
        
        onSignIn(adminUser);
        return;
      }

      // Regular user authentication
      const { user, error } = await SupabaseAuthService.signIn(email, password);
      
      if (error) {
        setError(error);
        return;
      }

      if (user) {
        onSignIn(user);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Magical particles */}
      <div className="absolute inset-0 magical-particles opacity-30" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-amber-200/50 p-8 magical-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center magical-glow">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-cinzel font-bold text-amber-800 mb-2 magical-glow">
              Welcome Back
            </h1>
            <p className="text-amber-700 font-merriweather">
              Enter the mystical realm of wellness
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-merriweather">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-cinzel font-bold text-amber-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-cinzel font-bold text-amber-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="py-3 font-cinzel font-bold text-lg magical-glow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entering Realm...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Crown className="mr-2" size={20} />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <button
                onClick={onForgotPassword}
                className="text-amber-700 hover:text-amber-800 font-merriweather text-sm transition-colors"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
            
            <div className="text-center pt-4 border-t border-amber-200">
              <p className="text-amber-700 font-merriweather text-sm">
                New to the realm?{' '}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-amber-800 hover:text-amber-900 font-bold transition-colors"
                  disabled={isLoading}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;