import React, { useState } from 'react';
import { AuthService } from '../../utils/authService';
import { User } from '../../types';
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
    setError('');
    setIsLoading(true);

    try {
      const result = AuthService.signIn({ email, password });
      
      if (result.success && result.user) {
        onSignIn(result.user);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = (userType: 'admin' | 'demo') => {
    if (userType === 'admin') {
      setEmail('admin@123');
      setPassword('admin@123');
    } else {
      setEmail('demo@example.com');
      setPassword('demo123');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-cinzel font-bold text-amber-800 mb-2 magical-glow">
            Welcome
          </h1>
          <p className="text-amber-700 font-merriweather">
            Sign in to continue your wellness journey in Eldoria
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-merriweather">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700"
                disabled={isLoading}
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
            icon={<LogIn size={20} />}
            className="magical-glow font-cinzel font-bold"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Access Buttons */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-cinzel font-bold text-amber-800 mb-3">Quick Access:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickSignIn('admin')}
              className="w-full text-left px-3 py-2 text-sm bg-red-100 hover:bg-red-200 rounded-md transition-colors font-merriweather"
              disabled={isLoading}
            >
              <strong>Administrator:</strong> admin@123 / admin@123
            </button>
          </div>
        </div>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={onForgotPassword}
            className="text-amber-700 hover:text-amber-800 text-sm font-merriweather underline"
            disabled={isLoading}
          >
            Forgot your password?
          </button>
          
          <div className="text-amber-700 font-merriweather">
            <span className="text-sm">Don't have an account? </span>
            <button
              onClick={onSwitchToSignUp}
              className="text-amber-800 hover:text-amber-900 font-bold underline"
              disabled={isLoading}
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignInForm;