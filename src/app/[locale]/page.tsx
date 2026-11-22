import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getNovedades, getTramites } from "@/content/load";
import { CATEGORIAS } from "@/content/schema";
import { Disclaimer } from "@/components/Disclaimer";
import { Icon, ICONO_CATEGORIA } from "@/components/Icon";
import { formatFecha } from "@/lib/formato";

/** Guías que se muestran en el panel de la portada, si existen. */
const DESTACADAS = [
  "arraigo-sociolaboral",
  "arraigo-social",
  "despues-regularizacion-2026",
  "tie-nie",
  "nacionalidad-residencia",
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const tramites = getTramites(locale);
  const novedades = getNovedades(locale).slice(0, 3);
  const porCategoria = new Map(CATEGORIAS.map((c) => [c, tramites.filter((x) => x.categoria === c).length]));
  const destacadas = DESTACADAS.map((s) => tramites.find((x) => x.slug === s)).filter((x) => x !== undefined);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="badge hero-badge">Gratis · Sin registro · Con fuentes oficiales</span>
            <h1>
              Haz tus trámites de extranjería <em>sin pagar</em> por lo que puedes hacer tú
            </h1>
            <p className="lead">{t.home.intro}</p>
            <div className="btn-row">
              <Link className="btn" href={`/${locale}/asistente`}>
                <Icon name="compass" size={20} /> {t.home.ctaAsistente}
              </Link>
              <Link className="btn btn-secondary" href={`/${locale}/tramites`}>
                {t.home.ctaTramites}
              </Link>
            </div>
            <form className="search-form" action={`/${locale}/buscar`} role="search" style={{ maxWidth: "34rem" }}>
              <label htmlFor="home-q" className="visually-hidden">
                {t.home.buscarPlaceholder}
              </label>
              <input id="home-q" name="q" type="search" placeholder={t.home.buscarPlaceholder} />
              <button className="btn" type="submit" aria-label={t.nav.buscar}>
                <Icon name="search" size={20} />
              </button>
            </form>
          </div>

          <aside className="hero-panel" aria-label="Guías más consultadas">
            <h2>Guías más consultadas</h2>
            <ul className="quick-list">
              {destacadas.map((x) => (
                <li key={x.slug}>
                  <Link href={`/${locale}/tramites/${x.slug}`}>
                    <span>{x.titulo}</span>
                    <Icon name="arrow" size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <div className="trust">
        <div className="trust-item">
          <span className="card-icon">
            <Icon name="shield" size={22} />
          </span>
          <div>
            <strong>Cada dato, con su fuente</strong>
            <span>BOE y webs oficiales, con la fecha en que lo comprobamos.</span>
          </div>
        </div>
        <div className="trust-item">
          <span className="card-icon accent">
            <Icon name="lock" size={22} />
          </span>
          <div>
            <strong>No guardamos tus datos</strong>
            <span>Sin registro ni cookies de seguimiento. Todo ocurre en tu navegador.</span>
          </div>
        </div>
        <div className="trust-item">
          <span className="card-icon">
            <Icon name="heart" size={22} />
          </span>
          <div>
            <strong>Te decimos cuándo pedir ayuda</strong>
            <span>Si tu caso es difícil, te indicamos ONG y abogados gratuitos.</span>
          </div>
        </div>
      </div>

      <div className="banner" role="note">
        <Icon name="alert" size={22} className="icon" />
        <p>
          <strong>La regularización extraordinaria de 2026 ya está cerrada</strong> (el plazo terminó el 30 de junio de 2026). Si
          alguien te ofrece «plazas» para una nueva regularización, es una estafa.{" "}
          <Link href={`/${locale}/tramites/despues-regularizacion-2026`}>Si ya la pediste, mira qué hacer ahora →</Link>
        </p>
      </div>

      <div className="section-title">
        <h2>{t.home.categorias}</h2>
      </div>
      <div className="grid">
        {CATEGORIAS.map((c) => (
          <Link key={c} href={`/${locale}/tramites#${c}`} className="card-link">
            <div className="card">
              <span className="card-icon">
                <Icon name={ICONO_CATEGORIA[c]} size={24} />
              </span>
              <h3>{t.categorias[c]}</h3>
              <p className="small muted" style={{ margin: 0 }}>
                {porCategoria.get(c) ? `${porCategoria.get(c)} guías` : t.common.enPreparacion}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-title">
        <h2>{t.home.herramientas}</h2>
      </div>
      <div className="grid">
        <Link href={`/${locale}/asistente`} className="card-link">
          <div className="card">
            <span className="card-icon accent">
              <Icon name="compass" size={24} />
            </span>
            <h3>{t.nav.asistente}</h3>
            <p className="small muted" style={{ margin: 0 }}>Unas pocas preguntas y te decimos por dónde empezar.</p>
          </div>
        </Link>
        <Link href={`/${locale}/calculadoras`} className="card-link">
          <div className="card">
            <span className="card-icon accent">
              <Icon name="calendar" size={24} />
            </span>
            <h3>{t.nav.calculadoras}</h3>
            <p className="small muted" style={{ margin: 0 }}>Arraigo, renovación, plazos de recurso, TIE y nacionalidad.</p>
          </div>
        </Link>
        <Link href={`/${locale}/glosario`} className="card-link">
          <div className="card">
            <span className="card-icon accent">
              <Icon name="book" size={24} />
            </span>
            <h3>{t.nav.glosario}</h3>
            <p className="small muted" style={{ margin: 0 }}>NIE, TIE, apostilla, silencio administrativo… explicado fácil.</p>
          </div>
        </Link>
        <Link href={`/${locale}/estafas`} className="card-link">
          <div className="card">
            <span className="card-icon accent">
              <Icon name="alert" size={24} />
            </span>
            <h3>Ojo con las estafas</h3>
            <p className="small muted" style={{ margin: 0 }}>Falsos gestores, venta de citas y contratos falsos.</p>
          </div>
        </Link>
      </div>

      {novedades.length > 0 && (
        <>
          <div className="section-title">
            <h2>{t.home.novedades}</h2>
            <Link href={`/${locale}/novedades`} className="small">
              Ver todas →
            </Link>
          </div>
          <div className="grid">
            {novedades.map((n) => (
              <Link key={n.slug} href={`/${locale}/novedades#${n.slug}`} className="card-link">
                <div className="card">
                  <p className="small muted" style={{ margin: 0 }}>
                    {formatFecha(n.fecha, locale)}
                  </p>
                  <h3>{n.titulo}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{n.resumen}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div style={{ marginBlockStart: "2.5rem" }}>
        <Disclaimer locale={locale} t={t} />
      </div>
    </>
  );
}
