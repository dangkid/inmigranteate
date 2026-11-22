"use client";

import Link from "next/link";
import MiniSearch from "minisearch";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { normalizar, type DocBusqueda } from "@/lib/buscador/normalizar";

/**
 * Buscador 100 % en el navegador: el índice se construye con los documentos que
 * el servidor genera en build. No se envían búsquedas a ningún servidor.
 */
export function Buscador({
  docs,
  labels,
}: {
  docs: DocBusqueda[];
  labels: { placeholder: string; sinResultados: string; resultados: string; buscar: string; tipos: Record<DocBusqueda["tipo"], string> };
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");

  const index = useMemo(() => {
    const ms = new MiniSearch<DocBusqueda>({
      fields: ["titulo", "claves", "resumen", "texto"],
      storeFields: ["titulo", "resumen", "url", "tipo"],
      processTerm: (term) => normalizar(term),
      searchOptions: {
        boost: { titulo: 4, claves: 3, resumen: 2 },
        prefix: true,
        fuzzy: 0.2,
        combineWith: "AND",
      },
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const resultados = useMemo(() => {
    const term = q.trim();
    if (term.length < 2) return [];
    let r = index.search(term);
    if (r.length === 0) r = index.search(term, { combineWith: "OR" });
    return r.slice(0, 30);
  }, [index, q]);

  return (
    <div className="readable">
      <form
        className="search-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`?q=${encodeURIComponent(q)}`, { scroll: false });
        }}
      >
        <label htmlFor="q" className="visually-hidden">
          {labels.placeholder}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          value={q}
          placeholder={labels.placeholder}
          autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" type="submit">
          {labels.buscar}
        </button>
      </form>

      {q.trim().length >= 2 && (
        <p className="small muted" aria-live="polite">
          {resultados.length} {labels.resultados}
        </p>
      )}
      {q.trim().length >= 2 && resultados.length === 0 && <p>{labels.sinResultados}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {resultados.map((r) => (
          <li key={r.id} style={{ marginBottom: "0.8rem" }}>
            <Link href={r.url as string} className="card-link">
              <div className="card">
                <span className="badge">{labels.tipos[r.tipo as DocBusqueda["tipo"]]}</span>
                <h3 style={{ margin: "0.3rem 0" }}>{r.titulo as string}</h3>
                <p className="small muted" style={{ margin: 0 }}>
                  {r.resumen as string}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
