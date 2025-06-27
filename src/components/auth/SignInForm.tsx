import React, { useState } from 'react';
import { User } from '../../types';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, Sparkles, Crown } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check for admin credentials
      if (email === 'admin@123' && password === 'admin@123') {
        // Create admin user
        const adminUser: User = {
          id: 'admin-user-id',
          name: 'Administrator',
          email: 'admin@123',
          password: '',
          level: 99,
          xp: 999999,
          xpToNextLevel: 999999,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&accessories=sunglasses&top=shortHair&hairColor=black&facialHair=beard&facialHairColor=black',
          joinDate: new Date('2024-01-01'),
          questsCompleted: 999,
          dailyWalkingDistance: 0,
          totalWalkingDistance: 999999,
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

        // Store admin session in localStorage to persist across page reloads
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
      } else if (user) {
        onSignIn(user);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (error) {
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="text-white mr-2 magical-glow" size={28} />
              <h1 className="text-2xl font-cinzel font-bold text-white magical-glow">
                Mythic Quest
              </h1>
            </div>
            <p className="text-amber-100 font-merriweather">
              Enter the realm of wellness adventure
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-merriweather">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors font-merriweather"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors font-merriweather"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                className="py-3 font-cinzel font-bold text-lg magical-glow"
              >
                {isLoading ? 'Entering Realm...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={onForgotPassword}
                className="text-amber-600 hover:text-amber-700 font-merriweather text-sm transition-colors"
              >
                Forgot your password?
              </button>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 font-merriweather text-sm mb-3">
                  New to the realm?
                </p>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={onSwitchToSignUp}
                  className="font-cinzel"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-amber-100 font-merriweather text-sm">
            Begin your wellness adventure in the mystical realm of Eldoria
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;