import React, { useState } from 'react';
import { User } from '../../types';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus, HelpCircle } from 'lucide-react';

interface SignInFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
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
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@mythicquest.com');
    setPassword('demo123');
  };

  const handleAdminLogin = () => {
    setEmail('admin@123');
    setPassword('admin@123');
  };

  return (
    <AuthLayout
      title="Welcome Back, Adventurer"
      subtitle="Continue your mythical wellness journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-merriweather">{error}</p>
          </div>
        )}

        {/* Demo Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-cinzel font-bold mb-2">Demo Accounts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-merriweather">Regular User:</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDemoLogin}
                className="text-blue-600 hover:text-blue-800"
              >
                Use Demo Account
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-merriweather">Administrator:</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAdminLogin}
                className="text-blue-600 hover:text-blue-800"
              >
                Use Admin Account
              </Button>
            </div>
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
            className="text-sm text-amber-600 hover:text-amber-800 font-cinzel font-bold"
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
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <p className="text-gray-600 font-merriweather">
            New to Mythic Quest?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-600 hover:text-amber-800 font-cinzel font-bold"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;