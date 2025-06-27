import React, { useState } from 'react';
import { AuthService } from '../../utils/authService';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.requestPasswordReset(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-green-600" size={24} />
          </div>
          
          <div>
            <p className="text-mystic-dark font-merriweather mb-4">
              If an account with the email <strong>{email}</strong> exists, 
              we've sent you a password reset link.
            </p>
            <p className="text-sm text-amber-700 font-merriweather">
              Check your email and follow the instructions to reset your password.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={onBackToSignIn}
            icon={<ArrowLeft size={18} />}
            className="magical-glow"
          >
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm font-merriweather">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-cinzel font-bold text-mystic-dark mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/90"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          icon={<Send size={18} />}
          className="magical-glow"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={onBackToSignIn}
          icon={<ArrowLeft size={18} />}
        >
          Back to Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;