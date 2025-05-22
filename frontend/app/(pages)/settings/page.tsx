"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsPage from '@/components/pages/settings/settings';

export default async function Settings() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <SettingsPage />;
}