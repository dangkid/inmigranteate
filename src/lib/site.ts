/**
 * Configuración global del sitio. Los valores se pueden sobrescribir con
 * variables de entorno en el momento del build (ver README).
 */
export const SITE = {
  name: "Inmigranteate",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Correo al que llegan los reportes de información desactualizada (opcional). */
  reportEmail: process.env.NEXT_PUBLIC_REPORT_EMAIL ?? "",
  /** Repositorio público (opcional). Si existe, los reportes se abren como issue. */
  repoUrl: (process.env.NEXT_PUBLIC_REPO_URL ?? "").replace(/\/$/, ""),
} as const;

/** Días tras los que una ficha se considera "pendiente de revisión periódica". */
export const DIAS_REVISION = 90;
