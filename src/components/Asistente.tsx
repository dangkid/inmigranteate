"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ARBOL } from "@/lib/asistente/arbol";
import { recorrer } from "@/lib/asistente/motor";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { localizarRuta } from "@/lib/formato";

/** Renderiza **negrita** sin necesidad de un parser de markdown en el cliente. */
function Negritas({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function Asistente({
  locale,
  t,
  titulos,
}: {
  locale: Locale;
  t: Messages["asistente"] & { atras: string; reiniciar: string; enPreparacion: string; verTramite: string };
  /** slug → título de las fichas existentes */
  titulos: Record<string, string>;
}) {
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primera = useRef(true);
  const { actual, historial } = recorrer(ARBOL, respuestas);

  useEffect(() => {
    // Mueve el foco a la nueva pregunta para lectores de pantalla y teclado.
    if (primera.current) {
      primera.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [respuestas]);

  return (
    <div className="readable">
      {historial.length > 0 && (
        <ol className="breadcrumb-answers" aria-label="Tus respuestas">
          {historial.map((h) => (
            <li key={h.pregunta.id}>
              {h.pregunta.texto} <strong>{h.pregunta.opciones.find((o) => o.id === h.opcionId)?.etiqueta}</strong>
            </li>
          ))}
        </ol>
      )}

      {actual.tipo === "pregunta" ? (
        <section className="card" aria-live="polite">
          <p className="small muted">
            {t.paso} {historial.length + 1}
          </p>
          <h2 ref={headingRef} tabIndex={-1} style={{ marginTop: 0 }}>
            {actual.texto}
          </h2>
          {actual.ayuda && <p className="muted small">{actual.ayuda}</p>}
          <div className="wizard-options" role="group" aria-label={actual.texto}>
            {actual.opciones.map((o) => (
              <button key={o.id} type="button" className="wizard-option" onClick={() => setRespuestas([...respuestas, o.id])}>
                {o.etiqueta}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="card" aria-live="polite">
          <p className="small muted">{t.resultado}</p>
          <h2 ref={headingRef} tabIndex={-1} style={{ marginTop: 0 }}>
            {actual.titulo}
          </h2>
          <p>
            <Negritas texto={actual.explicacion} />
          </p>
          {actual.recomendarAyuda && (
            <div className="notice notice-warn">
              <p>
                Tu situación es delicada. Antes de presentar nada, habla gratis con una ONG o con el servicio de
                orientación jurídica de tu colegio de abogados.{" "}
                <Link href={`/${locale}/ayuda`}>Dónde pedir ayuda gratuita</Link>
              </p>
            </div>
          )}
          {(actual.tramites.length > 0 || (actual.proximamente?.length ?? 0) > 0) && (
            <>
              <h3>{t.tramitesRecomendados}</h3>
              <ul>
                {actual.tramites.map((s) => (
                  <li key={s}>
                    <Link href={`/${locale}/tramites/${s}`}>{titulos[s] ?? s}</Link>
                  </li>
                ))}
                {actual.proximamente?.map((p) => (
                  <li key={p}>
                    {p} <span className="badge">{t.enPreparacion}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {actual.enlaces && actual.enlaces.length > 0 && (
            <>
              <h3>{t.enlacesOficiales}</h3>
              <ul>
                {actual.enlaces.map((e) =>
                  e.url.startsWith("/") ? (
                    <li key={e.url}>
                      <Link href={localizarRuta(e.url, locale)}>{e.titulo}</Link>
                    </li>
                  ) : (
                    <li key={e.url}>
                      <a href={e.url} target="_blank" rel="noopener">
                        {e.titulo}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
          <p className="small muted">{t.avisoResultado}</p>
        </section>
      )}

      <div className="btn-row">
        {respuestas.length > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => setRespuestas(respuestas.slice(0, -1))}>
            ← {t.atras}
          </button>
        )}
        {respuestas.length > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => setRespuestas([])}>
            {t.reiniciar}
          </button>
        )}
      </div>
    </div>
  );
}
