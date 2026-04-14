// src/utils/dataLoader.ts

/* ==================== TYPES ==================== */
export interface LanguageConfig {
  code: string;
  name: string;
  hymnFile: string;
  icon: string;
  description: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  languages: LanguageConfig[];
  prayers: {
    creed: string;
    lordsPrayer: string;
  };
  metadata: {
    lastUpdated: string;
    version: string;
    hymnCount: number;
  };
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

/* ==================== STATIC REGISTRY ==================== */
const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  mw: require('../data/countries/mw.json'),
};

const HYMN_REGISTRY: Record<string, Record<string, HymnData>> = {
  mw: {
    en: require('../data/hymns/mw/en.json'),
    ch: require('../data/hymns/mw/ch.json'),
  },
};

/* ==================== CACHE LAYER ==================== */
const cache = new Map<string, any>();

function getCacheKey(type: 'country' | 'hymns', code: string, lang?: string): string {
  return lang ? `${type}:${code}:${lang}` : `${type}:${code}`;
}

function setCache<T>(key: string, data: T): void {
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

/**
 * Load country config from static registry with caching
 */
export async function loadCountryConfig(countryCode: string): Promise<CountryConfig> {
  const cacheKey = getCacheKey('country', countryCode);
  const cached = getCache<CountryConfig>(cacheKey);
  if (cached) return cached;

  const config = COUNTRY_REGISTRY[countryCode];
  
  if (!config) {
    console.warn(`[DataLoader] Country "${countryCode}" not found in registry, falling back to Malawi`);
    const fallback = COUNTRY_REGISTRY.mw;
    setCache(cacheKey, fallback);
    return fallback;
  }

  setCache(cacheKey, config);
  return config;
}

/**
 * Load hymn data from static registry with caching
 */
export async function loadHymnData(countryCode: string, languageCode: string): Promise<HymnData> {
  const cacheKey = getCacheKey('hymns', countryCode, languageCode);
  const cached = getCache<HymnData>(cacheKey);
  if (cached) return cached;

  const countryHymns = HYMN_REGISTRY[countryCode];
  
  if (!countryHymns) {
    throw new Error(`Country "${countryCode}" not found in hymn registry`);
  }

  const data = countryHymns[languageCode];
  
  if (!data) {
    throw new Error(`Language "${languageCode}" not found for country "${countryCode}"`);
  }

  setCache(cacheKey, data);
  return data;
}

/* ==================== UTILITIES ==================== */

/**
 * Search hymns by keyword (title, verses, chorus, tags)
 */
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

/**
 * Filter hymns by number range
 */
export function filterHymnsByNumber(hymns: Hymn[], min: number, max: number): Hymn[] {
  return hymns.filter((h) => h.number >= min && h.number <= max);
}

/**
 * Get hymn by number (O(1) lookup)
 */
export function getHymnByNumber(hymns: Hymn[], number: number): Hymn | undefined {
  return hymns.find((h) => h.number === number);
}

/* ==================== REGISTRY HELPERS ==================== */

export function registerCountryConfig(code: string, config: CountryConfig): void {
  COUNTRY_REGISTRY[code] = config;
  clearCache(getCacheKey('country', code));
}

export function registerHymnData(countryCode: string, languageCode: string, data: HymnData): void {
  if (!HYMN_REGISTRY[countryCode]) {
    HYMN_REGISTRY[countryCode] = {};
  }
  HYMN_REGISTRY[countryCode][languageCode] = data;
  clearCache(getCacheKey('hymns', countryCode, languageCode));
}

export function getAvailableCountries(): string[] {
  return Object.keys(COUNTRY_REGISTRY);
}

export function getAvailableLanguages(countryCode: string): string[] {
  return Object.keys(HYMN_REGISTRY[countryCode] || {});
}