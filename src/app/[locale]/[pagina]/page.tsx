import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENABLED_LOCALES, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getPagina, getPaginaSlugs } from "@/content/load";
import { Disclaimer } from "@/components/Disclaimer";

/** Páginas editoriales en content/paginas/*.md (estafas, ayuda, sobre, privacidad, aviso-legal). */
export const dynamicParams = false;

export function generateStaticParams() {
  return ENABLED_LOCALES.flatMap((locale) => getPaginaSlugs().map((pagina) => ({ locale, pagina })));
}

type Params = { params: Promise<{ locale: string; pagina: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, pagina } = await params;
  if (!isLocale(locale)) return {};
  const p = getPagina(locale, pagina);
  if (!p) return {};
  return { title: p.titulo, description: p.descripcion, alternates: { canonical: `/${locale}/${pagina}` } };
}

export default async function PaginaPage({ params }: Params) {
  const { locale, pagina } = await params;
  if (!isLocale(locale)) notFound();
  const p = getPagina(locale, pagina);
  if (!p) notFound();
  const t = getMessages(locale);
  return (
    <div className="readable">
      <h1>{p.titulo}</h1>
      {p.ultima_verificacion && <Disclaimer locale={locale} t={t} ultimaVerificacion={p.ultima_verificacion} />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: p.cuerpoHtml }} />
    </div>
  );
}
