import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  FoodEntry,
  ActivityEntry,
  WaterEntry,
  WeightEntry,
  MealType,
  FoodUnit,
} from '../types';
import { getTodayString } from '../utils/date';
import { calculateDailyCalories, calculateBMI } from '../utils/calories';

interface NutrioState {
  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Food entries
  foodEntries: FoodEntry[];
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => void;
  removeFoodEntry: (id: string) => void;

  // Activity entries
  activityEntries: ActivityEntry[];
  addActivityEntry: (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => void;
  removeActivityEntry: (id: string) => void;

  // Water
  waterEntries: WaterEntry[];
  addWater: (ml: number, date?: string) => void;

  // Weight
  weightEntries: WeightEntry[];
  addWeightEntry: (weightKg: number) => void;
  removeWeightEntry: (id: string) => void;

  // Recent foods (names for quick re-add)
  recentFoods: Array<{ name: string; calories: number; unit: FoodUnit }>;

  // Helpers
  getTodayFoodEntries: () => FoodEntry[];
  getTodayCaloriesEaten: () => number;
  getTodayCaloriesBurned: () => number;
  getTodayMealCalories: (meal: MealType) => number;
  getTodayWater: () => number;
  getCaloriesForDate: (date: string) => number;
  getWaterForDate: (date: string) => number;

  // Reset
  resetOnboarding: () => void;
  clearAllData: () => void;
}

export const useNutrioStore = create<NutrioState>()(
  persist(
    (set, get) => ({
      profile: null,
      foodEntries: [],
      activityEntries: [],
      waterEntries: [],
      weightEntries: [],
      recentFoods: [],

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => {
        const current = get().profile;
        if (!current) return;
        const updated = { ...current, ...updates };
        // Recalculate daily calories if relevant fields changed
        if (
          updates.currentWeightKg !== undefined ||
          updates.heightCm !== undefined ||
          updates.activityLevel !== undefined ||
          updates.goal !== undefined ||
          updates.gender !== undefined ||
          updates.birthdate !== undefined
        ) {
          updated.dailyCalorieGoal = calculateDailyCalories(
            updated.gender,
            updated.currentWeightKg,
            updated.heightCm,
            updated.birthdate,
            updated.activityLevel,
            updated.goal
          );
        }
        set({ profile: updated });
      },

      addFoodEntry: (entry) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const newEntry: FoodEntry = { ...entry, id, createdAt: new Date().toISOString() };
        const recentFoods = get().recentFoods;
        const exists = recentFoods.findIndex((f) => f.name === entry.name);
        let updatedRecent = [...recentFoods];
        if (exists >= 0) {
          updatedRecent.splice(exists, 1);
        }
        updatedRecent.unshift({ name: entry.name, calories: entry.calories, unit: entry.unit });
        if (updatedRecent.length > 10) updatedRecent = updatedRecent.slice(0, 10);
        set((state) => ({
          foodEntries: [...state.foodEntries, newEntry],
          recentFoods: updatedRecent,
        }));
      },

      removeFoodEntry: (id) =>
        set((state) => ({
          foodEntries: state.foodEntries.filter((e) => e.id !== id),
        })),

      addActivityEntry: (entry) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const newEntry: ActivityEntry = { ...entry, id, createdAt: new Date().toISOString() };
        set((state) => ({
          activityEntries: [...state.activityEntries, newEntry],
        }));
      },

      removeActivityEntry: (id) =>
        set((state) => ({
          activityEntries: state.activityEntries.filter((e) => e.id !== id),
        })),

      addWater: (ml, date) => {
        const d = date || getTodayString();
        set((state) => {
          const existing = state.waterEntries.find((w) => w.date === d);
          if (existing) {
            return {
              waterEntries: state.waterEntries.map((w) =>
                w.date === d ? { ...w, totalMl: w.totalMl + ml } : w
              ),
            };
          }
          return { waterEntries: [...state.waterEntries, { date: d, totalMl: ml }] };
        });
      },

      addWeightEntry: (weightKg) => {
        const profile = get().profile;
        if (!profile) return;
        const bmi = calculateBMI(weightKg, profile.heightCm);
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const entry: WeightEntry = {
          id,
          date: getTodayString(),
          weightKg,
          bmi,
        };
        set((state) => ({
          weightEntries: [...state.weightEntries, entry],
          profile: state.profile ? { ...state.profile, currentWeightKg: weightKg } : null,
        }));
      },

      removeWeightEntry: (id) =>
        set((state) => ({
          weightEntries: state.weightEntries.filter((e) => e.id !== id),
        })),

      getTodayFoodEntries: () => {
        const today = getTodayString();
        return get().foodEntries.filter((e) => e.date === today);
      },

      getTodayCaloriesEaten: () => {
        const today = getTodayString();
        return get()
          .foodEntries.filter((e) => e.date === today)
          .reduce((sum, e) => sum + e.calories * e.quantity, 0);
      },

      getTodayCaloriesBurned: () => {
        const today = getTodayString();
        return get()
          .activityEntries.filter((e) => e.date === today)
          .reduce((sum, e) => sum + e.caloriesBurned, 0);
      },

      getTodayMealCalories: (meal) => {
        const today = getTodayString();
        return get()
          .foodEntries.filter((e) => e.date === today && e.mealType === meal)
          .reduce((sum, e) => sum + e.calories * e.quantity, 0);
      },

      getTodayWater: () => {
        const today = getTodayString();
        const entry = get().waterEntries.find((w) => w.date === today);
        return entry?.totalMl || 0;
      },

      getCaloriesForDate: (date) => {
        return get()
          .foodEntries.filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.calories * e.quantity, 0);
      },

      getWaterForDate: (date) => {
        const entry = get().waterEntries.find((w) => w.date === date);
        return entry?.totalMl || 0;
      },

      resetOnboarding: () =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, onboardingCompleted: false } : null,
        })),

      clearAllData: () =>
        set({
          profile: null,
          foodEntries: [],
          activityEntries: [],
          waterEntries: [],
          weightEntries: [],
          recentFoods: [],
        }),
    }),
    {
      name: 'nutrio-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        foodEntries: state.foodEntries,
        activityEntries: state.activityEntries,
        waterEntries: state.waterEntries,
        weightEntries: state.weightEntries,
        recentFoods: state.recentFoods,
      }),
    }
  )
);
