import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getTramites } from "@/content/load";
import { Asistente } from "@/components/Asistente";
import { Disclaimer } from "@/components/Disclaimer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return { title: t.asistente.titulo, description: t.asistente.intro, alternates: { canonical: `/${locale}/asistente` } };
}

export default async function AsistentePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const titulos = Object.fromEntries(getTramites(locale).map((x) => [x.slug, x.titulo]));
  return (
    <>
      <h1>{t.asistente.titulo}</h1>
      <p className="readable">{t.asistente.intro}</p>
      <Asistente
        locale={locale}
        titulos={titulos}
        t={{ ...t.asistente, atras: t.common.atras, reiniciar: t.common.reiniciar, enPreparacion: t.common.enPreparacion, verTramite: t.common.verTramite }}
      />
      <Disclaimer locale={locale} t={t} />
    </>
  );
}
