import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteTeamIds: number[];
  favoriteCompetitionCodes: string[];
  toggleFavoriteTeam: (id: number) => void;
  toggleFavoriteCompetition: (code: string) => void;
  isFavoriteTeam: (id: number) => boolean;
  isFavoriteCompetition: (code: string) => boolean;
}

/**
 * Zustand global store for toggling and saving user favorites.
 * Utilizes AsyncStorage to remember favorites across app launches.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteTeamIds: [],
      favoriteCompetitionCodes: [],
      
      toggleFavoriteTeam: (id) => {
        const ids = get().favoriteTeamIds;
        set({
          favoriteTeamIds: ids.includes(id)
            ? ids.filter((tId) => tId !== id)
            : [...ids, id],
        });
      },
      
      toggleFavoriteCompetition: (code) => {
        const codes = get().favoriteCompetitionCodes;
        set({
          favoriteCompetitionCodes: codes.includes(code)
            ? codes.filter((cCode) => cCode !== code)
            : [...codes, code],
        });
      },
      
      isFavoriteTeam: (id) => get().favoriteTeamIds.includes(id),
      isFavoriteCompetition: (code) => get().favoriteCompetitionCodes.includes(code),
    }),
    {
      name: 'fuubuu-favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
