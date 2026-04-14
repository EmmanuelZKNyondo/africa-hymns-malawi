// src/utils/prayersDataLoader.ts
import { loadCountryConfig } from './dataLoader';

/* ==================== TYPES ==================== */
export interface PrayerData {
  id: string;
  title: string;
  content: string[];
}

export interface PrayerMeta {
  id: string;
  title: string;
}


/* ==================== STATIC PRAYER MAP ==================== */
// Metro requires explicit paths. Map the relative path strings to requires.
const PRAYER_PATH_MAP: Record<string, PrayerData> = {
  // Apostles Creed
  'prayers/apostles-creed/mw/en.json': require('@/data/prayers/apostles-creed/mw/en.json'),
  'prayers/apostles-creed/mw/ch.json': require('@/data/prayers/apostles-creed/mw/ch.json'),
  
  // Lords Prayer
  'prayers/lords-prayer/mw/en.json': require('@/data/prayers/lords-prayer/mw/en.json'),
  'prayers/lords-prayer/mw/ch.json': require('@/data/prayers/lords-prayer/mw/ch.json'),
  
  // Add new prayers/countries here
};

/* ==================== CACHE LAYER ==================== */
const cache = new Map<string, PrayerData>();

function getCacheKey(prayerId: string, countryCode: string, languageCode: string): string {
  return `prayer:${prayerId}:${countryCode}:${languageCode}`;
}

function setCache(key: string,  data: PrayerData): void {
  cache.set(key, data);
}

function getCache(key: string): PrayerData | null {
  return cache.get(key) || null;
}

export function clearPrayerCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/* ==================== ASYNC LOADER ==================== */

/**
 * Load prayer content using static map lookup
 */
export async function loadPrayerData(
  prayerId: string, 
  countryCode: string, 
  languageCode: string
): Promise<PrayerData> {
  const cacheKey = getCacheKey(prayerId, countryCode, languageCode);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // 1. Load Country Config to get paths
    const countryConfig = await loadCountryConfig(countryCode);
    const prayerConfig = countryConfig.prayer_langs[prayerId];

    if (!prayerConfig) {
      // Fallback to MW if config missing for country
      if (countryCode !== 'mw') {
        return loadPrayerData(prayerId, 'mw', languageCode);
      }
      throw new Error(`Prayer "${prayerId}" not configured for country "${countryCode}"`);
    }

    // 2. Find the file for the requested language
    const langFileObj = prayerConfig.languages.find(l => l.code === languageCode);
    
    let finalFile = langFileObj?.file;
    
    // Fallback to English if language not found
    if (!finalFile) {
      console.warn(`[PrayerLoader] Language "${languageCode}" not found for "${prayerId}", falling back to EN`);
      const enFile = prayerConfig.languages.find(l => l.code === 'en');
      if (enFile) {
        finalFile = enFile.file;
      } else {
        throw new Error(`No English fallback found for prayer "${prayerId}"`);
      }
    }

    // 3. Construct Path Key: e.g., "prayers/apostles-creed/mw/en.json"
    const pathKey = `${prayerConfig.path}/${finalFile}`;
    
    // 4. Lookup in Static Map
    const data = PRAYER_PATH_MAP[pathKey];

    if (!data) {
      console.error(`[PrayerLoader] Path "${pathKey}" not found in PRAYER_PATH_MAP`);
      // Final fallback to MW/EN if everything else fails
      if (countryCode !== 'mw' || languageCode !== 'en') {
         return loadPrayerData(prayerId, 'mw', 'en');
      }
      throw new Error(`Could not load prayer "${prayerId}" at path ${pathKey}`);
    }
    
    setCache(cacheKey, data);
    return data;

  } catch (error) {
    console.error(`[PrayerLoader] Failed to load ${prayerId} for ${countryCode}/${languageCode}`, error);
    throw error;
  }
}


/**
 * NEW: Load Titles for all prayers in a country
 * Loads the default language (EN) for each prayer just to get the Title.
 */
export async function loadPrayerTitles(countryCode: string): Promise<PrayerMeta[]> {
  const config = await loadCountryConfig(countryCode);
  const prayerIds = Object.keys(config.prayer_langs);
  
  const titles = await Promise.all(
    prayerIds.map(async (id) => {
      try {
        // Try to load English first for the title
        const data = await loadPrayerData(id, countryCode, 'en');
        return { id: data.id, title: data.title };
      } catch (e) {
        // Fallback: use ID as title if load fails
        return { id, title: id.replace(/-/g, ' ').toUpperCase() };
      }
    })
  );

  return titles;
}


/**
 * Get list of available prayer IDs for a country
 */
export async function getAvailablePrayersForCountry(countryCode: string): Promise<string[]> {
  const config = await loadCountryConfig(countryCode);
  return Object.keys(config.prayer_langs);
}