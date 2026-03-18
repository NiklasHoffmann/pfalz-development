import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

type Locale = 'de' | 'en' | 'pfl';

const locales = {
  de: de,
  en: enUS,
  pfl: de,
};

function getLocale(locale: Locale = 'en') {
  return locales[locale] || locales.en;
}

/**
 * Format date to specific format
 * @example formatDate('2024-01-15', 'dd.MM.yyyy', 'de') => '15.01.2024'
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = 'PP',
  locale: Locale = 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, formatStr, { locale: getLocale(locale) });
}

/**
 * Format date to relative time (e.g., '2 hours ago')
 * @example formatRelativeTime('2024-01-15T10:00:00Z') => '2 hours ago'
 */
export function formatRelativeTime(
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale: Locale = 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatDistance(dateObj, baseDate, {
    addSuffix: true,
    locale: getLocale(locale),
  });
}

/**
 * Format date relative to today (e.g., 'today at 10:30 AM', 'yesterday at 5:00 PM')
 * @example formatRelativeDate('2024-01-15T10:00:00Z') => 'today at 10:30 AM'
 */
export function formatRelativeDate(
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale: Locale = 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatRelative(dateObj, baseDate, { locale: getLocale(locale) });
}

/**
 * Common date format presets
 */
export const dateFormats = {
  full: 'PPPP', // Monday, January 1st, 2024
  long: 'PPP', // January 1st, 2024
  medium: 'PP', // Jan 1, 2024
  short: 'P', // 01/01/2024
  time: 'p', // 10:30 AM
  dateTime: 'Pp', // Jan 1, 2024, 10:30 AM
  iso: "yyyy-MM-dd'T'HH:mm:ss", // 2024-01-01T10:30:00
};

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Format number with locale-specific formatting
 * @example formatNumber(1234567.89, 'de') => '1.234.567,89'
 */
export function formatNumber(
  value: number,
  locale: Locale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const intlLocale = locale === 'en' ? 'en-US' : 'de-DE';
  return new Intl.NumberFormat(intlLocale, options).format(value);
}

/**
 * Format currency with locale-specific formatting
 * @example formatCurrency(1234.56, 'EUR', 'de') => '1.234,56 €'
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: Locale = 'en'
): string {
  const intlLocale = locale === 'en' ? 'en-US' : 'de-DE';

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format percentage
 * @example formatPercent(0.1234) => '12.34%'
 */
export function formatPercent(
  value: number,
  locale: Locale = 'en',
  decimals: number = 2
): string {
  const intlLocale = locale === 'en' ? 'en-US' : 'de-DE';

  return new Intl.NumberFormat(intlLocale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format file size
 * @example formatFileSize(1536) => '1.5 KB'
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compact large numbers
 * @example formatCompactNumber(1234567) => '1.2M'
 */
export function formatCompactNumber(
  value: number,
  locale: Locale = 'en'
): string {
  const intlLocale = locale === 'en' ? 'en-US' : 'de-DE';

  return new Intl.NumberFormat(intlLocale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}
