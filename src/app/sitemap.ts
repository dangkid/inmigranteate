import type { MetadataRoute } from "next";
import { ENABLED_LOCALES } from "@/i18n/config";
import { getPaginaSlugs, getTramites } from "@/content/load";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  for (const locale of ENABLED_LOCALES) {
    const base = `${SITE.url}/${locale}`;
    for (const p of ["", "/tramites", "/asistente", "/calculadoras", "/glosario", "/novedades"]) {
      out.push({ url: `${base}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 });
    }
    for (const t of getTramites(locale)) {
      out.push({ url: `${base}/tramites/${t.slug}`, lastModified: t.ultima_verificacion, changeFrequency: "weekly", priority: 0.9 });
    }
    for (const s of getPaginaSlugs()) {
      out.push({ url: `${base}/${s}`, changeFrequency: "monthly", priority: 0.5 });
    }
  }
  return out;
}
