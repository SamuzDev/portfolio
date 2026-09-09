import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

export type Locale = 'en' | 'es';
export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, es };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/es')) return 'es';
  return 'en';
}

export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  const currentLocale = getLocaleFromPath(pathname);
  if (currentLocale === targetLocale) return pathname;

  if (currentLocale === 'en') {
    return pathname === '/' ? `/${targetLocale}/` : `/${targetLocale}${pathname}`;
  }

  const withoutLocale = pathname.replace(/^\/es/, '') || '/';
  return targetLocale === 'en' ? withoutLocale : `/${targetLocale}${withoutLocale}`;
}

export const locales: Locale[] = ['en', 'es'];
export const defaultLocale: Locale = 'en';
