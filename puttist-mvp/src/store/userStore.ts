import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../constants';

interface UserStore {
  user: UserProfile | null;
  isLoading: boolean;
  initUser: () => Promise<void>;
  createUser: (nickname: string, avatar: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  clearUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: true,

  initUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ isLoading: false });
    }
  },

  createUser: async (nickname: string, avatar: string) => {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      nickname,
      avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(newUser)
      );
      set({ user: newUser });
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (updates: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date(),
    };

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(updatedUser)
      );
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  clearUser: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      set({ user: null });
    } catch (error) {
      console.error('Failed to clear user:', error);
      throw error;
    }
  },
}));