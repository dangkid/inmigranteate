import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getNovedades, getTramites } from "@/content/load";
import { CATEGORIAS } from "@/content/schema";
import { Disclaimer } from "@/components/Disclaimer";
import { formatFecha } from "@/lib/formato";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const tramites = getTramites(locale);
  const novedades = getNovedades(locale).slice(0, 3);
  const porCategoria = new Map(CATEGORIAS.map((c) => [c, tramites.filter((x) => x.categoria === c).length]));

  return (
    <>
      <section className="hero">
        <h1>{t.home.titulo}</h1>
        <p>{t.home.intro}</p>
        <div className="btn-row">
          <Link className="btn" href={`/${locale}/asistente`}>
            {t.home.ctaAsistente} →
          </Link>
          <Link className="btn btn-secondary" href={`/${locale}/tramites`}>
            {t.home.ctaTramites}
          </Link>
        </div>
        <form className="search-form readable" action={`/${locale}/buscar`} role="search">
          <label htmlFor="home-q" className="visually-hidden">
            {t.home.buscarPlaceholder}
          </label>
          <input id="home-q" name="q" type="search" placeholder={t.home.buscarPlaceholder} />
          <button className="btn" type="submit">
            {t.nav.buscar}
          </button>
        </form>
      </section>

      <Disclaimer locale={locale} t={t} />

      <div className="notice notice-warn">
        <p>
          <strong>La regularización extraordinaria de 2026 ya está cerrada</strong> (el plazo terminó el 30 de junio de 2026). Si
          alguien te ofrece «plazas» para una nueva regularización, es una estafa.{" "}
          <Link href={`/${locale}/tramites/despues-regularizacion-2026`}>Si ya la pediste, mira qué hacer ahora →</Link>
        </p>
      </div>

      <h2>{t.home.categorias}</h2>
      <div className="grid">
        {CATEGORIAS.map((c) => (
          <Link key={c} href={`/${locale}/tramites#${c}`} className="card-link">
            <div className="card">
              <h3>{t.categorias[c]}</h3>
              <p className="small muted" style={{ margin: 0 }}>
                {porCategoria.get(c) ? `${porCategoria.get(c)} guías` : t.common.enPreparacion}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <h2>{t.home.herramientas}</h2>
      <div className="grid">
        <Link href={`/${locale}/asistente`} className="card-link">
          <div className="card">
            <h3>🧭 {t.nav.asistente}</h3>
            <p className="small muted">Unas pocas preguntas y te decimos por dónde empezar.</p>
          </div>
        </Link>
        <Link href={`/${locale}/calculadoras`} className="card-link">
          <div className="card">
            <h3>📅 {t.nav.calculadoras}</h3>
            <p className="small muted">Arraigo, renovación, plazos de recurso, TIE y nacionalidad.</p>
          </div>
        </Link>
        <Link href={`/${locale}/glosario`} className="card-link">
          <div className="card">
            <h3>📖 {t.nav.glosario}</h3>
            <p className="small muted">NIE, TIE, apostilla, silencio administrativo… explicado fácil.</p>
          </div>
        </Link>
        <Link href={`/${locale}/estafas`} className="card-link">
          <div className="card">
            <h3>🚨 {t.nav.estafas}</h3>
            <p className="small muted">Falsos gestores, venta de citas y contratos falsos.</p>
          </div>
        </Link>
      </div>

      {novedades.length > 0 && (
        <>
          <h2>{t.home.novedades}</h2>
          <ul>
            {novedades.map((n) => (
              <li key={n.slug}>
                <Link href={`/${locale}/novedades#${n.slug}`}>{n.titulo}</Link>{" "}
                <span className="small muted">({formatFecha(n.fecha, locale)})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
