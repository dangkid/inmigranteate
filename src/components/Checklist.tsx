"use client";

import { useEffect, useState } from "react";

export interface ChecklistItem {
  id: string;
  texto: string;
  grupo: string;
}

const PREFIX = "inmigranteate:checklist:";

function leer(key: string): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/**
 * Lista de comprobación. El estado se guarda SOLO en el navegador (localStorage),
 * no se envía a ningún servidor. No se pide ni guarda ningún dato personal.
 */
export function Checklist({
  id,
  titulo,
  items,
  labels,
}: {
  id: string;
  titulo: string;
  items: ChecklistItem[];
  labels: { ayuda: string; descargar: string; imprimir: string; reiniciar: string };
}) {
  const key = PREFIX + id;
  const [hechos, setHechos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Sincroniza con localStorage tras montar (no disponible en el servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHechos(leer(key));
  }, [key]);

  const toggle = (itemId: string) => {
    setHechos((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* navegación privada o almacenamiento bloqueado: seguimos sin guardar */
      }
      return next;
    });
  };

  const reiniciar = () => {
    setHechos({});
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignorar */
    }
  };

  const descargar = () => {
    const grupos = [...new Set(items.map((i) => i.grupo))];
    const lineas = [titulo, "=".repeat(titulo.length), ""];
    for (const g of grupos) {
      lineas.push(g.toUpperCase());
      for (const it of items.filter((i) => i.grupo === g)) {
        lineas.push(`[${hechos[it.id] ? "x" : " "}] ${it.texto}`);
      }
      lineas.push("");
    }
    lineas.push(`Generado en Inmigranteate (${window.location.href}). Información orientativa, no es asesoramiento legal.`);
    const blob = new Blob([lineas.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = items.length;
  const hechosN = items.filter((i) => hechos[i.id]).length;
  const grupos = [...new Set(items.map((i) => i.grupo))];

  return (
    <div className="card">
      <p className="small muted">{labels.ayuda}</p>
      <p className="small" aria-live="polite">
        <strong>
          {hechosN} / {total}
        </strong>
      </p>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${total ? (hechosN / total) * 100 : 0}%` }} />
      </div>
      {grupos.map((g) => (
        <fieldset key={g} style={{ border: 0, padding: 0, margin: "1rem 0 0" }}>
          <legend>
            <strong>{g}</strong>
          </legend>
          <ul className="checklist">
            {items
              .filter((i) => i.grupo === g)
              .map((it) => {
                const inputId = `chk-${id}-${it.id}`;
                return (
                  <li key={it.id} className={hechos[it.id] ? "done" : undefined}>
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={!!hechos[it.id]}
                      onChange={() => toggle(it.id)}
                    />
                    <label htmlFor={inputId}>{it.texto}</label>
                  </li>
                );
              })}
          </ul>
        </fieldset>
      ))}
      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={descargar}>
          {labels.descargar}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          {labels.imprimir}
        </button>
        <button type="button" className="btn btn-secondary" onClick={reiniciar}>
          {labels.reiniciar}
        </button>
      </div>
    </div>
  );
}
