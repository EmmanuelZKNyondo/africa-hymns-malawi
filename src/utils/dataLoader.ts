// src/utils/dataLoader.ts

/* ==================== TYPES ==================== */
export interface HymnLangConfig {
  code: string;
  name: string;
  path: string; // e.g., "hymns/mw/en.json" - Used as a key
  icon: string;
  description: string;
  meta: {
    lastUpdated: string;
    version: string;
    hymnCount: number;
  };
}

export interface PrayerLangConfig {
  id: string;
  path: string; // Base path e.g., "prayers/apostles-creed/mw"
  meta: {
    lastUpdated: string;
    version: string;
  };
  languages: { code: string; file: string }[];
}

export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  hymn_langs: HymnLangConfig[];
  prayer_langs: Record<string, PrayerLangConfig>;
}

export interface Verse {
  number: number | string;
  lines: string[];
}

export interface Chorus {
  lines: string[];
}

export interface HymnContent {
  verses: Verse[];
  chorus: Chorus | null;
}

export interface Hymn {
  number: number;
  previous_version_number: number | null;
  title: string;
  writer: string;
  rating: number;
  tags: string[];
  crossReference?: CrossReference[];
  content: HymnContent;
}

export interface HymnData {
  country: string;
  language: string;
  version: string;
  hymns: Hymn[];
}

export interface CrossReference {
  countryCode: string;
  languageCode: string;
  hymnNumber: number;
}


export interface FavouriteEntry {
  hymnNumber: number;
  countryCode: string;
  languageCode: string;
  addedAt?: string;
}


/* ==================== STATIC REGISTRY ==================== */
const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  mw: require('../data/countries/mw.json'),
};

// ✅ STATIC HYMN MAP: Metro requires explicit paths. 
// We map the "path" string from JSON to the actual required module.
const HYMN_PATH_MAP: Record<string, HymnData> = {
  'hymns/mw/en.json': require('../data/hymns/mw/en.json'),
  'hymns/mw/ch.json': require('../data/hymns/mw/ch.json'),
  'hymns/mw/cs.json': require('../data/hymns/mw/cs.json'),
  // Add new countries/languages here as you add them to JSON
  // 'hymns/zm/en.json': require('../data/hymns/zm/en.json'),
};

/* ==================== CACHE LAYER ==================== */
const cache = new Map<string, any>();

function getCacheKey(type: 'country' | 'hymns', code: string, lang?: string): string {
  return lang ? `${type}:${code}:${lang}` : `${type}:${code}`;
}

function setCache<T>(key: string,  data:T): void {
  cache.set(key, data);
}

function getCache<T>(key: string): T | null {
  return cache.get(key) as T | null;
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/* ==================== ASYNC LOADERS ==================== */

export async function loadCountryConfig(countryCode: string): Promise<CountryConfig> {
  const cacheKey = getCacheKey('country', countryCode);
  const cached = getCache<CountryConfig>(cacheKey);
  if (cached) return cached;

  const config = COUNTRY_REGISTRY[countryCode];
  
  if (!config) {
    console.warn(`[DataLoader] Country "${countryCode}" not found, falling back to Malawi`);
    const fallback = COUNTRY_REGISTRY.mw;
    setCache(cacheKey, fallback);
    return fallback;
  }

  setCache(cacheKey, config);
  return config;
}

/**
 * Load hymn data using static map lookup
 */
export async function loadHymnData(countryCode: string, languageCode: string): Promise<HymnData> {
  const cacheKey = getCacheKey('hymns', countryCode, languageCode);
  const cached = getCache<HymnData>(cacheKey);
  if (cached) return cached;

  const config = await loadCountryConfig(countryCode);
  const langConfig = config.hymn_langs.find(l => l.code === languageCode);

  if (!langConfig) {
    throw new Error(`Language "${languageCode}" not found for country "${countryCode}"`);
  }

  // ✅ Lookup in static map instead of dynamic require
  const data = HYMN_PATH_MAP[langConfig.path];

  if (!data) {
    console.error(`[DataLoader] Path "${langConfig.path}" defined in config but not found in HYMN_PATH_MAP`);
    throw new Error(`Failed to load hymn data for ${languageCode}. Check HYMN_PATH_MAP in dataLoader.ts`);
  }

  setCache(cacheKey, data);
  return data;
}

/* ==================== UTILITIES ==================== */

export function searchHymns(hymns: Hymn[], query: string): Hymn[] {
  if (!query.trim()) return hymns;
  
  const lowerQuery = query.toLowerCase();
  return hymns.filter((hymn) => {
    const baseFields = [
      hymn.number.toString(),
      hymn.title,
      hymn.writer,
      ...hymn.tags,
      ...(hymn.crossReference?.map((cr) => 
        `${cr.countryCode}-${cr.languageCode}-${cr.hymnNumber}`
      ) || []),
    ].join(' ').toLowerCase();
    
    const verseText = hymn.content.verses
      .flatMap((v) => v.lines)
      .join(' ')
      .toLowerCase();
    
    const chorusText = hymn.content.chorus
      ? hymn.content.chorus.lines.join(' ').toLowerCase()
      : '';
    
    return `${baseFields} ${verseText} ${chorusText}`.includes(lowerQuery);
  });
}

export function getAvailableCountries(): string[] {
  return Object.keys(COUNTRY_REGISTRY);
}

export function getHymnLanguages(countryCode: string): HymnLangConfig[] {
  const config = COUNTRY_REGISTRY[countryCode] || COUNTRY_REGISTRY.mw;
  return config.hymn_langs;
}