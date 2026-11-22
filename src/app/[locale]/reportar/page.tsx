import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { ReportForm } from "@/components/ReportForm";
import { SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMessages(locale).reportar.titulo, robots: { index: false, follow: true } };
}

export default async function ReportarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  return (
    <>
      <h1>{t.reportar.titulo}</h1>
      <p className="readable">
        Las normas cambian y podemos equivocarnos. Si ves un dato desactualizado o incorrecto, cuéntanoslo. Nos ayuda mucho que
        indiques la fuente oficial (BOE, Ministerio, sede electrónica) donde aparece el dato correcto.
      </p>
      <Suspense fallback={null}>
        <ReportForm email={SITE.reportEmail} repoUrl={SITE.repoUrl} />
      </Suspense>
    </>
  );
}
