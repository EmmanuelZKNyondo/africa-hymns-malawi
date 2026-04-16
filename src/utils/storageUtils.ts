import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'ch';
export type CountryCode = 'mw' | 'zm';

export interface FavouriteEntry {
  hymnNumber: number;
  countryCode: string;
  languageCode: string;
  addedAt?: string;
}

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
  favourites: FavouriteEntry[];
  recentHymns: number[];
  lastSync: string | null;
  hymnCacheVersion: string | null;
}

const STORAGE_KEY = "africa-hymns-malawi";

export const DEFAULT_DATA: AppStorageData = {
  acceptedTerms: false,
  settings: {
    theme: 'system',
    fontSize: 16,
    accentColor: '#007A3D',
    language: 'en',
    country: 'mw',
  },
  favourites: [],
  recentHymns: [],
  lastSync: null,
  hymnCacheVersion: null,
};

export async function readStorage(): Promise<AppStorageData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };

    const parsed = JSON.parse(raw) as Partial<AppStorageData>;
    
    // Migration: Convert old number[] favorites to FavouriteEntry[]
    if (Array.isArray(parsed.favourites) && parsed.favourites.length > 0 && typeof parsed.favourites[0] === 'number') {
      const defaultCountry = parsed.settings?.country || 'mw';
      const defaultLanguage = parsed.settings?.language || 'en';
      parsed.favourites = (parsed.favourites as any[]).map(num => ({
        hymnNumber: num,
        countryCode: defaultCountry,
        languageCode: defaultLanguage,
        addedAt: new Date().toISOString()
      }));
    }

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

export async function writeStorage(updates: Partial<AppStorageData>): Promise<AppStorageData> {
  try {
    const current = await readStorage();
    
    const next: AppStorageData = {
      ...current,
      ...updates,
      settings: updates.settings ? { ...current.settings, ...updates.settings } : current.settings,
      favourites: updates.favourites !== undefined ? updates.favourites : current.favourites,
      recentHymns: updates.recentHymns !== undefined ? updates.recentHymns : current.recentHymns,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('[Storage] Write failed:', error);
    throw error;
  }
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await readStorage();
  const nextSettings = { ...current.settings, ...partial };
  await writeStorage({ settings: nextSettings });
  return nextSettings;
}

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Storage] Clear failed:', error);
  }
}