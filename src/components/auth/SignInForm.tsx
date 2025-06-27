import React, { useState } from 'react';
import { User } from '../../types';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import { mockUser } from '../../data/mockData';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

interface SignInFormProps {
  onSignIn: (user: User) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignIn, onSwitchToSignUp, onForgotPassword }) => {
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
        const adminUser: User = {
          ...mockUser,
          id: 'admin-user-id',
          email: 'admin@123',
          name: 'Administrator',
          isAdmin: true
        };
        onSignIn(adminUser);
        return;
      }

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        // Demo mode - accept any credentials
        console.log('Demo mode: Using mock authentication');
        const demoUser: User = {
          ...mockUser,
          email: email,
          name: email.split('@')[0]
        };
        onSignIn(demoUser);
        return;
      }

      // Try Supabase authentication
      const { user, error: authError } = await SupabaseAuthService.signIn(email, password);

      if (authError) {
        setError(authError);
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

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-cinzel font-bold text-sm mb-2">Demo Access</h4>
          <div className="text-blue-700 text-sm font-merriweather space-y-1">
            <p><strong>Admin:</strong> admin@123 / admin@123</p>
            <p><strong>Demo:</strong> Any email/password works</p>
          </div>
        </div>

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
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="text-sm text-amber-600 hover:text-amber-700 font-cinzel font-bold"
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
          {isLoading ? 'Signing In...' : 'Enter the Realm'}
        </Button>

        <div className="text-center">
          <p className="text-gray-600 font-merriweather">
            New to Eldoria?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-600 hover:text-amber-700 font-cinzel font-bold"
            >
              Begin Your Journey
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;