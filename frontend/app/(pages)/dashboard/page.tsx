"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardPage from '@/components/pages/dashboard/dashboard';

export default async function Dashboard() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <DashboardPage />;
}