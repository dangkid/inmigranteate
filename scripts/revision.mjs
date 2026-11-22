#!/usr/bin/env node
/**
 * Informe de mantenimiento (Fase 6).
 * Lista las fichas ordenadas por urgencia de revisión:
 *  - días desde `ultima_verificacion` (umbral: DIAS, por defecto 90)
 *  - número de datos `pendiente_de_verificar`
 *  - estado (borrador / revisado)
 *
 * Uso:  npm run revision            (tabla en consola)
 *       npm run revision -- --json  (salida JSON, p. ej. para CI)
 *       DIAS=60 npm run revision
 * Sale con código 1 si hay fichas con la revisión vencida (útil en CI programado).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIAS = Number(process.env.DIAS ?? 90);
const dir = path.join(process.cwd(), "content", "tramites");
const hoy = new Date();

const contarPendientes = (obj) => {
  if (Array.isArray(obj)) return obj.reduce((n, x) => n + contarPendientes(x), 0);
  if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce(
      (n, [k, v]) => n + (k === "pendiente_de_verificar" ? 1 : contarPendientes(v)),
      0,
    );
  }
  return 0;
};

const filas = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .map((f) => {
    const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
    const fecha = data.ultima_verificacion instanceof Date
      ? data.ultima_verificacion
      : new Date(`${data.ultima_verificacion}T00:00:00Z`);
    const dias = Math.floor((hoy - fecha) / 86_400_000);
    return {
      slug: data.slug,
      estado: data.estado,
      ultima_verificacion: fecha.toISOString().slice(0, 10),
      dias,
      vencida: dias > DIAS,
      pendientes: contarPendientes(data),
    };
  })
  .sort((a, b) => Number(b.vencida) - Number(a.vencida) || b.pendientes - a.pendientes || b.dias - a.dias);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(filas, null, 2));
} else {
  console.log(`\nRevisión de fichas (umbral ${DIAS} días) — ${hoy.toISOString().slice(0, 10)}\n`);
  console.table(filas);
  const total = filas.reduce((n, f) => n + f.pendientes, 0);
  console.log(`Total de datos pendientes de verificar: ${total}`);
}

process.exit(filas.some((f) => f.vencida) ? 1 : 0);
