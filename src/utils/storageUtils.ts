// src/utils/storageUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ==================== TYPES ==================== */
export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'ch';
export type CountryCode = 'mw' | 'zm';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: 11 | 12 | 14 | 16 | 18 | 20 | 22;
  accentColor: string;
  language: AppLanguage;
  country: CountryCode;
}

export interface AppStorageData {
  acceptedTerms: boolean;
  settings: AppSettings;
  favourites: number[];        // ✅ Fixed: was [] → number[]
  recentHymns: number[];       // ✅ Fixed: was [] → number[]
  lastSync: string | null;
  hymnCacheVersion: string | null;
}

/* ==================== CONSTANTS ==================== */
const STORAGE_KEY = "africa-hymns-malawi";

export const DEFAULT_DATA: AppStorageData = {
  acceptedTerms: false,
  settings: {
    theme: 'system',
    fontSize: 16,
    accentColor: '#007A3D', // Malawi green
    language: 'en',
    country: 'mw',
  },
  favourites: [],
  recentHymns: [],
  lastSync: null,
  hymnCacheVersion: null,
};

/* ==================== STORAGE FUNCTIONS ==================== */

/**
 * Reads the single storage object. Merges missing keys with defaults.
 * Safe against corrupted JSON or missing files.
 */
export async function readStorage(): Promise<AppStorageData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };

    const parsed = JSON.parse(raw) as Partial<AppStorageData>;
    
    // Deep-safe merge to prevent accidental nullification
    return {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
      favourites: Array.isArray(parsed.favourites) ? parsed.favourites : DEFAULT_DATA.favourites,
      recentHymns: Array.isArray(parsed.recentHymns) ? parsed.recentHymns : DEFAULT_DATA.recentHymns,
    };
  } catch (error) {
    console.warn('[Storage] Read failed, returning defaults:', error);
    return { ...DEFAULT_DATA };
  }
}

/**
 * Updates the single storage object. Only touches provided keys.
 * Returns the full updated object for immediate state sync.
 */
export async function writeStorage(updates: Partial<AppStorageData>): Promise<AppStorageData> {
  try {
    const current = await readStorage();
    
    const next: AppStorageData = {
      ...current,
      ...updates,
      // Safely merge nested settings if provided
      settings: updates.settings
        ? { ...current.settings, ...updates.settings }
        : current.settings,
      // Ensure arrays are properly merged
      favourites: updates.favourites !== undefined 
        ? updates.favourites 
        : current.favourites,
      recentHymns: updates.recentHymns !== undefined 
        ? updates.recentHymns 
        : current.recentHymns,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('[Storage] Write failed:', error);
    throw error;
  }
}

/**
 * Update only settings (partial update, type-safe)
 */
export async function updateSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await readStorage();
  const nextSettings = { ...current.settings, ...partial };
  await writeStorage({ settings: nextSettings });
  return nextSettings;
}

/**
 * Clears entire app storage (for testing/reset flows)
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Storage] Clear failed:', error);
  }
}