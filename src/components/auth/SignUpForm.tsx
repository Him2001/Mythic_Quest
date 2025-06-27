import React, { useState } from 'react';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import { User } from '../../types';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Eye, EyeOff, User as UserIcon, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  onSignUp: (user: User) => void;
  onSwitchToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      const { user, error } = await SupabaseAuthService.signUp(
        formData.email.trim(),
        formData.password,
        formData.username.trim()
      );

      if (error) {
        setError(error);
      } else if (user) {
        setSuccess('Account created successfully! Welcome to Mythic Quest!');
        setTimeout(() => {
          onSignUp(user);
        }, 1500);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the Quest"
      subtitle="Create your account and begin your wellness adventure in the mystical realm of Eldoria"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-cinzel font-bold text-amber-800 mb-2">
            Choose Your Hero Name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={20} />
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
              placeholder="Enter your hero name"
              required
              disabled={isLoading}
            />
          </div>
        </div>

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
            Create Password
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
              placeholder="Create a strong password"
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-cinzel font-bold text-amber-800 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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
          {isLoading ? 'Creating Your Account...' : 'Begin Your Quest'}
        </Button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-amber-800 font-merriweather">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-amber-600 hover:text-amber-700 font-cinzel font-bold underline"
              disabled={isLoading}
            >
              Sign In Here
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUpForm;