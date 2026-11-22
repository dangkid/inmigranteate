import { describe, expect, it } from "vitest";
import { getGlosario, getNovedades, getPagina, getPaginaSlugs, getTramite, getTramiteSlugs } from "./load";

/**
 * Estos tests validan TODO el contenido de /content contra el esquema.
 * Si añades o editas una ficha y algo falla, el mensaje dice el archivo y el campo.
 */
describe("contenido", () => {
  const slugs = getTramiteSlugs();

  it("hay fichas de trámites", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  it.each(slugs)("la ficha %s cumple el esquema y sus enlaces internos existen", (slug) => {
    const t = getTramite("es", slug);
    expect(t).not.toBeNull();
    for (const r of t!.relacionados) expect(slugs, `relacionado "${r}" en ${slug}`).toContain(r);
    for (const n of t!.para_quien_NO) if (n.ver) expect(slugs, `para_quien_NO.ver "${n.ver}" en ${slug}`).toContain(n.ver);
  });

  it("una ficha marcada como 'revisado' no tiene datos pendientes", () => {
    for (const slug of slugs) {
      const t = getTramite("es", slug)!;
      if (t.estado !== "revisado") continue;
      const json = JSON.stringify(t);
      expect(json.includes("pendiente_de_verificar"), `${slug} está 'revisado' pero tiene pendientes`).toBe(false);
    }
  });

  it("el glosario es válido y sus referencias existen", () => {
    const terminos = getGlosario("es");
    const ids = new Set(terminos.map((t) => t.slug));
    expect(ids.size).toBe(terminos.length);
    for (const t of terminos) {
      for (const v of t.ver_tambien) expect(ids, `ver_tambien "${v}" en ${t.slug}`).toContain(v);
      for (const s of t.tramites) expect(slugs, `tramite "${s}" en glosario ${t.slug}`).toContain(s);
    }
  });

  it("las novedades son válidas", () => {
    for (const n of getNovedades("es")) {
      for (const s of n.afecta) expect(slugs, `afecta "${s}" en novedad ${n.slug}`).toContain(s);
    }
  });

  it("las páginas son válidas", () => {
    for (const p of getPaginaSlugs()) expect(getPagina("es", p)).not.toBeNull();
  });
});
