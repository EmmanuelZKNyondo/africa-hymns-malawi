// src/utils/dateUtils.ts

/**
 * Parses a date string based on a known input format and returns a Date object.
 * Supports: yyyy, MM, dd, MMM, MMMM, yy, M, d
 */
const parseDate = (dateStr: string, inputFormat: string = 'yyyy-MM-dd'): Date | null => {
  if (!dateStr) return null;

  // Common separators: -, /, ., space
  const separatorRegex = /[-/.\s]+/;
  
  // Split format and date string by separators
  const formatParts = inputFormat.split(separatorRegex);
  const dateParts = dateStr.split(separatorRegex);

  if (formatParts.length !== dateParts.length) {
    console.warn(`[DateUtils] Format parts mismatch for "${dateStr}" with format "${inputFormat}"`);
    return null;
  }

  let year = 0;
  let month = 0; // 0-11
  let day = 0;

  const monthsMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  for (let i = 0; i < formatParts.length; i++) {
    const token = formatParts[i].toLowerCase();
    const value = dateParts[i];

    if (token.includes('yyyy')) {
      year = parseInt(value, 10);
    } else if (token.includes('yy')) {
      const shortYear = parseInt(value, 10);
      year = shortYear + (shortYear > 50 ? 1900 : 2000); // Simple pivot
    } else if (token.includes('mmmm') || token.includes('mmm')) {
      const monthIndex = monthsMap[value.toLowerCase()];
      if (monthIndex !== undefined) month = monthIndex;
      else return null;
    } else if (token.includes('mm')) {
      month = parseInt(value, 10) - 1;
    } else if (token.includes('dd')) {
      day = parseInt(value, 10);
    }
  }

  // Validate basic ranges
  if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
    return null;
  }

  const parsedDate = new Date(year, month, day);
  
  // Check if date is valid (e.g., Feb 30 would be invalid)
  if (parsedDate.getDate() !== day) {
    return null;
  }

  return parsedDate;
};

/**
 * Formats a date string or Date object into a custom format.
 * 
 * @param dateInput - The date string or Date object
 * @param outputFormat - The desired output format (e.g., "dd-MMM-yyyy")
 * @param inputFormat - (Optional) The format of the input string if it's not ISO/Standard. 
 *                      Defaults to 'yyyy-MM-dd' or tries auto-detection.
 * @param locale - The locale to use for month/day names (default: 'en-GB')
 * @returns The formatted date string, or null if invalid
 */
export const formatDate = (
  dateInput: string | Date | null | undefined,
  outputFormat: string = 'yyyy-MM-dd',
  inputFormat?: string,
  locale: string = 'en-GB'
): string | null => {
  if (!dateInput) return null;

  let dateObj: Date | null = null;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === 'string') {
    // 1. Try standard ISO parsing first (yyyy-MM-dd)
    const isoDate = new Date(dateInput);
    
    // If valid and looks like ISO worked (year is reasonable)
    if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 1900) {
       // Check if it was actually parsed correctly vs fallback to 1970/1969
       // A simple heuristic: if the string contains '-' and starts with 4 digits, it's likely ISO
       if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
         dateObj = isoDate;
       }
    }

    // 2. If ISO failed or wasn't applicable, use the provided inputFormat or guess
    if (!dateObj) {
      // Default guess if no inputFormat provided: dd-MM-yyyy or MM-dd-yyyy depending on locale?
      // For safety, we require inputFormat for non-ISO strings to be 100% accurate.
      // However, we can try a common fallback:
      const formatToUse = inputFormat || 'dd-MM-yyyy'; 
      dateObj = parseDate(dateInput, formatToUse);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    console.warn(`[DateUtils] Could not parse date: ${dateInput}`);
    return null;
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-12
  const day = dateObj.getDate();
  
  // Pre-calculate common parts
  const monthStrShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(dateObj);
  const monthStrLong = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dateObj);
  const dayStrShort = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dateObj);
  const dayStrLong = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dateObj);

  const pad = (num: number) => String(num).padStart(2, '0');

  const replacements: Record<string, string> = {
    'yyyy': String(year),
    'yy': String(year).slice(-2),
    'MMMM': monthStrLong,
    'MMM': monthStrShort,
    'MM': pad(month),
    'M': String(month),
    'dddd': dayStrLong,
    'ddd': dayStrShort,
    'dd': pad(day),
    'd': String(day),
  };

  // Sort keys by length (descending) to replace longer tokens first
  const sortedTokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

  let result = outputFormat;

  for (const token of sortedTokens) {
    const regex = new RegExp(token, 'g');
    result = result.replace(regex, replacements[token]);
  }

  return result;
};