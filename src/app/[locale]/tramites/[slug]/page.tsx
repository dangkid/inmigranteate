import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENABLED_LOCALES, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getTramite, getTramiteSlugs, getTramites } from "@/content/load";
import { Ficha } from "@/components/Ficha";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ENABLED_LOCALES.flatMap((locale) => getTramiteSlugs().map((slug) => ({ locale, slug })));
}

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tr = getTramite(locale, slug);
  if (!tr) return {};
  return {
    title: tr.titulo,
    description: tr.resumen_en_una_frase,
    keywords: tr.palabras_clave,
    alternates: {
      canonical: `/${locale}/tramites/${slug}`,
      languages: Object.fromEntries(ENABLED_LOCALES.map((l) => [l, `/${l}/tramites/${slug}`])),
    },
    openGraph: { title: tr.titulo, description: tr.resumen_en_una_frase, type: "article", modifiedTime: tr.ultima_verificacion },
  };
}

export default async function TramitePage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const tr = getTramite(locale, slug);
  if (!tr) notFound();
  const t = getMessages(locale);
  const titulos = Object.fromEntries(getTramites(locale).map((x) => [x.slug, x.titulo]));

  const url = `${SITE.url}/${locale}/tramites/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: tr.titulo,
        description: tr.resumen_en_una_frase,
        inLanguage: locale,
        dateModified: tr.ultima_verificacion,
        isAccessibleForFree: true,
        citation: tr.fuentes.filter((f) => f.nivel === 1).map((f) => f.url),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: `${SITE.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: t.nav.tramites, item: `${SITE.url}/${locale}/tramites` },
          { "@type": "ListItem", position: 3, name: tr.titulo, item: url },
        ],
      },
      ...(tr.preguntas_frecuentes.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: tr.preguntas_frecuentes.map((f) => ({
                "@type": "Question",
                name: f.pregunta,
                acceptedAnswer: { "@type": "Answer", text: f.respuesta },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Ficha tramite={tr} locale={locale} t={t} titulosRelacionados={titulos} />
    </>
  );
}
