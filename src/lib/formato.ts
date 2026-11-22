import { dateLocale, type Locale } from "@/i18n/config";

/** 2026-11-21 → "21 de noviembre de 2026" */
export function formatFecha(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function diasDesde(iso: string, hoy = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor((hoy.getTime() - Date.UTC(y, m - 1, d)) / 86_400_000);
}

/** Cambia el prefijo de idioma de una ruta interna escrita en español ("/es/..."). */
export function localizarRuta(url: string, locale: Locale): string {
  return url.startsWith("/es/") ? `/${locale}/${url.slice(4)}` : url;
}
