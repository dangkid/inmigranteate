import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getGlosario, getTramites, inlineMarkdown } from "@/content/load";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return { title: t.glosario.titulo, description: t.glosario.intro, alternates: { canonical: `/${locale}/glosario` } };
}

export default async function GlosarioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const terminos = getGlosario(locale);
  const nombre = new Map(terminos.map((x) => [x.slug, x.termino]));
  const titulos = new Map(getTramites(locale).map((x) => [x.slug, x.titulo]));
  const letras = [...new Set(terminos.map((x) => x.termino[0].toUpperCase()))];

  return (
    <div className="readable">
      <h1>{t.glosario.titulo}</h1>
      <p>{t.glosario.intro}</p>
      <nav aria-label="Letras" className="small">
        {letras.map((l) => (
          <a key={l} href={`#letra-${l}`} style={{ marginInlineEnd: "0.6rem" }}>
            {l}
          </a>
        ))}
      </nav>
      <dl>
        {terminos.map((x, i) => {
          const letra = x.termino[0].toUpperCase();
          const primera = i === 0 || terminos[i - 1].termino[0].toUpperCase() !== letra;
          return (
            <div key={x.slug} id={x.slug} className="section" style={{ marginBlock: "1.2rem" }}>
              {primera && <span id={`letra-${letra}`} />}
              <dt>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{x.termino}</h2>
              </dt>
              <dd style={{ margin: "0.3rem 0 0" }}>
                <div dangerouslySetInnerHTML={{ __html: inlineMarkdown(x.definicion) }} />
                {(x.ver_tambien.length > 0 || x.tramites.length > 0) && (
                  <p className="small muted">
                    {t.glosario.verTambien}:{" "}
                    {x.ver_tambien.map((v, j) => (
                      <span key={v}>
                        {j > 0 && ", "}
                        <a href={`#${v}`}>{nombre.get(v)}</a>
                      </span>
                    ))}
                    {x.ver_tambien.length > 0 && x.tramites.length > 0 && ", "}
                    {x.tramites.map((s, j) => (
                      <span key={s}>
                        {j > 0 && ", "}
                        <Link href={`/${locale}/tramites/${s}`}>{titulos.get(s)}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
