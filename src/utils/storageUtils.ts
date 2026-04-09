import AsyncStorage from "@react-native-async-storage/async-storage";

/* INterfaces */
export interface AppStorageData {
  acceptedTerms: boolean;
  settings: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    accentColor: string; 
    defaultLanguage: 'en' | 'ch' | 'es' | 'fr' | 'de' | 'zh';
  };
  favourties: string[] | number[];
  lastSync: string | null;
  hymnCacheVersion: string | null;
};

/* Constants */
const STORAGE_KEY = "africa-hymns-malawi";

const DEFAULT_DATA: AppStorageData = {
  acceptedTerms: false,
  settings: {
    theme: 'system',
    fontSize: 16,
    accentColor: '#007AFF',
    defaultLanguage: 'en'
  },
  favourties: [],
  lastSync: null,
  hymnCacheVersion: null
};

/**
 * Read single storage obj - merges keys with defaults
 */
export async function readStorage(): Promise<AppStorageData> {
  try{
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if(!raw) return {...DEFAULT_DATA};

    const parsed = JSON.parse(raw) as Partial<AppStorageData>;

    return { 
      ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
    };
  } catch(error){
    console.error('[App Storage Error] Read failed, returning defaults: ', error);
    return {...DEFAULT_DATA};
  }
}

/**
 * updates single storage oblect
 * Returns full object for quick state sync
 */
export async function writeStorage(updates: Partial<AppStorageData>): Promise<AppStorageData> {
  try{
    const current = await readStorage();

    const next: AppStorageData = {
      ...current,
      ...updates,
      settings: updates.settings ? { ...current.settings, ...updates.settings } : current.settings
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next; 
  } catch(error){
    console.error('[App Storage Error] Write failed, returning current state: ', error);
    return await readStorage(); // fallback to current state
  }
}

/**
 * Clears entire app storaye (for otest flows/testing)
 */
export async function clearStorage(): Promise<void> {
  try{
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(error){
    console.error('[App Storage Error] Clean failed: ', error);
  }
}