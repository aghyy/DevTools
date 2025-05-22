'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/services/auth';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const validatePassword = () => password && confirmPassword && password === confirmPassword;
  const isFormValid = () => password && confirmPassword && validatePassword();

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleFocus = (field: 'password' | 'confirmPassword') => {
    setTouchedFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(token || '', password, confirmPassword);
      router.push('/auth/login');
    } catch (err) {
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-login-background">
        <div className="w-full max-w-md bg-login-card-background p-8 rounded-lg shadow-lg">
          <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
            <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={64} height={64} />
            <h1 className='text-2xl font-semibold text-center text-login-title-foreground my-2'>DevTools</h1>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-login-error-foreground">
              Invalid or expired reset link.
            </p>
            <p className="text-sm text-login-foreground">
              <a href="/auth/forgot-password" className="text-blue-accent hover:underline">
                Request a new reset link
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="reset-password"
              value={password}
              placeholder='New Password'
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              onFocus={() => handleFocus('password')}
              required
              className={`w-full p-3 border bg-login-card-background ${touchedFields.password && !password ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus pr-10`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-login-show-password-icon hover:text-login-show-password-icon-hover focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="reset-confirm-password"
              value={confirmPassword}
              placeholder='Confirm New Password'
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              onFocus={() => handleFocus('confirmPassword')}
              required
              className={`w-full p-3 border bg-login-card-background ${touchedFields.confirmPassword && !confirmPassword ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus pr-10`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-login-show-password-icon hover:text-login-show-password-icon-hover focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!validatePassword() && touchedFields.confirmPassword && (
            <p className="text-sm text-login-error-foreground mt-2">Passwords do not match</p>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 bg-blue-accent text-white rounded-md font-medium hover:bg-blue-accent-hover focus:outline-none focus:ring-2 focus:ring-login-focus disabled:bg-login-disabled"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
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
