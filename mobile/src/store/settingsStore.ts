import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsEnabled: boolean;
  goalAlertsEnabled: boolean;
  kickoffAlertsEnabled: boolean;
  favoriteTeamsOnlyEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  setGoalAlertsEnabled: (enabled: boolean) => void;
  setKickoffAlertsEnabled: (enabled: boolean) => void;
  setFavoriteTeamsOnlyEnabled: (enabled: boolean) => void;
}

/**
 * Zustand global store for app settings.
 * Persists settings locally using AsyncStorage.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      goalAlertsEnabled: true,
      kickoffAlertsEnabled: true,
      favoriteTeamsOnlyEnabled: false,

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setGoalAlertsEnabled: (enabled) => set({ goalAlertsEnabled: enabled }),
      setKickoffAlertsEnabled: (enabled) => set({ kickoffAlertsEnabled: enabled }),
      setFavoriteTeamsOnlyEnabled: (enabled) => set({ favoriteTeamsOnlyEnabled: enabled }),
    }),
    {
      name: 'fuubuu-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
