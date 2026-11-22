import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import type { Item, Documento, Paso, Tasa } from "@/content/schema";
import type { TramiteConCuerpo } from "@/content/load";
import { inlineMarkdown } from "@/content/load";
import { DIAS_REVISION } from "@/lib/site";
import { diasDesde, formatFecha } from "@/lib/formato";
import { Checklist, type ChecklistItem } from "./Checklist";
import { Disclaimer } from "./Disclaimer";

type Ctx = { t: Messages; numFuente: Map<string, number> };

function Html({ md, as: As = "span" }: { md: string; as?: "span" | "div" }) {
  return <As dangerouslySetInnerHTML={{ __html: inlineMarkdown(md) }} />;
}

function Refs({ ids, ctx }: { ids: string[]; ctx: Ctx }) {
  if (ids.length === 0) return null;
  return (
    <span className="refs">
      {" "}
      {ids.map((id) => (
        <a key={id} href={`#fuente-${id}`} aria-label={`Fuente ${ctx.numFuente.get(id)}`}>
          [{ctx.numFuente.get(id)}]
        </a>
      ))}
    </span>
  );
}

function Pendiente({ texto, ctx }: { texto?: string; ctx: Ctx }) {
  if (!texto) return null;
  return (
    <span className="pendiente">
      ⚠ <strong>{ctx.t.common.pendiente}:</strong> {texto}
    </span>
  );
}

function ItemBody({ it, ctx, extra }: { it: Item; ctx: Ctx; extra?: ReactNode }) {
  return (
    <>
      <Html md={it.texto} />
      <Refs ids={it.fuentes} ctx={ctx} />
      {it.detalle && (
        <div className="small muted">
          <Html md={it.detalle} />
        </div>
      )}
      {extra}
      <Pendiente texto={it.pendiente_de_verificar} ctx={ctx} />
    </>
  );
}

function Lista({ items, ctx }: { items: Item[]; ctx: Ctx }) {
  return (
    <ul>
      {items.map((it, i) => (
        <li key={i}>
          <ItemBody it={it} ctx={ctx} />
        </li>
      ))}
    </ul>
  );
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={`h-${id}`}>
      <h2 id={`h-${id}`}>{titulo}</h2>
      {children}
    </section>
  );
}

