import type { Locale } from "@/i18n/config";
import { getGlosario, getNovedades, getPagina, getPaginaSlugs, getTramites } from "@/content/load";
import type { DocBusqueda } from "./normalizar";

const quitarHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Construye (en build) los documentos indexables para el buscador del cliente. */
export function documentosBusqueda(locale: Locale): DocBusqueda[] {
  const docs: DocBusqueda[] = [];

  for (const t of getTramites(locale)) {
    docs.push({
      id: `t:${t.slug}`,
      tipo: "tramite",
      titulo: t.titulo,
      resumen: t.resumen_en_una_frase,
      claves: t.palabras_clave.join(" "),
      texto: [
        ...t.para_quien.map((x) => x.texto),
        ...t.requisitos.map((x) => x.texto),
        ...t.documentos.map((x) => x.texto),
        ...t.preguntas_frecuentes.map((x) => x.pregunta),
      ]
        .join(" ")
        .slice(0, 3000),
      url: `/${locale}/tramites/${t.slug}`,
    });
  }

  for (const g of getGlosario(locale)) {
    docs.push({
      id: `g:${g.slug}`,
      tipo: "glosario",
      titulo: g.termino,
      resumen: g.definicion,
      claves: "",
      texto: g.definicion,
      url: `/${locale}/glosario#${g.slug}`,
    });
  }

  for (const n of getNovedades(locale)) {
    docs.push({
      id: `n:${n.slug}`,
      tipo: "novedad",
      titulo: n.titulo,
      resumen: n.resumen,
      claves: "",
      texto: quitarHtml(n.cuerpoHtml).slice(0, 2000),
      url: `/${locale}/novedades#${n.slug}`,
    });
  }

  for (const slug of getPaginaSlugs()) {
    const p = getPagina(locale, slug);
    if (!p) continue;
    docs.push({
      id: `p:${slug}`,
      tipo: "pagina",
      titulo: p.titulo,
      resumen: p.descripcion,
      claves: "",
      texto: quitarHtml(p.cuerpoHtml).slice(0, 2000),
      url: `/${locale}/${slug}`,
    });
  }

  return docs;
}
