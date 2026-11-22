/**
 * Calculadoras de Inmigranteate. Cada regla indica su base legal.
 * Si cambia la norma, se cambia aquí y en los tests (calculos.test.ts).
 */
import {
  diferenciaDias,
  finPlazoMeses,
  parseFecha,
  sumarAnios,
  sumarMeses,
  type FechaISO,
} from "./fechas";

/* -------------------------------------------------------------------------- */
/* 1. Arraigos: desde cuándo se cumplen los 2 años de permanencia continuada  */
/*    Art. 126.b) del Reglamento (RD 1155/2024). El arraigo familiar no exige  */
/*    permanencia mínima.                                                      */
/* -------------------------------------------------------------------------- */

export type TipoArraigo =
  | "social"
  | "sociolaboral"
  | "socioformativo"
  | "segunda-oportunidad"
  | "familiar";

export const PERMANENCIA_ARRAIGO_ANIOS: Record<TipoArraigo, number> = {
  social: 2,
  sociolaboral: 2,
  socioformativo: 2,
  "segunda-oportunidad": 2,
  familiar: 0,
};

export interface ResultadoArraigo {
  tipo: TipoArraigo;
  /** Fecha desde la que se cumplen los años exigidos (null si no se exige permanencia). */
  fechaDesde: FechaISO | null;
  yaCumple: boolean;
  diasRestantes: number;
  avisos: string[];
}

export function calcularArraigo(params: {
  tipo: TipoArraigo;
  /** Fecha desde la que vives en España de forma continuada. */
  inicioPermanencia: FechaISO;
  hoy: FechaISO;
  /** ¿Has sido solicitante de protección internacional durante ese tiempo? */
  fueSolicitanteAsilo?: boolean;
}): ResultadoArraigo {
  const { tipo, inicioPermanencia, hoy } = params;
  parseFecha(inicioPermanencia);
  parseFecha(hoy);
  if (diferenciaDias(inicioPermanencia, hoy) < 0) {
    throw new Error("La fecha de inicio no puede ser posterior a hoy");
  }
  const anios = PERMANENCIA_ARRAIGO_ANIOS[tipo];
  const avisos: string[] = [];
  if (params.fueSolicitanteAsilo) {
    avisos.push(
      "El Reglamento dice que el tiempo como solicitante de protección internacional no computa hasta que hay resolución firme (art. 126.b). Además, no puedes pedir un arraigo mientras seas solicitante (art. 126.a). Consulta con una ONG antes de tomar decisiones.",
    );
  }
  if (anios === 0) {
    return { tipo, fechaDesde: null, yaCumple: true, diasRestantes: 0, avisos };
  }
  const fechaDesde = sumarAnios(inicioPermanencia, anios);
  const diasRestantes = Math.max(0, diferenciaDias(hoy, fechaDesde));
  avisos.push(
    "La permanencia debe ser continuada y tendrás que demostrarla con documentos (padrón, citas médicas, etc.).",
  );
  return { tipo, fechaDesde, yaCumple: diasRestantes === 0, diasRestantes, avisos };
}

/* -------------------------------------------------------------------------- */
/* 2. Nacionalidad por residencia: art. 22 del Código Civil                   */
/* -------------------------------------------------------------------------- */

export type SupuestoNacionalidad = "general" | "refugiado" | "iberoamericano-y-otros" | "un-anio";

export const ANIOS_NACIONALIDAD: Record<SupuestoNacionalidad, number> = {
  general: 10,
  refugiado: 5,
  "iberoamericano-y-otros": 2,
  "un-anio": 1,
};

export function calcularNacionalidad(params: {
  supuesto: SupuestoNacionalidad;
  /** Inicio de la residencia LEGAL y continuada en España. */
  inicioResidenciaLegal: FechaISO;
  hoy: FechaISO;
}): { fechaDesde: FechaISO; yaCumple: boolean; diasRestantes: number } {
  parseFecha(params.hoy);
  const fechaDesde = sumarAnios(params.inicioResidenciaLegal, ANIOS_NACIONALIDAD[params.supuesto]);
  const diasRestantes = Math.max(0, diferenciaDias(params.hoy, fechaDesde));
  return { fechaDesde, yaCumple: diasRestantes === 0, diasRestantes };
}

/* -------------------------------------------------------------------------- */
/* 3. Renovación / prórroga de autorizaciones temporales                      */
/*    Arts. 80.1, 86.1 y 132.3 del Reglamento: se pide en los 2 meses          */
/*    anteriores al vencimiento; también hasta 3 meses después, pero con       */
/*    posible procedimiento sancionador (art. 52.b LO 4/2000).                 */
/* -------------------------------------------------------------------------- */

export type EstadoRenovacion = "demasiado-pronto" | "en-plazo" | "fuera-de-plazo-con-sancion" | "caducada";

export interface ResultadoRenovacion {
  abreVentana: FechaISO;
  caducidad: FechaISO;
  limiteTardio: FechaISO;
  estado: EstadoRenovacion;
}

export function calcularRenovacion(params: { caducidad: FechaISO; hoy: FechaISO }): ResultadoRenovacion {
  const { caducidad, hoy } = params;
  const abreVentana = sumarMeses(caducidad, -2);
  const limiteTardio = sumarMeses(caducidad, 3);
  let estado: EstadoRenovacion;
  if (diferenciaDias(abreVentana, hoy) < 0) estado = "demasiado-pronto";
  else if (diferenciaDias(hoy, caducidad) >= 0) estado = "en-plazo";
  else if (diferenciaDias(hoy, limiteTardio) >= 0) estado = "fuera-de-plazo-con-sancion";
  else estado = "caducada";
  return { abreVentana, caducidad, limiteTardio, estado };
}

/* -------------------------------------------------------------------------- */
/* 4. Plazos de un mes desde una notificación                                 */
/*    - Pedir la TIE tras la concesión: 1 mes (art. 130.6 y 209.1 Reglamento) */
/*    - Recurso de reposición: 1 mes (art. 124.1 Ley 39/2015)                 */
/*    - Recurso contencioso: 2 meses (art. 46.1 Ley 29/1998). Ojo: en vía      */
/*      judicial agosto es inhábil; aquí no se calcula ese ajuste.            */
/* -------------------------------------------------------------------------- */

export type TipoPlazo = "tie" | "reposicion" | "contencioso";

export const MESES_PLAZO: Record<TipoPlazo, number> = {
  tie: 1,
  reposicion: 1,
  contencioso: 2,
};

export function calcularPlazoNotificacion(params: { tipo: TipoPlazo; notificacion: FechaISO }) {
  const { fecha, desplazadoPorFinDeSemana } = finPlazoMeses(params.notificacion, MESES_PLAZO[params.tipo]);
  const avisos: string[] = [
    "No se tienen en cuenta festivos nacionales, autonómicos ni locales: si el último día es festivo, el plazo pasa al siguiente día hábil.",
  ];
  if (params.tipo === "contencioso") {
    avisos.push(
      "En los plazos judiciales el mes de agosto no cuenta. Para un recurso contencioso, confirma siempre la fecha con un abogado (puedes pedir uno gratis de oficio).",
    );
  }
  return { fechaLimite: fecha, desplazadoPorFinDeSemana, avisos };
}
