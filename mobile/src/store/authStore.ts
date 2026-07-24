import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Zustand global authentication store.
 * Integrates live Supabase auth listeners if keys are set, 
 * otherwise maps to AsyncStorage for local mock accounts.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
          },
        });
      }

      // Keep user in sync on session refreshes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
            },
          });
        } else {
          set({ user: null });
        }
      });
    } else {
      try {
        const storedUser = await AsyncStorage.getItem('fuubuu-mock-user');
        if (storedUser) {
          set({ user: JSON.parse(storedUser) });
        }
      } catch (err) {
        console.error('Failed to load local mock user credentials', err);
      }
    }

    set({ isLoading: false });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      // Direct local bypass for the developer demo guest account
      if (email === 'fan@fuubuu.com') {
        const mockUser = { id: 'mock-user-123', email };
        await AsyncStorage.setItem('fuubuu-mock-user', JSON.stringify(mockUser));
        set({ user: mockUser });
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || '',
        });
        if (error) throw error;
        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email || '',
            },
          });
        }
      } else {
        const mockUser = { id: 'mock-user-123', email };
        await AsyncStorage.setItem('fuubuu-mock-user', JSON.stringify(mockUser));
        set({ user: mockUser });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || '',
        });
        if (error) throw error;
        if (data.user) {
          // If session is null, it means email confirmation is active and pending
          if (!data.session) {
            throw new Error('Verification pending. Please check your inbox to confirm your email before signing in.');
          }
          set({
            user: {
              id: data.user.id,
              email: data.user.email || '',
            },
          });
        }
      } else {
        const mockUser = { id: 'mock-user-123', email };
        await AsyncStorage.setItem('fuubuu-mock-user', JSON.stringify(mockUser));
        set({ user: mockUser });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      } else {
        await AsyncStorage.removeItem('fuubuu-mock-user');
      }
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