export function Ficha({
  tramite: tr,
  locale,
  t,
  titulosRelacionados,
}: {
  tramite: TramiteConCuerpo;
  locale: Locale;
  t: Messages;
  titulosRelacionados: Record<string, string>;
}) {
  const numFuente = new Map(tr.fuentes.map((f, i) => [f.id, i + 1]));
  const ctx: Ctx = { t, numFuente };
  const T = t.tramite;
  const vencida = diasDesde(tr.ultima_verificacion) > DIAS_REVISION;

  const secciones: { id: string; titulo: string; visible: boolean }[] = [
    { id: "para-quien", titulo: T.paraQuien, visible: true },
    { id: "requisitos", titulo: T.requisitos, visible: true },
    { id: "documentos", titulo: T.documentos, visible: tr.documentos.length > 0 },
    { id: "pasos", titulo: T.pasos, visible: true },
    { id: "tasas", titulo: T.tasas, visible: tr.tasas.length > 0 },
    { id: "plazos", titulo: T.plazos, visible: tr.plazos.length > 0 },
    { id: "checklist", titulo: T.checklist, visible: true },
    { id: "tiempos", titulo: T.tiemposReales, visible: true },
    { id: "errores", titulo: T.errores, visible: tr.errores_frecuentes.length > 0 },
    { id: "denegacion", titulo: T.denegacion, visible: tr.motivos_de_denegacion_habituales.length > 0 },
    { id: "si-deniegan", titulo: T.siDeniegan, visible: tr.que_hacer_si_deniegan.length > 0 },
    { id: "ayuda", titulo: T.ayudaProfesional, visible: tr.cuando_buscar_ayuda_profesional.length > 0 },
    { id: "faq", titulo: T.faq, visible: tr.preguntas_frecuentes.length > 0 },
    { id: "normativa", titulo: T.normativa, visible: true },
    { id: "fuentes", titulo: T.fuentes, visible: true },
  ];

  const checklistItems: ChecklistItem[] = [
    ...tr.documentos.map((d, i) => ({ id: `d${i}`, texto: stripMd(d.texto), grupo: T.documentos })),
    ...tr.pasos.map((p, i) => ({ id: `p${i}`, texto: stripMd(p.texto), grupo: T.pasos })),
  ];

  return (
    <article>
      <header className="tramite-header">
        <p className="small">
          <Link href={`/${locale}/tramites`}>{t.nav.tramites}</Link> › {t.categorias[tr.categoria]}
        </p>
        <h1>{tr.titulo}</h1>
        <p className="resumen">{tr.resumen_en_una_frase}</p>
        <p className="meta-line">
          <span>
            {t.common.ultimaVerificacion}: <time dateTime={tr.ultima_verificacion}>{formatFecha(tr.ultima_verificacion, locale)}</time>
          </span>
          {tr.estado === "borrador" ? (
            <span className="badge badge-warn">En revisión</span>
          ) : (
            <span className="badge badge-ok">Revisada</span>
          )}
        </p>
      </header>

      <Disclaimer locale={locale} t={t} ultimaVerificacion={tr.ultima_verificacion} fuenteOficial={tr.enlace_oficial} />
      {tr.estado === "borrador" && (
        <div className="notice notice-warn">
          <p>{T.borrador}</p>
        </div>
      )}
      {vencida && (
        <div className="notice notice-warn">
          <p>{T.revisionVencida}</p>
        </div>
      )}
      {!tr.traducido && (
        <div className="notice">
          <p>{T.traduccionPendiente}</p>
        </div>
      )}

      <nav className="card toc no-print" aria-label="Índice">
        <ol>
          {secciones
            .filter((s) => s.visible)
            .map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.titulo}</a>
              </li>
            ))}
        </ol>
      </nav>

      <div className="readable">
        {tr.cuerpoHtml.trim() && <div className="prose" dangerouslySetInnerHTML={{ __html: tr.cuerpoHtml }} />}

        <Seccion id="para-quien" titulo={T.paraQuien}>
          <Lista items={tr.para_quien} ctx={ctx} />
          {tr.para_quien_NO.length > 0 && (
            <div className="notice">
              <p>
                <strong>{T.paraQuienNo}</strong>
              </p>
              <ul>
                {tr.para_quien_NO.map((n, i) => (
                  <li key={i}>
                    <Html md={n.texto} />
                    {n.ver && (
                      <>
                        {" → "}
                        <Link href={`/${locale}/tramites/${n.ver}`}>{titulosRelacionados[n.ver] ?? n.ver}</Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Seccion>

        <Seccion id="requisitos" titulo={T.requisitos}>
          <Lista items={tr.requisitos} ctx={ctx} />
        </Seccion>

        {tr.documentos.length > 0 && (
          <Seccion id="documentos" titulo={T.documentos}>
            <ul>
              {tr.documentos.map((d: Documento, i) => (
                <li key={i}>
                  <ItemBody
                    it={d}
                    ctx={ctx}
                    extra={
                      (d.donde || d.legalizacion || d.traduccion_jurada) && (
                        <span className="meta-line">
                          {d.donde && <span>📍 {d.donde}</span>}
                          {d.legalizacion && <span>🔏 {T.legalizacion[d.legalizacion]}</span>}
                          {d.traduccion_jurada && <span>🌐 {T.traduccionJurada}</span>}
                        </span>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        <Seccion id="pasos" titulo={T.pasos}>
          <ol className="steps">
            {tr.pasos.map((p: Paso, i) => (
              <li key={i}>
                <ItemBody
                  it={p}
                  ctx={ctx}
                  extra={
                    (p.modo || p.enlace) && (
                      <span className="meta-line">
                        {p.modo && <span className="badge">{T.modo[p.modo]}</span>}
                        {p.enlace && (
                          <a href={p.enlace} target="_blank" rel="noopener">
                            {p.enlace.replace(/^https?:\/\//, "").split("/")[0]} ↗
                          </a>
                        )}
                      </span>
                    )
                  }
                />
              </li>
            ))}
          </ol>
        </Seccion>

        {tr.tasas.length > 0 && (
          <Seccion id="tasas" titulo={T.tasas}>
            <ul>
              {tr.tasas.map((x: Tasa, i) => (
                <li key={i}>
                  <strong>{x.modelo}</strong>
                  {x.importe && <> — {x.importe}</>}: <ItemBody it={x} ctx={ctx} />
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        {tr.plazos.length > 0 && (
          <Seccion id="plazos" titulo={T.plazos}>
            <Lista items={tr.plazos} ctx={ctx} />
            <p className="small">
              <Link href={`/${locale}/calculadoras`}>Calcula tus fechas →</Link>
            </p>
          </Seccion>
        )}

        <Seccion id="checklist" titulo={T.checklist}>
          <Checklist
            id={tr.slug}
            titulo={tr.titulo}
            items={checklistItems}
            labels={{ ayuda: T.checklistAyuda, descargar: t.common.descargar, imprimir: t.common.imprimir, reiniciar: t.common.reiniciar }}
          />
        </Seccion>

        <Seccion id="tiempos" titulo={T.tiemposReales}>
          <p className="small muted">{T.tiemposRealesAviso}</p>
          {tr.tiempos_reales.length === 0 ? (
            <p>{T.tiemposRealesVacio}</p>
          ) : (
            <ul>
              {tr.tiempos_reales.map((x, i) => (
                <li key={i}>
                  {x.provincia && <strong>{x.provincia}: </strong>}
                  {x.texto}
                  {x.periodo && <span className="muted small"> ({x.periodo})</span>}
                  <Refs ids={x.fuentes} ctx={ctx} />
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        {tr.errores_frecuentes.length > 0 && (
          <Seccion id="errores" titulo={T.errores}>
            <Lista items={tr.errores_frecuentes} ctx={ctx} />
          </Seccion>
        )}
        {tr.motivos_de_denegacion_habituales.length > 0 && (
          <Seccion id="denegacion" titulo={T.denegacion}>
            <Lista items={tr.motivos_de_denegacion_habituales} ctx={ctx} />
          </Seccion>
        )}
        {tr.que_hacer_si_deniegan.length > 0 && (
          <Seccion id="si-deniegan" titulo={T.siDeniegan}>
            <Lista items={tr.que_hacer_si_deniegan} ctx={ctx} />
          </Seccion>
        )}
        {tr.cuando_buscar_ayuda_profesional.length > 0 && (
          <Seccion id="ayuda" titulo={T.ayudaProfesional}>
            <Lista items={tr.cuando_buscar_ayuda_profesional} ctx={ctx} />
            <p>
              <Link href={`/${locale}/ayuda`}>Dónde pedir ayuda gratuita →</Link>
            </p>
          </Seccion>
        )}

        {tr.preguntas_frecuentes.length > 0 && (
          <Seccion id="faq" titulo={T.faq}>
            {tr.preguntas_frecuentes.map((f, i) => (
              <details key={i} className="faq">
                <summary>{f.pregunta}</summary>
                <Html md={f.respuesta} as="div" />
                <Refs ids={f.fuentes} ctx={ctx} />
                <Pendiente texto={f.pendiente_de_verificar} ctx={ctx} />
              </details>
            ))}
          </Seccion>
        )}

        <Seccion id="normativa" titulo={T.normativa}>
          <ul>
            {tr.normativa.map((n, i) => (
              <li key={i}>
                <a href={n.url} target="_blank" rel="noopener">
                  {n.norma}
                </a>
                : {n.articulos}
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion id="fuentes" titulo={T.fuentes}>
          <ol className="small">
            {tr.fuentes.map((f) => (
              <li key={f.id} id={`fuente-${f.id}`}>
                <a href={f.url} target="_blank" rel="noopener">
                  {f.titulo}
                </a>{" "}
                <span className={f.nivel === 1 ? "badge badge-ok" : f.nivel === 3 ? "badge badge-warn" : "badge"}>
                  {t.common.nivel} {f.nivel}
                </span>{" "}
                <span className="muted">
                  — {t.common.consultada} {formatFecha(f.consultada, locale)}
                </span>
                {f.nota && <div className="muted">{f.nota}</div>}
              </li>
            ))}
          </ol>
          <p className="small muted">
            Nivel 1: fuente oficial · Nivel 2: fuente secundaria fiable (ONG, colegios de abogados) · Nivel 3: experiencia de usuarios (nunca se usa para requisitos).
          </p>
        </Seccion>

        {tr.relacionados.length > 0 && (
          <section className="section no-print">
            <h2>{T.relacionados}</h2>
            <ul>
              {tr.relacionados.map((s) => (
                <li key={s}>
                  <Link href={`/${locale}/tramites/${s}`}>{titulosRelacionados[s] ?? s}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="notice no-print">
          <Link href={`/${locale}/reportar?pagina=${encodeURIComponent(tr.slug)}`}>{T.reportar}</Link>
        </p>
      </div>
    </article>
  );
}

function stripMd(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
