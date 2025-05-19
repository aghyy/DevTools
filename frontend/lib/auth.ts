'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { apiWithoutCredentials } from '@/utils/axios';

type UserPayload = {
  user_id: string;
  exp: number;
  jti: string;
  token_type: string;
};

// Cache for the public key
let publicKey: string | null = null;

async function getPublicKey(): Promise<string> {
  if (publicKey) return publicKey;

  const response = await apiWithoutCredentials('/api/auth/jwt-public-key/', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Failed to fetch public key');
  }

  const data = await response.data;
  publicKey = data.publicKey;
  if (!publicKey) {
    throw new Error('Received null public key from API');
  }
  return publicKey;
}

export async function auth(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return null;
  
  try {
    const key = await getPublicKey();
    const user = jwt.verify(token, key, {
      algorithms: ['RS256'],
    }) as UserPayload;
    return user;
  } catch {
    return null;
  }
}