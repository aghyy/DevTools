"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await auth();
  if (!user) redirect('/no-access');
  if (user) redirect('/dashboard');
}