"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationsPage from '@/components/pages/settings/notifications';

export default async function Notifications() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <NotificationsPage />;
}