import { atom } from 'jotai';
import { getUserDetails } from '@/services/auth';

export const isGuestAtom = atom<boolean>(true);

// Derived atom that will be used to initialize the guest state
export const initializeGuestStateAtom = atom(
  null,
  async (get, set) => {
    try {
      const user = await getUserDetails();
      set(isGuestAtom, !user);
    } catch {
      set(isGuestAtom, true);
    }
  }
); 