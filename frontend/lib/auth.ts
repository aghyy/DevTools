'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type UserPayload = {
  user_id: string;
  exp: number;
  jti: string;
  token_type: string;
};

let publicKey: string | null = null;

async function getPublicKey(): Promise<string | null> {
  if (publicKey) return publicKey;

  const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${baseUrl}/api/auth/jwt-public-key/`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error('Failed to fetch JWT public key:', response.status);
      return null;
    }

    const data = await response.json();
    publicKey = data.publicKey;
    return publicKey;
  } catch (error) {
    console.error('Failed to fetch JWT public key:', error);
    return null;
  }
}

export async function auth(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return null;
  
  try {
    const key = await getPublicKey();
    if (!key) return null;
    const user = jwt.verify(token, key, {
      algorithms: ['RS256'],
    }) as UserPayload;
    return user;
  } catch {
    return null;
  }
}