import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getTramites } from "@/content/load";
import { CATEGORIAS } from "@/content/schema";
import { Disclaimer } from "@/components/Disclaimer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMessages(locale).nav.tramites, alternates: { canonical: `/${locale}/tramites` } };
}

export default async function TramitesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const tramites = getTramites(locale);

  return (
    <>
      <h1>{t.nav.tramites}</h1>
      <p className="readable">
        Cada guía explica para quién es, requisitos, documentos, pasos, tasas, plazos y qué hacer si te lo deniegan, con enlace a la
        fuente oficial de cada dato. ¿No sabes cuál es la tuya? <Link href={`/${locale}/asistente`}>Usa el asistente</Link>.
      </p>
      <Disclaimer locale={locale} t={t} />
      {CATEGORIAS.map((c) => {
        const lista = tramites.filter((x) => x.categoria === c);
        return (
          <section key={c} id={c} className="section">
            <h2>{t.categorias[c]}</h2>
            {lista.length === 0 ? (
              <p className="muted">{t.common.enPreparacion}.</p>
            ) : (
              <div className="grid">
                {lista.map((x) => (
                  <Link key={x.slug} href={`/${locale}/tramites/${x.slug}`} className="card-link">
                    <div className="card">
                      <h3>{x.titulo}</h3>
                      <p className="small muted">{x.resumen_en_una_frase}</p>
                      {x.estado === "borrador" && <span className="badge badge-warn">En revisión</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
