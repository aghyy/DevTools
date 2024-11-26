'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/utils/axios';

type FieldName = 'firstName' | 'lastName' | 'username' | 'email' | 'password' | 'confirmPassword';

export default function Register() {
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
      const response = await api.post('/api/users/signup', {
        firstName,
        lastName,
        username,
        email,
        password
      });

      if (response.status === 201) {
        router.push('/auth/login');
      } else {
        setError(response.data.message || 'Error registering user. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error registering user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <div className="w-full flex flex-col gap-3 items-center justify-center pointer-events-none mb-4">
          <img className='size-16' src="/images/icons/devtools-dark.png" alt="DevTools Logo" />
          <h1 className='text-2xl font-semibold text-center text-gray-800 my-2'>DevTools</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="flex gap-3">
            <input
              type="text"
              id="register-first-name"
              value={firstName}
              placeholder='First Name'
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              onFocus={() => handleFocus('firstName')}
              required
              className={`w-full p-3 border ${touchedFields.firstName && !firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />

            <input
              type="text"
              id="register-last-name"
              value={lastName}
              placeholder='Last Name'
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              onFocus={() => handleFocus('lastName')}
              required
              className={`w-full p-3 border ${touchedFields.lastName && !lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <input
            type="text"
            id="register-username"
            value={username}
            placeholder='Username'
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur('username')}
            onFocus={() => handleFocus('username')}
            required
            className={`w-full p-3 border ${touchedFields.username && !username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <input
            type="email"
            id="register-email"
            value={email}
            placeholder='Email'
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            onFocus={() => handleFocus('email')}
            required
            className={`w-full p-3 border ${touchedFields.email && (!email || !validateEmail(email)) ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              value={password}
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              onFocus={() => handleFocus('password')}
              required
              className={`w-full p-3 border ${touchedFields.password && !password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="register-confirm-password"
              value={confirmPassword}
              placeholder='Confirm Password'
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              onFocus={() => handleFocus('confirmPassword')}
              required
              className={`w-full p-3 border ${touchedFields.confirmPassword && !confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!validatePassword() && touchedFields.confirmPassword && (
            <p className="text-sm text-red-500 mt-2">Passwords do not match</p>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div >
    </div >
  );
}