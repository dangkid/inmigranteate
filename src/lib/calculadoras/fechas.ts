/**
 * Aritmética de fechas "de calendario" (sin horas ni zonas horarias).
 * Internamente se usa UTC para evitar saltos por horario de verano.
 */

export type FechaISO = string; // AAAA-MM-DD

const RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseFecha(iso: FechaISO): Date {
  const m = RE.exec(iso);
  if (!m) throw new Error(`Fecha inválida: "${iso}" (formato AAAA-MM-DD)`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new Error(`Fecha inexistente: "${iso}"`);
  }
  return date;
}

export function formatISO(date: Date): FechaISO {
  return date.toISOString().slice(0, 10);
}

export function esFechaValida(iso: string): boolean {
  try {
    parseFecha(iso);
    return true;
  } catch {
    return false;
  }
}

function diasDelMes(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/**
 * Suma meses "de fecha a fecha". Si el mes de destino no tiene ese día
 * (p. ej. 31 → febrero), se usa el último día del mes, como prevé el
 * art. 30.4 de la Ley 39/2015 para el cómputo de plazos por meses.
 */
export function sumarMeses(iso: FechaISO, meses: number): FechaISO {
  const d = parseFecha(iso);
  const total = d.getUTCMonth() + meses;
  const y = d.getUTCFullYear() + Math.floor(total / 12);
  const m0 = ((total % 12) + 12) % 12;
  const dia = Math.min(d.getUTCDate(), diasDelMes(y, m0));
  return formatISO(new Date(Date.UTC(y, m0, dia)));
}

export function sumarAnios(iso: FechaISO, anios: number): FechaISO {
  return sumarMeses(iso, anios * 12);
}

export function sumarDias(iso: FechaISO, dias: number): FechaISO {
  const d = parseFecha(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return formatISO(d);
}

/** Diferencia en días naturales (b - a). */
export function diferenciaDias(a: FechaISO, b: FechaISO): number {
  return Math.round((parseFecha(b).getTime() - parseFecha(a).getTime()) / 86_400_000);
}

export function esFinDeSemana(iso: FechaISO): boolean {
  const dow = parseFecha(iso).getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Si el último día de un plazo administrativo es inhábil, pasa al siguiente hábil
 * (art. 30.5 Ley 39/2015). Aquí solo detectamos sábados y domingos: los festivos
 * nacionales, autonómicos y locales NO se tienen en cuenta.
 */
export function siguienteHabilSiFinDeSemana(iso: FechaISO): FechaISO {
  let f = iso;
  while (esFinDeSemana(f)) f = sumarDias(f, 1);
  return f;
}

/**
 * Fin de un plazo administrativo expresado en meses, contado desde una notificación
 * (art. 30.4 Ley 39/2015): termina el mismo día del mes de vencimiento en que se
 * notificó; si no existe, el último día de ese mes; si es inhábil, el siguiente hábil.
 */
export function finPlazoMeses(notificacion: FechaISO, meses: number): {
  fecha: FechaISO;
  desplazadoPorFinDeSemana: boolean;
} {
  const base = sumarMeses(notificacion, meses);
  const fecha = siguienteHabilSiFinDeSemana(base);
  return { fecha, desplazadoPorFinDeSemana: fecha !== base };
}
