import React, { useState } from 'react';
import { SupabaseAuthService } from '../../utils/supabaseAuthService';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { success, error } = await SupabaseAuthService.resetPassword(email.trim());

      if (error) {
        setError(error);
      } else if (success) {
        setSuccess('Password reset email sent! Check your inbox for further instructions.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
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
          disabled={isLoading || !!success}
          className="py-3 font-cinzel font-bold text-lg magical-glow"
        >
          {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
        </Button>

        {/* Back to Sign In */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-cinzel font-bold underline"
            disabled={isLoading}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;