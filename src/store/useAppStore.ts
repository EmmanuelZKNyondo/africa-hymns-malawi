// src/store/useAppStore.ts
import { create } from 'zustand';
import { 
  AppStorageData, 
  AppSettings, 
  readStorage, 
  writeStorage,
  clearStorage,
  updateSettings as updateSettingsUtil,
  type CountryCode,
  DEFAULT_DATA
} from '@/utils/storageUtils';

/* ==================== STORE INTERFACE ==================== */
interface AppState extends AppStorageData {
  // Async initialization
  loadFromStorage: () => Promise<void>;
  
  // Settings updates (type-safe partial)
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  
  // Favorites management
  toggleFavourite: (hymnNumber: number) => Promise<void>;
  isFavourite: (hymnNumber: number) => boolean;
  
  // Recent hymns tracking
  addRecentHymn: (hymnNumber: number) => Promise<void>;
  
  // Reset utility
  reset: () => Promise<void>;
  
  // Update Notification State
  lastUpdateDismissedVersion: string | null;
  setLastUpdateDismissedVersion: (version: string | null) => void;
  
  // Computed selectors (derived state)
  getActiveCountryName: () => string;
  getFontSizeStyle: () => { fontSize: number };
}

/* ==================== COUNTRY LABELS ==================== */
const COUNTRY_LABELS: Record<CountryCode, string> = {
  mw: 'Malawi',
  zm: 'Zambia'
};

/* ==================== STORE CREATION ==================== */
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state (will be overwritten by loadFromStorage)
  acceptedTerms: false,
  settings: { ...DEFAULT_DATA.settings },
  favourites: [],
  recentHymns: [],
  lastSync: null,
  hymnCacheVersion: null,
  lastUpdateDismissedVersion: null, // ✅ Initialize new field

  // Load persisted data from AsyncStorage
  loadFromStorage: async () => {
    try {
      const data = await readStorage();
      set(data);
    } catch (error) {
      console.warn('[Store] Failed to load from storage:', error);
    }
  },

  // Update settings with partial, type-safe object
  updateSettings: async (partial: Partial<AppSettings>) => {
    try {
      const nextSettings = await updateSettingsUtil(partial);
      set({ settings: nextSettings });
    } catch (error) {
      console.error('[Store] Failed to update settings:', error);
    }
  },

  // Toggle favourite: add if missing, remove if exists
  toggleFavourite: async (hymnNumber: number) => {
    const current = get();
    const exists = current.favourites.includes(hymnNumber);
    
    const nextFavourites = exists
      ? current.favourites.filter((n) => n !== hymnNumber)
      : [...current.favourites, hymnNumber];
    
    await writeStorage({ favourites: nextFavourites });
    set({ favourites: nextFavourites });
  },

  // Check if hymn is favourited (useful for UI toggles)
  isFavourite: (hymnNumber: number) => {
    return get().favourites.includes(hymnNumber);
  },

  // Add hymn to recent list (max 10, most recent first)
  addRecentHymn: async (hymnNumber: number) => {
    const current = get();
    const filtered = current.recentHymns.filter((n) => n !== hymnNumber);
    const nextRecent = [hymnNumber, ...filtered].slice(0, 10);
    
    await writeStorage({ recentHymns: nextRecent });
    set({ recentHymns: nextRecent });
  },

  // Reset to defaults (useful for testing or user request)
  reset: async () => {
    await clearStorage();
    const defaults = await readStorage();
    set(defaults);
  },

  // ✅ Action to set dismissed version
  setLastUpdateDismissedVersion: (version) => {
    set({ lastUpdateDismissedVersion: version });
  },

  // Computed: Get human-readable country name
  getActiveCountryName: () => {
    const { country } = get().settings;
    return COUNTRY_LABELS[country] || 'Malawi';
  },

  // Computed: Get font size style object for consistent application
  getFontSizeStyle: () => {
    const { fontSize } = get().settings;
    return { fontSize };
  },
}));