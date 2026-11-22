import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "../globals.css";
import { ENABLED_LOCALES, getDir, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ENABLED_LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf2" },
    { media: "(prefers-color-scheme: dark)", color: "#151a1f" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name} — ${t.meta.tagline}`, template: `%s · ${SITE.name}` },
    description: t.meta.description,
    applicationName: SITE.name,
    openGraph: { siteName: SITE.name, locale: "es_ES", type: "website" },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const base = `/${locale}`;
  const nav = [
    { href: `${base}/tramites`, label: t.nav.tramites },
    { href: `${base}/calculadoras`, label: t.nav.calculadoras },
    { href: `${base}/glosario`, label: t.nav.glosario },
    { href: `${base}/ayuda`, label: t.nav.ayuda },
    { href: `${base}/estafas`, label: t.nav.estafas },
    { href: `${base}/novedades`, label: t.nav.novedades },
    { href: `${base}/buscar`, label: t.nav.buscar },
    { href: `${base}/asistente`, label: t.nav.asistente, cta: true },
  ];

  return (
    <html lang={locale} dir={getDir(locale)}>
      <body>
        <Header homeHref={base} items={nav} menuLabel={t.nav.menu} skipLabel={t.nav.skip} />
        <main id="contenido" tabIndex={-1}>
          <div className="container">{children}</div>
        </main>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
