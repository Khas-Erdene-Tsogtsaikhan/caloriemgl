import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
    ActivityEntry,
    FoodEntry,
    FoodUnit,
    UserProfile,
    WaterEntry,
    WeightEntry
} from '../types';
import { calculateBMI, calculateDailyCalories } from '../utils/calories';
import { getTodayString } from '../utils/date';
import { computePlanForProfile } from '../utils/planCompute';

interface NutrioState {
  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Food entries
  foodEntries: FoodEntry[];
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => void;
  updateFoodEntry: (id: string, updates: Partial<Omit<FoodEntry, 'id' | 'createdAt'>>) => void;
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
  updateWeightEntry: (id: string, weightKg: number) => void;
  removeWeightEntry: (id: string) => void;

  // Recent foods (names for quick re-add)
  recentFoods: Array<{ name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; unit: FoodUnit }>;

  // Helpers (kept for backward compat but prefer raw arrays + useMemo in components)
  getCaloriesForDate: (date: string) => number;
  getBurnedForDate: (date: string) => number;
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
        // Recompute plan when goal/weight changes (e.g. from Account edit)
        if (
          updates.goal !== undefined ||
          updates.targetWeightKg !== undefined ||
          updates.currentWeightKg !== undefined
        ) {
          const today = getTodayString();
          const { planTargetDate, planPaceKgPerWeek } = computePlanForProfile(
            updated.goal,
            updated.currentWeightKg,
            updated.targetWeightKg,
            today
          );
          updated.planStartDate = today;
          updated.planStartWeightKg = updated.currentWeightKg;
          updated.planTargetDate = planTargetDate;
          updated.planPaceKgPerWeek = planPaceKgPerWeek;
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
        updatedRecent.unshift({
          name: entry.name,
          calories: entry.calories,
          protein_g: entry.protein_g,
          carbs_g: entry.carbs_g,
          fat_g: entry.fat_g,
          unit: entry.unit,
        });
        if (updatedRecent.length > 10) updatedRecent = updatedRecent.slice(0, 10);
        set((state) => ({
          foodEntries: [...state.foodEntries, newEntry],
          recentFoods: updatedRecent,
        }));
      },

      updateFoodEntry: (id, updates) =>
        set((state) => ({
          foodEntries: state.foodEntries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

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

      updateWeightEntry: (id, weightKg) => {
        const profile = get().profile;
        if (!profile) return;
        const bmi = calculateBMI(weightKg, profile.heightCm);
        set((state) => {
          const updated = state.weightEntries.map((e) =>
            e.id === id ? { ...e, weightKg, bmi } : e
          );
          const sorted = [...updated].sort((a, b) => a.date.localeCompare(b.date));
          const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1].weightKg : weightKg;
          return {
            weightEntries: updated,
            profile: state.profile ? { ...state.profile, currentWeightKg: latestWeight } : null,
          };
        });
      },

      removeWeightEntry: (id) =>
        set((state) => {
          const remaining = state.weightEntries.filter((e) => e.id !== id);
          const sorted = [...remaining].sort((a, b) => a.date.localeCompare(b.date));
          const latestWeight = sorted.length > 0
            ? sorted[sorted.length - 1].weightKg
            : state.profile?.currentWeightKg ?? 0;
          return {
            weightEntries: remaining,
            profile: state.profile ? { ...state.profile, currentWeightKg: latestWeight } : null,
          };
        }),

      getCaloriesForDate: (date) => {
        return get()
          .foodEntries.filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.calories * e.quantity, 0);
      },

      getBurnedForDate: (date) => {
        return get()
          .activityEntries.filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.caloriesBurned, 0);
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
