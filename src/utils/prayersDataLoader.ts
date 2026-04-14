// src/utils/prayersDataLoader.ts

/* ==================== TYPES ==================== */
export interface PrayerData {
  id: string;
  title: string;
  content: string[];
}

/* ==================== STATIC REGISTRY ==================== */
// Structure: PrayerID -> CountryCode -> LanguageCode -> Data
const PRAYER_REGISTRY: Record<string, Record<string, Record<string, PrayerData>>> = {
  'apostles-creed': {
    mw: {
      en: require('../data/prayers/apostles_creed/mw/en.json'),
      ch: require('../data/prayers/apostles_creed/mw/ch.json'),
    },
    //Add other countries'
  },
  'lords-prayer': {
    mw: {
      en: require('../data/prayers/lords_prayer/mw/en.json'),
      ch: require('../data/prayers/lords_prayer/mw/ch.json'),
    },
    //Add other countries'
  },
};

/* ==================== CACHE LAYER ==================== */
const cache = new Map<string, PrayerData>();

function getCacheKey(prayerId: string, countryCode: string, languageCode: string): string {
  return `prayer:${prayerId}:${countryCode}:${languageCode}`;
}

function setCache(key: string, data: PrayerData): void {
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
 * Load prayer content based on Prayer ID, Country, and Language.
 * Includes fallback logic:
 * 1. Try exact match (Country + Language)
 * 2. Try Country + English (en)
 * 3. Try Malawi (mw) + Language
 * 4. Try Malawi (mw) + English (en)
 */
export async function loadPrayerData(
  prayerId: string, 
  countryCode: string, 
  languageCode: string
): Promise<PrayerData> {
  const cacheKey = getCacheKey(prayerId, countryCode, languageCode);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Helper to find data with fallbacks
  const findData = (): PrayerData | null => {
    const prayerEntry = PRAYER_REGISTRY[prayerId];
    if (!prayerEntry) return null;

    // 1. Exact Match
    if (prayerEntry[countryCode]?.[languageCode]) {
      return prayerEntry[countryCode][languageCode];
    }

    // 2. Same Country, Fallback to English
    if (prayerEntry[countryCode]?.['en']) {
      console.warn(`[PrayerLoader] Language "${languageCode}" not found for "${prayerId}" in "${countryCode}", falling back to EN`);
      return prayerEntry[countryCode]['en'];
    }

    // 3. Fallback to Malawi (mw), Requested Language
    if (prayerEntry['mw']?.[languageCode]) {
      console.warn(`[PrayerLoader] Country "${countryCode}" not found for "${prayerId}", falling back to MW (${languageCode})`);
      return prayerEntry['mw'][languageCode];
    }

    // 4. Fallback to Malawi (mw), English
    if (prayerEntry['mw']?.['en']) {
      console.warn(`[PrayerLoader] Falling back to MW/EN for "${prayerId}"`);
      return prayerEntry['mw']['en'];
    }

    return null;
  };

  const data = findData();

  if (!data) {
    throw new Error(`Prayer "${prayerId}" not found for country "${countryCode}" and language "${languageCode}"`);
  }

  setCache(cacheKey, data);
  return data;
}

/**
 * Get list of available prayer IDs
 */
export function getAvailablePrayers(): string[] {
  return Object.keys(PRAYER_REGISTRY);
}

/**
 * Check if a prayer exists for a specific country/language
 */
export function hasPrayer(prayerId: string, countryCode: string, languageCode: string): boolean {
  return !!PRAYER_REGISTRY[prayerId]?.[countryCode]?.[languageCode];
}