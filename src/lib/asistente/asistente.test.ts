import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ARBOL } from "./arbol";
import { caminos, recorrer, validarArbol } from "./motor";
import type { Arbol } from "./tipos";

const slugs = fs
  .readdirSync(path.join(process.cwd(), "content", "tramites"))
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .map((f) => f.replace(/\.md$/, ""));

describe("árbol del asistente", () => {
  it("es válido: sin ciclos, sin nodos rotos ni inalcanzables, y enlaza solo a fichas existentes", () => {
    expect(validarArbol(ARBOL, slugs)).toEqual([]);
  });

  it("todos los caminos terminan en un resultado", () => {
    const todos = caminos(ARBOL);
    expect(todos.length).toBeGreaterThan(10);
    for (const c of todos) {
      const ultimo = c[c.length - 1];
      expect(ARBOL.nodos[ultimo].tipo).toBe("resultado");
    }
  });

  it("los casos sensibles recomiendan ayuda profesional", () => {
    for (const id of ["res-asilo-solicitante", "res-proteccion", "res-nada"]) {
      const n = ARBOL.nodos[id];
      expect(n.tipo === "resultado" && n.recomendarAyuda).toBe(true);
    }
  });

  it.each([
    [["espana", "no", "sin", "ninguna", "mas2", "no", "contrato"], "res-sociolaboral"],
    [["espana", "no", "sin", "ninguna", "mas2", "no", "formacion"], "res-socioformativo"],
    [["espana", "no", "sin", "ninguna", "mas2", "no", "familia"], "res-social"],
    [["espana", "no", "sin", "ninguna", "mas2", "si"], "res-segunda"],
    [["espana", "no", "sin", "ninguna", "menos2"], "res-menos-2"],
    [["espana", "no", "sin", "menor"], "res-arraigo-familiar"],
    [["espana", "no", "regularizacion"], "res-regularizacion"],
    [["espana", "no", "asilo"], "res-asilo-solicitante"],
    [["espana", "no", "residente", "nacionalidad"], "res-nacionalidad"],
    [["espana", "si"], "res-ue"],
    [["fuera", "no", "proteccion"], "res-proteccion"],
  ])("respuestas %j llevan a %s", (respuestas, esperado) => {
    expect(recorrer(ARBOL, respuestas).actual.id).toBe(esperado);
  });

  it("una respuesta desconocida detiene el recorrido en la última pregunta válida", () => {
    const r = recorrer(ARBOL, ["espana", "inventada", "no"]);
    expect(r.actual.id).toBe("ue");
    expect(r.historial).toHaveLength(1);
  });
});

describe("validarArbol", () => {
  it("detecta ciclos, nodos rotos e inalcanzables", () => {
    const malo: Arbol = {
      inicio: "a",
      nodos: {
        a: { tipo: "pregunta", id: "a", texto: "A", opciones: [{ id: "1", etiqueta: "1", siguiente: "b" }, { id: "2", etiqueta: "2", siguiente: "x" }] },
        b: { tipo: "pregunta", id: "b", texto: "B", opciones: [{ id: "1", etiqueta: "1", siguiente: "a" }, { id: "1", etiqueta: "1", siguiente: "a" }] },
        suelto: { tipo: "resultado", id: "suelto", titulo: "S", explicacion: "", tramites: [] },
      },
    };
    const errores = validarArbol(malo);
    expect(errores.some((e) => e.includes("Ciclo"))).toBe(true);
    expect(errores.some((e) => e.includes('"x", que no existe'))).toBe(true);
    expect(errores.some((e) => e.includes("inalcanzable"))).toBe(true);
    expect(errores.some((e) => e.includes("repite"))).toBe(true);
    expect(errores.some((e) => e.includes("no recomienda nada"))).toBe(true);
  });
});
