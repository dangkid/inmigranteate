/**
 * Idiomas del proyecto. Solo los `enabled` generan páginas. Para activar uno nuevo:
 * 1) crea src/i18n/messages/<code>.ts con la misma forma que es.ts,
 * 2) regístralo en src/i18n/messages/index.ts,
 * 3) añade traducciones revisadas en content/i18n/<code>/...,
 * 4) pon enabled: true.
 */
export const LOCALES = [
  { code: "es", name: "Español", dir: "ltr", enabled: true },
  { code: "en", name: "English", dir: "ltr", enabled: false },
  { code: "fr", name: "Français", dir: "ltr", enabled: false },
  { code: "ar", name: "العربية", dir: "rtl", enabled: false },
  { code: "pt", name: "Português", dir: "ltr", enabled: false },
  { code: "ro", name: "Română", dir: "ltr", enabled: false },
  { code: "uk", name: "Українська", dir: "ltr", enabled: false },
  { code: "ru", name: "Русский", dir: "ltr", enabled: false },
  { code: "zh", name: "中文", dir: "ltr", enabled: false },
  { code: "ur", name: "اردو", dir: "rtl", enabled: false },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "es";

export const ENABLED_LOCALES: Locale[] = LOCALES.filter((l) => l.enabled).map((l) => l.code);

export function isLocale(value: string): value is Locale {
  return ENABLED_LOCALES.includes(value as Locale);
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
}

/** Locale BCP 47 para formatear fechas. */
export function dateLocale(locale: Locale): string {
  return locale === "es" ? "es-ES" : locale;
}
