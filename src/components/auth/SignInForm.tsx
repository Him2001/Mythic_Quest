import React, { useState } from 'react';
import { User } from '../../types';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import { AuthService } from '../../utils/authService';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

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
          email: 'admin@mythicquest.com',
          password: '',
          level: 99,
          xp: 999999,
          xpToNextLevel: 999999,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          joinDate: new Date(),
          questsCompleted: 999,
          dailyWalkingDistance: 0,
          totalWalkingDistance: 0,
          lastWalkingDate: '',
          mythicCoins: 999999,
          inventory: [],
          posts: [],
          following: [],
          followers: [],
          bio: 'System Administrator',
          authMethod: 'email',
          isAdmin: true,
          isActive: true,
          lastLoginDate: new Date(),
          createdAt: new Date(),
          isOnline: true,
          lastSeenAt: new Date(),
          chronicles: []
        };
        
        onSignIn(adminUser);
        return;
      }

      // Check if Supabase is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Try Supabase authentication
        const { user, error } = await SupabaseAuthService.signIn(email, password);
        
        if (error) {
          setError(error);
          return;
        }

        if (user) {
          onSignIn(user);
          return;
        }
      }

      // Fallback to local authentication
      const user = AuthService.signIn(email, password);
      if (user) {
        onSignIn(user);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Adventurer"
      subtitle="Continue your mystical wellness journey in the realm of Eldoria"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
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
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="ml-2 text-sm text-gray-600 font-merriweather">Remember me</span>
          </label>
          
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-amber-600 hover:text-amber-700 font-cinzel font-bold transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          icon={<LogIn size={20} />}
          className="magical-glow"
        >
          {isLoading ? 'Entering the Realm...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <p className="text-gray-600 font-merriweather">
            New to the realm?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-600 hover:text-amber-700 font-cinzel font-bold transition-colors"
            >
              Begin your adventure
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;