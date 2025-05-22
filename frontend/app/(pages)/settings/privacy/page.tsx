"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PrivacyPage from '@/components/pages/settings/privacy';

export default async function Privacy() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <PrivacyPage />;
}