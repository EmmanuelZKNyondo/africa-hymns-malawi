// src/utils/prayersDataLoader.ts

export type PrayerContent = {
  id: string;
  title: Record<string, string>;
  content: Record<string, string[]>; // ✅ Changed to array of strings
};

export type PrayerMeta = {
  id: string;
  icon: string;
};

export const PRAYER_LIST: PrayerMeta[] = [
  { id: 'apostles-creed', icon: 'book-outline' },
  { id: 'lords-prayer', icon: 'heart-outline' },
];

export const loadPrayerData = async (countryCode: string, prayerId: string): Promise<PrayerContent> => {
  try {
    let data: any = null;

    if (countryCode === 'mw') {
      if (prayerId === 'apostles-creed') {
        data = require('@/data/prayers/mw/apostles-creed.json');
      } else if (prayerId === 'lords-prayer') {
        data = require('@/data/prayers/mw/lords-prayer.json');
      }
    }
    
    if (!data) {
       throw new Error('Prayer not found for this country');
    }

    return data as PrayerContent;
  } catch (error) {
    console.error('[PrayersDataLoader] Failed to load prayer:', error);
    throw error;
  }
};