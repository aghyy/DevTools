'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signup as signupService } from '@/services/auth';
import Image from 'next/image';
type FieldName = 'firstName' | 'lastName' | 'username' | 'email' | 'password' | 'confirmPassword';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<FieldName, boolean>>({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = () => password && confirmPassword && password === confirmPassword;
  const isFormValid = () =>
    firstName && lastName && username && email && password && confirmPassword && validatePassword() && validateEmail(email);

  const handleBlur = (field: FieldName) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleFocus = (field: FieldName) => {
    setTouchedFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signupService(firstName, lastName, username, email, password);
      router.push('/dashboard');
    } catch {
      setError('Error signing up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-login-background">
      <div className="w-full max-w-lg bg-login-card-background p-8 rounded-lg shadow-lg">
        <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
          <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={64} height={64} />

          <h1 className='text-2xl font-semibold text-center text-login-title-foreground my-2'>DevTools</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="flex gap-3">
            <input
              type="text"
              id="signup-first-name"
              value={firstName}
              placeholder='First Name'
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              onFocus={() => handleFocus('firstName')}
              required
              className={`login w-full p-3 border bg-login-card-background ${touchedFields.firstName && !firstName ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus`}
            />

            <input
              type="text"
              id="signup-last-name"
              value={lastName}
              placeholder='Last Name'
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              onFocus={() => handleFocus('lastName')}
              required
              className={`login w-full p-3 border bg-login-card-background ${touchedFields.lastName && !lastName ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus`}
            />
          </div>

          <input
            type="text"
            id="signup-username"
            value={username}
            placeholder='Username'
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur('username')}
            onFocus={() => handleFocus('username')}
            required
            className={`w-full p-3 border bg-login-card-background ${touchedFields.username && !username ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus`}
          />

          <input
            type="email"
            id="signup-email"
            value={email}
            placeholder='Email'
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            onFocus={() => handleFocus('email')}
            required
            className={`login w-full p-3 border bg-login-card-background ${touchedFields.email && (!email || !validateEmail(email)) ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus`}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="signup-password"
              value={password}
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              onFocus={() => handleFocus('password')}
              required
              className={`w-full p-3 border bg-login-card-background ${touchedFields.password && !password ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus pr-10`}
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
              id="signup-confirm-password"
              value={confirmPassword}
              placeholder='Confirm Password'
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              onFocus={() => handleFocus('confirmPassword')}
              required
              className={`w-full p-3 border bg-login-card-background ${touchedFields.confirmPassword && !confirmPassword ? 'border-login-error-foreground' : 'border-login-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-login-focus pr-10`}
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
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        {error && <p className="mt-4 text-login-error-foreground text-sm text-center">{error}</p>}

        <div className="mt-6 text-center">
          <p className="text-sm text-login-foreground">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-accent hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}