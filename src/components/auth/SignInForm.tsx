import React, { useState } from 'react';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import { User } from '../../types';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user, error } = await SupabaseAuthService.signIn(
        formData.email.trim(),
        formData.password
      );

      if (error) {
        setError(error);
      } else if (user) {
        setSuccess('Welcome back, adventurer!');
        setTimeout(() => {
          onSignIn(user);
        }, 1000);
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account login
  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@mythicquest.com',
      password: 'demo123'
    });
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user, error } = await SupabaseAuthService.signIn(
        'demo@mythicquest.com',
        'demo123'
      );

      if (error) {
        setError('Demo account not available. Please create your own account.');
      } else if (user) {
        setSuccess('Welcome to the demo account!');
        setTimeout(() => {
          onSignIn(user);
        }, 1000);
      }
    } catch (error) {
      setError('Demo account not available. Please create your own account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Hero"
      subtitle="Sign in to continue your wellness adventure in the mystical realm of Eldoria"
    >
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
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
              name="password"
              value={formData.password}
              onChange={handleInputChange}
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-amber-600 hover:text-amber-700 font-cinzel text-sm underline"
            disabled={isLoading}
          >
            Forgot your password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <span className="text-red-700 font-merriweather text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
            <span className="text-green-700 font-merriweather text-sm">{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          className="py-3 font-cinzel font-bold text-lg magical-glow"
        >
          {isLoading ? 'Signing In...' : 'Enter the Realm'}
        </Button>

        {/* Demo Account Button */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="py-3 font-cinzel font-bold"
        >
          Try Demo Account
        </Button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-amber-800 font-merriweather">
            New to Mythic Quest?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-600 hover:text-amber-700 font-cinzel font-bold underline"
              disabled={isLoading}
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