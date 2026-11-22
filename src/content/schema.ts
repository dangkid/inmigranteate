import { z } from "zod";

/** Fecha YYYY-MM-DD. YAML convierte fechas sin comillas en Date: las normalizamos. */
export const Fecha = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha esperado: AAAA-MM-DD"),
);

export const CATEGORIAS = [
  "documentacion",
  "estancias-visados",
  "arraigos-regularizacion",
  "familia",
  "trabajo-residencia",
  "proteccion-internacional",
  "nacionalidad",
  "vida-practica",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Elemento genérico: un texto con sus fuentes y, si procede, aviso de dato no confirmado. */
export const Item = z.object({
  texto: z.string().min(1),
  detalle: z.string().optional(),
  /** ids de `fuentes` que respaldan este punto */
  fuentes: z.array(z.string()).default([]),
  /** Si existe, el dato no está confirmado: se explica qué falta comprobar. */
  pendiente_de_verificar: z.string().optional(),
});
export type Item = z.infer<typeof Item>;

export const Documento = Item.extend({
  donde: z.string().optional(),
  legalizacion: z.enum(["no", "apostilla_o_legalizacion", "segun_pais"]).optional(),
  traduccion_jurada: z.boolean().optional(),
});
export type Documento = z.infer<typeof Documento>;

export const Paso = Item.extend({
  modo: z.enum(["online", "presencial", "online_o_presencial"]).optional(),
  enlace: z.url().optional(),
});
export type Paso = z.infer<typeof Paso>;

export const Tasa = Item.extend({
  modelo: z.string(),
  importe: z.string().optional(),
});
export type Tasa = z.infer<typeof Tasa>;

export const Fuente = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titulo: z.string(),
  url: z.url(),
  /** 1 = oficial, 2 = secundaria fiable, 3 = experiencia de usuarios */
  nivel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  consultada: Fecha,
  nota: z.string().optional(),
});
export type Fuente = z.infer<typeof Fuente>;

export const TramiteSchema = z
  .object({
    titulo: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    categoria: z.enum(CATEGORIAS),
    resumen_en_una_frase: z.string(),
    /** borrador = tiene datos pendientes; revisado = todo contrastado con Nivel 1 */
    estado: z.enum(["borrador", "revisado"]),
    ultima_verificacion: Fecha,
    enlace_oficial: z.object({ titulo: z.string(), url: z.url() }),
    palabras_clave: z.array(z.string()).default([]),
    para_quien: z.array(Item).min(1),
    para_quien_NO: z
      .array(z.object({ texto: z.string(), ver: z.string().optional() }))
      .default([]),
    requisitos: z.array(Item).min(1),
    documentos: z.array(Documento).default([]),
    pasos: z.array(Paso).min(1),
    tasas: z.array(Tasa).default([]),
    plazos: z.array(Item).default([]),
    tiempos_reales: z
      .array(
        z.object({
          texto: z.string(),
          provincia: z.string().optional(),
          periodo: z.string().optional(),
          fuentes: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    errores_frecuentes: z.array(Item).default([]),
    motivos_de_denegacion_habituales: z.array(Item).default([]),
    que_hacer_si_deniegan: z.array(Item).default([]),
    cuando_buscar_ayuda_profesional: z.array(Item).default([]),
    normativa: z
      .array(z.object({ norma: z.string(), articulos: z.string(), url: z.url() }))
      .min(1),
    fuentes: z.array(Fuente).min(1),
    preguntas_frecuentes: z
      .array(
        z.object({
          pregunta: z.string(),
          respuesta: z.string(),
          fuentes: z.array(z.string()).default([]),
          pendiente_de_verificar: z.string().optional(),
        }),
      )
      .default([]),
    relacionados: z.array(z.string()).default([]),
  })
  .superRefine((t, ctx) => {
    const ids = new Set(t.fuentes.map((f) => f.id));
    if (ids.size !== t.fuentes.length) {
      ctx.addIssue({ code: "custom", message: "Hay ids de fuente repetidos" });
    }
    if (!t.fuentes.some((f) => f.nivel === 1)) {
      ctx.addIssue({ code: "custom", message: "Toda ficha necesita al menos una fuente de Nivel 1" });
    }
    const check = (refs: string[], where: string) => {
      for (const r of refs) {
        if (!ids.has(r)) ctx.addIssue({ code: "custom", message: `Fuente "${r}" no existe (en ${where})` });
      }
    };
    const listas = [
      "para_quien", "requisitos", "documentos", "pasos", "tasas", "plazos",
      "errores_frecuentes", "motivos_de_denegacion_habituales", "que_hacer_si_deniegan",
      "cuando_buscar_ayuda_profesional", "preguntas_frecuentes", "tiempos_reales",
    ] as const;
    for (const key of listas) {
      (t[key] as { fuentes: string[] }[]).forEach((it, i) => check(it.fuentes, `${key}[${i}]`));
    }
    // Los requisitos legales no pueden apoyarse solo en experiencia de usuarios (Nivel 3).
    const nivel = new Map(t.fuentes.map((f) => [f.id, f.nivel]));
    t.requisitos.forEach((r, i) => {
      if (r.fuentes.length === 0 && !r.pendiente_de_verificar) {
        ctx.addIssue({ code: "custom", message: `requisitos[${i}] no tiene fuente ni está marcado como pendiente` });
      }
      if (r.fuentes.length > 0 && r.fuentes.every((f) => nivel.get(f) === 3)) {
        ctx.addIssue({ code: "custom", message: `requisitos[${i}] solo se apoya en fuentes de Nivel 3` });
      }
    });
  });

export type Tramite = z.infer<typeof TramiteSchema>;

export const GlosarioSchema = z.object({
  terminos: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      termino: z.string(),
      definicion: z.string(),
      ver_tambien: z.array(z.string()).default([]),
      tramites: z.array(z.string()).default([]),
    }),
  ),
});
export type Termino = z.infer<typeof GlosarioSchema>["terminos"][number];

export const NovedadSchema = z.object({
  titulo: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  fecha: Fecha,
  resumen: z.string(),
  fuentes: z.array(z.object({ titulo: z.string(), url: z.url() })).min(1),
  afecta: z.array(z.string()).default([]),
});
export type Novedad = z.infer<typeof NovedadSchema>;

export const PaginaSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  ultima_verificacion: Fecha.optional(),
});
export type Pagina = z.infer<typeof PaginaSchema>;
