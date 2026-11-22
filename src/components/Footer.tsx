import Link from "next/link";
import { LOCALES, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

export function Footer({ locale, t }: { locale: Locale; t: Messages }) {
  const enPreparacion = LOCALES.filter((l) => !l.enabled);
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-brand">Inmigranteate</p>
        <p style={{ maxWidth: "40rem" }}>
          {t.meta.tagline}. <strong>{t.disclaimer.titulo}</strong> Proyecto abierto, gratuito y sin ánimo de lucro.
          No gestionamos citas ni cobramos por ningún trámite.
        </p>
        <nav aria-label="Pie de página">
          <ul>
            <li><Link href={`/${locale}/tramites`}>{t.nav.tramites}</Link></li>
            <li><Link href={`/${locale}/ayuda`}>{t.nav.ayuda}</Link></li>
            <li><Link href={`/${locale}/estafas`}>{t.nav.estafas}</Link></li>
            <li><Link href={`/${locale}/novedades`}>{t.nav.novedades}</Link></li>
            <li><Link href={`/${locale}/reportar`}>{t.nav.reportar}</Link></li>
            <li><Link href={`/${locale}/sobre`}>{t.nav.sobre}</Link></li>
            <li><Link href={`/${locale}/privacidad`}>{t.nav.privacidad}</Link></li>
            <li><Link href={`/${locale}/aviso-legal`}>{t.nav.avisoLegal}</Link></li>
          </ul>
        </nav>
        <p className="small">
          {t.nav.idioma}: <strong>Español</strong>
          {" · "}
          {t.nav.proximamente}:{" "}
          {enPreparacion.map((l, i) => (
            <span key={l.code} lang={l.code} dir={l.dir}>
              {l.name}
              {i < enPreparacion.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
        <p className="small">Sin registro, sin cookies de seguimiento y sin guardar tus datos.</p>
      </div>
    </footer>
  );
}
