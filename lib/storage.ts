import { STORAGE_KEY, type AppState } from '@/types';

type Stored = Partial<AppState>;

export function getState(): Stored {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Stored;
  } catch {
    return {};
  }
}

export function setLastViewedDay(month: number, day: number): void {
  if (typeof window === 'undefined') return;
  try {
    const state: Stored = { ...getState(), lastViewedDay: { month, day } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}
