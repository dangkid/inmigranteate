import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { documentosBusqueda } from "@/lib/buscador/documentos";
import { Buscador } from "@/components/Buscador";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMessages(locale).buscar.titulo, robots: { index: false, follow: true } };
}

export default async function BuscarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const docs = documentosBusqueda(locale);
  return (
    <>
      <h1>{t.buscar.titulo}</h1>
      <Suspense fallback={<p className="muted">…</p>}>
        <Buscador
          docs={docs}
          labels={{
            placeholder: t.buscar.placeholder,
            sinResultados: t.buscar.sinResultados,
            resultados: t.buscar.resultados,
            buscar: t.nav.buscar,
            tipos: t.buscar.tipos,
          }}
        />
      </Suspense>
    </>
  );
}
