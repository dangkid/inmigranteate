import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { Calculadoras } from "@/components/Calculadoras";
import { Disclaimer } from "@/components/Disclaimer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return { title: t.calc.titulo, description: t.calc.intro, alternates: { canonical: `/${locale}/calculadoras` } };
}

export default async function CalculadorasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  return (
    <>
      <h1>{t.calc.titulo}</h1>
      <p className="readable">{t.calc.intro} Las fechas que escribes no salen de tu navegador.</p>
      <Disclaimer locale={locale} t={t} ultimaVerificacion="2026-11-21" />
      <Calculadoras />
    </>
  );
}
