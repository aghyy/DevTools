'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginService } from '@/services/auth';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginService(identifier, password);
      if (response) {
        router.push('/dashboard');
      }
    } catch {
      toast.error('Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-login-background flex-col">
      <div className="w-full max-w-md bg-login-card-background p-8 rounded-lg shadow-lg">
        <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
          <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={64} height={64} />
          <h1 className='text-2xl font-semibold text-center text-login-title-foreground my-2'>DevTools</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <input
              type="text"
              id="login-identifier"
              value={identifier}
              placeholder='Username or email'
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 border border-login-border bg-login-card-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus"
            />
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                value={password}
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-login-border bg-login-card-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-login-show-password-icon hover:text-login-show-password-icon-hover focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-login-foreground mt-2">
            <a href="/auth/forgot-password" className="text-blue-accent text-right hover:underline">
              Forgot Password?
            </a>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-accent text-white rounded-md font-medium hover:bg-blue-accent-hover focus:outline-none focus:ring-2 focus:ring-login-focus disabled:bg-login-disabled"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-login-foreground">
            Don&apos;t have an account?{' '}
            <a href="/auth/create-account" className="text-blue-accent hover:underline">
              Create account
            </a>
          </p>
        </div>
      </div>

      <div className="w-full max-w-md bg-login-card-background p-8 rounded-lg shadow-lg mt-4">
        <div className="w-full flex flex-col gap-3 items-center justify-center">
          <h2 className="text-xl font-semibold text-center text-login-title-foreground">Continue as Guest</h2>
          <p className="text-sm text-login-foreground text-center mb-4">
            Access basic features without creating an account
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-login-focus"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}