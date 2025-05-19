import { atom } from 'jotai';
import { getUserDetails } from '@/services/auth';
import { UserData } from '@/types/user';

export const isGuestAtom = atom<boolean>(true);
export const userDataAtom = atom<UserData | null>(null);

// Derived atom that will be used to initialize the guest state and user data
export const initializeGuestStateAtom = atom(
  null,
  async (get, set) => {
    try {
      const user = await getUserDetails();
      set(isGuestAtom, !user);
      set(userDataAtom, user);
    } catch {
      set(isGuestAtom, true);
      set(userDataAtom, null);
    }
  }
);

// Atom to update user data
export const updateUserDataAtom = atom(
  null,
  async (get, set, newData: UserData) => {
    set(userDataAtom, newData);
  }
); 