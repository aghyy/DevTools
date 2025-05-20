"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FavoritesPage from '@/components/pages/favorites/favorites';

export default async function Favorites() {
  const user = await auth();
  if (!user) redirect('/no-access');

  return <FavoritesPage />;
}