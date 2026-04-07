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
  const url = `${baseUrl}/api/auth/jwt-public-key/`;
  console.log('[auth] Fetching public key from:', url);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error('[auth] Public key fetch failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    publicKey = data.publicKey;
    console.log('[auth] Public key fetched successfully');
    return publicKey;
  } catch (error) {
    console.error('[auth] Public key fetch error:', error);
    return null;
  }
}

export async function auth(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) {
    console.log('[auth] No JWT cookie found');
    return null;
  }

  console.log('[auth] JWT cookie present, verifying...');

  try {
    const key = await getPublicKey();
    if (!key) {
      console.error('[auth] No public key available, cannot verify');
      return null;
    }
    const user = jwt.verify(token, key, {
      algorithms: ['RS256'],
    }) as UserPayload;
    console.log('[auth] JWT verified, user:', user.user_id);
    return user;
  } catch (error) {
    console.error('[auth] JWT verification failed:', error);
    return null;
  }
}