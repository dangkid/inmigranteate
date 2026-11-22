import type { Arbol, Nodo, NodoPregunta } from "./tipos";

export interface EstadoRecorrido {
  /** Nodo en el que está la persona ahora */
  actual: Nodo;
  /** Preguntas ya respondidas con su respuesta, en orden */
  historial: { pregunta: NodoPregunta; opcionId: string }[];
}

/**
 * Recorre el árbol aplicando las respuestas en orden.
 * Las respuestas que no correspondan a una opción válida se ignoran a partir de ahí
 * (el recorrido se detiene en la última pregunta válida).
 */
export function recorrer(arbol: Arbol, respuestas: string[]): EstadoRecorrido {
  let actual = arbol.nodos[arbol.inicio];
  if (!actual) throw new Error(`Nodo inicial "${arbol.inicio}" no existe`);
  const historial: EstadoRecorrido["historial"] = [];
  for (const r of respuestas) {
    if (actual.tipo !== "pregunta") break;
    const opcion = actual.opciones.find((o) => o.id === r);
    if (!opcion) break;
    const sig = arbol.nodos[opcion.siguiente];
    if (!sig) throw new Error(`El nodo "${opcion.siguiente}" no existe`);
    historial.push({ pregunta: actual, opcionId: r });
    actual = sig;
  }
  return { actual, historial };
}

/**
 * Comprueba la integridad del árbol. Devuelve una lista de errores (vacía si todo va bien):
 * - todas las opciones apuntan a nodos existentes
 * - los ids coinciden con su clave
 * - no hay ciclos (todo camino termina en un resultado)
 * - no hay nodos inalcanzables
 * - las preguntas tienen al menos 2 opciones y sin ids repetidos
 * - los resultados recomiendan algo (ficha, trámite en preparación o enlace)
 */
export function validarArbol(arbol: Arbol, slugsExistentes?: string[]): string[] {
  const errores: string[] = [];
  const { nodos } = arbol;
  if (!nodos[arbol.inicio]) errores.push(`Inicio "${arbol.inicio}" no existe`);

  for (const [clave, nodo] of Object.entries(nodos)) {
    if (nodo.id !== clave) errores.push(`Nodo "${clave}" tiene id "${nodo.id}"`);
    if (nodo.tipo === "pregunta") {
      if (nodo.opciones.length < 2) errores.push(`Pregunta "${clave}" tiene menos de 2 opciones`);
      const ids = new Set<string>();
      for (const o of nodo.opciones) {
        if (ids.has(o.id)) errores.push(`Pregunta "${clave}" repite la opción "${o.id}"`);
        ids.add(o.id);
        if (!nodos[o.siguiente]) errores.push(`Opción "${clave}.${o.id}" apunta a "${o.siguiente}", que no existe`);
      }
    } else {
      const total = nodo.tramites.length + (nodo.proximamente?.length ?? 0) + (nodo.enlaces?.length ?? 0);
      if (total === 0) errores.push(`Resultado "${clave}" no recomienda nada`);
      if (slugsExistentes) {
        for (const s of nodo.tramites) {
          if (!slugsExistentes.includes(s)) errores.push(`Resultado "${clave}" enlaza a la ficha "${s}", que no existe`);
        }
      }
    }
  }

  // Ciclos y alcanzabilidad (DFS)
  const visitados = new Set<string>();
  const enPila = new Set<string>();
  const dfs = (id: string) => {
    if (enPila.has(id)) {
      errores.push(`Ciclo detectado en "${id}"`);
      return;
    }
    if (visitados.has(id)) return;
    const nodo = nodos[id];
    if (!nodo) return;
    visitados.add(id);
    enPila.add(id);
    if (nodo.tipo === "pregunta") nodo.opciones.forEach((o) => dfs(o.siguiente));
    enPila.delete(id);
  };
  dfs(arbol.inicio);
  for (const id of Object.keys(nodos)) {
    if (!visitados.has(id)) errores.push(`Nodo "${id}" es inalcanzable`);
  }
  return errores;
}

/** Todos los caminos posibles (útil para tests y revisión editorial). */
export function caminos(arbol: Arbol): string[][] {
  const out: string[][] = [];
  const go = (id: string, camino: string[]) => {
    const n = arbol.nodos[id];
    if (!n) return;
    if (n.tipo === "resultado") {
      out.push([...camino, id]);
      return;
    }
    n.opciones.forEach((o) => go(o.siguiente, [...camino, `${id}:${o.id}`]));
  };
  go(arbol.inicio, []);
  return out;
}
