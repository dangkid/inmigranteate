// Solo se usa en el servidor / en build (lee el sistema de archivos).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { z } from "zod";
import type { Locale } from "@/i18n/config";
import { DEFAULT_LOCALE } from "@/i18n/config";
import {
  GlosarioSchema,
  NovedadSchema,
  PaginaSchema,
  TramiteSchema,
  type Novedad,
  type Pagina,
  type Termino,
  type Tramite,
} from "./schema";

const ROOT = path.join(process.cwd(), "content");

/**
 * El español es el idioma fuente: content/<tipo>/...
 * Las traducciones revisadas viven en content/i18n/<locale>/<tipo>/... con el mismo nombre.
 */
function resolveFile(locale: Locale, ...parts: string[]): { file: string; traducido: boolean } {
  if (locale !== DEFAULT_LOCALE) {
    const t = path.join(ROOT, "i18n", locale, ...parts);
    if (fs.existsSync(t)) return { file: t, traducido: true };
  }
  return { file: path.join(ROOT, ...parts), traducido: locale === DEFAULT_LOCALE };
}

function parseFile<S extends z.ZodType>(file: string, schema: S) {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Contenido inválido en ${path.relative(process.cwd(), file)}:\n${issues}`);
  }
  return { data: result.data as z.infer<S>, body: content };
}

export function markdownToHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true });
}

export function inlineMarkdown(md: string): string {
  return marked.parseInline(md, { async: false, gfm: true });
}

function listSlugs(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/* ------------------------------ Trámites ------------------------------ */

export type TramiteConCuerpo = Tramite & { cuerpoHtml: string; traducido: boolean };

export function getTramiteSlugs(): string[] {
  return listSlugs("tramites");
}

export function getTramite(locale: Locale, slug: string): TramiteConCuerpo | null {
  if (!getTramiteSlugs().includes(slug)) return null;
  const { file, traducido } = resolveFile(locale, "tramites", `${slug}.md`);
  const { data, body } = parseFile(file, TramiteSchema);
  if (data.slug !== slug) {
    throw new Error(`El slug "${data.slug}" no coincide con el nombre del archivo ${slug}.md`);
  }
  return { ...data, cuerpoHtml: markdownToHtml(body), traducido };
}

export function getTramites(locale: Locale): TramiteConCuerpo[] {
  return getTramiteSlugs()
    .map((s) => getTramite(locale, s))
    .filter((t): t is TramiteConCuerpo => t !== null)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
}

/* ------------------------------ Glosario ------------------------------ */

export function getGlosario(locale: Locale): Termino[] {
  const { file } = resolveFile(locale, "glosario.md");
  const { data } = parseFile(file, GlosarioSchema);
  return [...data.terminos].sort((a, b) => a.termino.localeCompare(b.termino, "es"));
}

/* ------------------------------ Novedades ----------------------------- */

export type NovedadConCuerpo = Novedad & { cuerpoHtml: string };

export function getNovedades(locale: Locale): NovedadConCuerpo[] {
  return listSlugs("novedades")
    .map((s) => {
      const { file } = resolveFile(locale, "novedades", `${s}.md`);
      const { data, body } = parseFile(file, NovedadSchema);
      return { ...data, cuerpoHtml: markdownToHtml(body) };
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/* ------------------------------- Páginas ------------------------------ */

export type PaginaConCuerpo = Pagina & { slug: string; cuerpoHtml: string; cuerpoTexto: string };

export function getPaginaSlugs(): string[] {
  return listSlugs("paginas");
}

export function getPagina(locale: Locale, slug: string): PaginaConCuerpo | null {
  if (!getPaginaSlugs().includes(slug)) return null;
  const { file } = resolveFile(locale, "paginas", `${slug}.md`);
  const { data, body } = parseFile(file, PaginaSchema);
  return { ...data, slug, cuerpoHtml: markdownToHtml(body), cuerpoTexto: body };
}
