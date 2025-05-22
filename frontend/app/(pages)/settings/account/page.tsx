"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AccountPage from '@/components/pages/settings/account';

export default async function Account() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <AccountPage />;
}