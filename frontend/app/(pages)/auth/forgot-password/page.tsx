'use client';

import { useState } from 'react';
import { sendResetLink } from '@/services/auth';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendResetLink(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled in the service with toast
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-login-background">
        <div className="w-full max-w-md bg-login-card-background p-8 rounded-lg shadow-lg">
          <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
            <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={64} height={64} />
            <h1 className='text-2xl font-semibold text-center text-login-title-foreground my-2'>DevTools</h1>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-login-success-foreground">
              If this email is registered, you will receive a reset link.
            </p>
            <p className="text-sm text-login-foreground">
              <a href="/auth/login" className="text-blue-accent hover:underline">
                Return to login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-login-background">
      <div className="w-full max-w-md bg-login-card-background p-8 rounded-lg shadow-lg">
        <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
          <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={64} height={64} />
          <h1 className='text-2xl font-semibold text-center text-login-title-foreground my-2'>DevTools</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <input
              type="email"
              id="reset-email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-login-border bg-login-card-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-accent text-white rounded-md font-medium hover:bg-blue-accent-hover focus:outline-none focus:ring-2 focus:ring-login-focus disabled:bg-login-disabled"
          >
            {loading ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-login-foreground">
            Remember your password?{' '}
            <a href="/auth/login" className="text-blue-accent hover:underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}