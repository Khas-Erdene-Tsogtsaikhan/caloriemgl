import Constants from 'expo-constants';
import { create } from 'zustand';
import { initDb } from '@/lib/db/db';
import type { FoodRow } from '@/lib/repo/foodsRepo';
import { searchWithUsdaFallback } from '@/lib/repo/foodsRepo';
import type { FoodLogRow } from '@/lib/repo/logsRepo';
import {
  copyLogsFromDay as copyLogsFromDayRepo,
  deleteLog,
  insertLog,
  listLogsByDay,
} from '@/lib/repo/logsRepo';
import type { InsertLogPayload } from '@/lib/repo/logsRepo';
import { getTodayString } from '@/src/utils/date';

const USDA_API_KEY = Constants.expoConfig?.extra?.USDA_API_KEY as string | undefined;

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface FoodStoreState {
  query: string;
  results: FoodRow[];
  topMatch: FoodRow | null;
  moreResults: FoodRow[];
  moreExpanded: boolean;
  loading: boolean;
  error: string | null;

  logsByDay: Record<string, FoodLogRow[]>;

  setQuery: (q: string) => void;
  setMoreExpanded: (v: boolean) => void;
  search: (q: string) => Promise<void>;
  hydrateFromDb: () => Promise<void>;
  loadLogsByDay: (date: string) => Promise<void>;
  addLog: (payload: Omit<InsertLogPayload, 'logged_at' | 'log_date'> & { log_date: string }) => Promise<void>;
  removeLog: (logId: string, date: string) => Promise<void>;
  copyLogsFromDay: (fromDate: string, toDate: string) => Promise<void>;
}

export const useFoodStore = create<FoodStoreState>((set, get) => ({
  query: '',
  results: [],
  topMatch: null,
  moreResults: [],
  moreExpanded: false,
  loading: false,
  error: null,
  logsByDay: {},

  setQuery: (q) => set({ query: q }),
  setMoreExpanded: (v) => set({ moreExpanded: v }),

  search: async (q) => {
    const trimmed = q.trim();
    set({ loading: !!trimmed, error: null, topMatch: null, moreResults: [] });
    if (!trimmed) return;
    try {
      const foods = await searchWithUsdaFallback(trimmed, USDA_API_KEY);
      const top = foods[0] ?? null;
      const more = foods.slice(1, 9);
      set({
        results: foods,
        topMatch: top,
        moreResults: more,
        loading: false,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Search failed',
      });
    }
  },

  hydrateFromDb: async () => {
    await initDb();
    const today = getTodayString();
    const logs = await listLogsByDay(today);
    set((s) => ({
      logsByDay: { ...s.logsByDay, [today]: logs },
    }));
  },

  loadLogsByDay: async (date) => {
    const logs = await listLogsByDay(date);
    set((s) => ({
      logsByDay: { ...s.logsByDay, [date]: logs },
    }));
  },

  addLog: async (payload) => {
    const full: InsertLogPayload = {
      ...payload,
      logged_at: new Date().toISOString(),
      log_date: payload.log_date,
    };
    await insertLog(full);
    await get().loadLogsByDay(payload.log_date);
  },

  removeLog: async (logId: string, date: string) => {
    await deleteLog(logId);
    await get().loadLogsByDay(date);
  },

  copyLogsFromDay: async (fromDate: string, toDate: string) => {
    await copyLogsFromDayRepo(fromDate, toDate);
    await get().loadLogsByDay(toDate);
  },
}));
