import type { Locale } from "../config";
import es, { type Messages } from "./es";

const MESSAGES: Partial<Record<Locale, Messages>> = { es };

/** Devuelve los textos del idioma; si faltan, usa español. */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? es;
}

export type { Messages };
