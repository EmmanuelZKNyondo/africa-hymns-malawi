import { create } from 'zustand';
import { 
  AppStorageData, 
  AppSettings, 
  readStorage, 
  writeStorage,
  clearStorage,
  updateSettings as updateSettingsUtil,
  type CountryCode,
  DEFAULT_DATA,
  type FavouriteEntry
} from '@/utils/storageUtils';

interface AppState extends AppStorageData {
  acceptedTerms: any;
  loadFromStorage: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  
  toggleFavourite: (hymnNumber: number, countryCode: string, languageCode: string) => Promise<void>;
  isFavourite: (hymnNumber: number, countryCode: string, languageCode: string) => boolean;
  removeFavourite: (hymnNumber: number, countryCode: string, languageCode: string) => Promise<void>;
  
  addRecentHymn: (hymnNumber: number) => Promise<void>;
  reset: () => Promise<void>;
  
  lastUpdateDismissedVersion: string | null;
  setLastUpdateDismissedVersion: (version: string | null) => void;
  
  isInitializing: boolean;
  setIsInitializing: (status: boolean) => void;
  
  getActiveCountryName: () => string;
  getFontSizeStyle: () => { fontSize: number };
  getGroupedFavourites: () => Record<string, FavouriteEntry[]>;
}

const COUNTRY_LABELS: Record<CountryCode, string> = {
  mw: 'Malawi',
  zm: 'Zambia'
};

export const useAppStore = create<AppState>((set, get) => ({
  acceptedTerms: false,
  settings: { ...DEFAULT_DATA.settings },
  favourites: [],
  recentHymns: [],
  lastSync: null,
  hymnCacheVersion: null,
  lastUpdateDismissedVersion: null,
  isInitializing: true,

  loadFromStorage: async () => {
    set({ isInitializing: true }); 
    try {
      const data = await readStorage();
      set(data);
    } catch (error) {
      console.warn('[Store] Failed to load from storage:', error);
    } finally {
      set({ isInitializing: false }); 
    }
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    try {
      const nextSettings = await updateSettingsUtil(partial);
      set({ settings: nextSettings });
    } catch (error) {
      console.error('[Store] Failed to update settings:', error);
    }
  },

  toggleFavourite: async (hymnNumber, countryCode, languageCode) => {
    const current = get();
    const exists = current.favourites.some(
      f => f.hymnNumber === hymnNumber && 
           f.countryCode === countryCode && 
           f.languageCode === languageCode
    );
    
    const nextFavourites = exists
      ? current.favourites.filter(f => !(
          f.hymnNumber === hymnNumber && 
          f.countryCode === countryCode && 
          f.languageCode === languageCode
        ))
      : [...current.favourites, { hymnNumber, countryCode, languageCode, addedAt: new Date().toISOString() }];
    
    // ✅ Optimistic update: UI re-renders instantly
    set({ favourites: nextFavourites });
    
    // ✅ Persist in background (errors logged but don't block UI)
    writeStorage({ favourites: nextFavourites }).catch(err => {
      console.error('[Store] Failed to persist favourites:', err);
    });
  },

  isFavourite: (hymnNumber, countryCode, languageCode) => {
    return get().favourites.some(
      f => f.hymnNumber === hymnNumber && 
           f.countryCode === countryCode && 
           f.languageCode === languageCode
    );
  },

  removeFavourite: async (hymnNumber, countryCode, languageCode) => {
    const current = get();
    const nextFavourites = current.favourites.filter(f => !(
      f.hymnNumber === hymnNumber && 
      f.countryCode === countryCode && 
      f.languageCode === languageCode
    ));
    
    // ✅ Optimistic update
    set({ favourites: nextFavourites });
    
    // ✅ Persist in background
    writeStorage({ favourites: nextFavourites }).catch(err => {
      console.error('[Store] Failed to persist favourites:', err);
    });
  },

  addRecentHymn: async (hymnNumber: number) => {
    const current = get();
    const filtered = current.recentHymns.filter((n) => n !== hymnNumber);
    const nextRecent = [hymnNumber, ...filtered].slice(0, 10);
    
    // ✅ Optimistic update for recent hymns too
    set({ recentHymns: nextRecent });
    
    writeStorage({ recentHymns: nextRecent }).catch(err => {
      console.error('[Store] Failed to persist recent hymns:', err);
    });
  },

  reset: async () => {
    await clearStorage();
    const defaults = await readStorage();
    set(defaults);
  },

  setLastUpdateDismissedVersion: (version) => set({ lastUpdateDismissedVersion: version }),
  setIsInitializing: (status) => set({ isInitializing: status }),

  getActiveCountryName: () => {
    const { country } = get().settings;
    return COUNTRY_LABELS[country] || 'Malawi';
  },

  getFontSizeStyle: () => {
    const { fontSize } = get().settings;
    return { fontSize };
  },

  getGroupedFavourites: () => {
    const { favourites } = get();
    return favourites.reduce((groups, entry) => {
      const key = `${entry.countryCode}-${entry.languageCode}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
      return groups;
    }, {} as Record<string, typeof favourites>);
  },
}));