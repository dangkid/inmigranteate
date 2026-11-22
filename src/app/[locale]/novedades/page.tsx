import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getNovedades, getTramites } from "@/content/load";
import { formatFecha } from "@/lib/formato";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return { title: t.novedades.titulo, description: t.novedades.intro, alternates: { canonical: `/${locale}/novedades` } };
}

export default async function NovedadesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const titulos = new Map(getTramites(locale).map((x) => [x.slug, x.titulo]));
  return (
    <div className="readable">
      <h1>{t.novedades.titulo}</h1>
      <p>{t.novedades.intro}</p>
      {getNovedades(locale).map((n) => (
        <article key={n.slug} id={n.slug} className="card section" style={{ marginBlock: "1rem" }}>
          <p className="small muted" style={{ margin: 0 }}>
            <time dateTime={n.fecha}>{formatFecha(n.fecha, locale)}</time>
          </p>
          <h2 style={{ marginTop: "0.3rem" }}>{n.titulo}</h2>
          <p>
            <strong>{n.resumen}</strong>
          </p>
          <div className="prose" dangerouslySetInnerHTML={{ __html: n.cuerpoHtml }} />
          {n.afecta.length > 0 && (
            <p className="small">
              {t.novedades.afecta}:{" "}
              {n.afecta.map((s, i) => (
                <span key={s}>
                  {i > 0 && ", "}
                  <Link href={`/${locale}/tramites/${s}`}>{titulos.get(s)}</Link>
                </span>
              ))}
            </p>
          )}
          <p className="small">
            {t.tramite.fuentes}:{" "}
            {n.fuentes.map((f, i) => (
              <span key={f.url}>
                {i > 0 && " · "}
                <a href={f.url} target="_blank" rel="noopener">
                  {f.titulo}
                </a>
              </span>
            ))}
          </p>
        </article>
      ))}
    </div>
  );
}
