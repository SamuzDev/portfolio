import en from '@/i18n/en.json';

export type Translations = typeof en;

export function getTranslations(): typeof en {
  return en;
}

export const defaultLocale = 'en';