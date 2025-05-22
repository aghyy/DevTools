import { atom } from 'jotai';
import { FavoriteTool } from '@/services/favoriteToolService';

export const favoriteToolsAtom = atom<FavoriteTool[]>([]);
export const isLoadingFavoritesAtom = atom<boolean>(true);