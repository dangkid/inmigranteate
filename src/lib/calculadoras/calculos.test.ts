import { describe, expect, it } from "vitest";
import {
  esFinDeSemana,
  finPlazoMeses,
  parseFecha,
  sumarAnios,
  sumarMeses,
} from "./fechas";
import {
  calcularArraigo,
  calcularNacionalidad,
  calcularPlazoNotificacion,
  calcularRenovacion,
} from "./calculos";

describe("fechas", () => {
  it("rechaza fechas inexistentes o mal formadas", () => {
    expect(() => parseFecha("2026-02-30")).toThrow();
    expect(() => parseFecha("30/01/2026")).toThrow();
  });

  it("suma meses de fecha a fecha y ajusta al último día del mes", () => {
    expect(sumarMeses("2026-01-15", 1)).toBe("2026-02-15");
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2028-01-31", 1)).toBe("2028-02-29"); // bisiesto
    expect(sumarMeses("2026-03-31", -1)).toBe("2026-02-28");
    expect(sumarMeses("2026-11-30", 3)).toBe("2027-02-28");
  });

  it("suma años con 29 de febrero", () => {
    expect(sumarAnios("2024-02-29", 2)).toBe("2026-02-28");
    expect(sumarAnios("2024-02-29", 4)).toBe("2028-02-29");
  });

  it("detecta fines de semana", () => {
    expect(esFinDeSemana("2026-11-21")).toBe(true); // sábado
    expect(esFinDeSemana("2026-11-23")).toBe(false); // lunes
  });

  it("traslada el fin de plazo al lunes si cae en fin de semana", () => {
    // 2026-10-21 + 1 mes = 2026-11-21 (sábado) → lunes 2026-11-23
    expect(finPlazoMeses("2026-10-21", 1)).toEqual({ fecha: "2026-11-23", desplazadoPorFinDeSemana: true });
    expect(finPlazoMeses("2026-10-20", 1)).toEqual({ fecha: "2026-11-20", desplazadoPorFinDeSemana: false });
  });
});

describe("calcularArraigo", () => {
  it("exige 2 años para el arraigo sociolaboral", () => {
    const r = calcularArraigo({ tipo: "sociolaboral", inicioPermanencia: "2024-11-21", hoy: "2026-11-21" });
    expect(r.fechaDesde).toBe("2026-11-21");
    expect(r.yaCumple).toBe(true);
    expect(r.diasRestantes).toBe(0);
  });

  it("cuenta los días que faltan", () => {
    const r = calcularArraigo({ tipo: "social", inicioPermanencia: "2025-01-01", hoy: "2026-11-21" });
    expect(r.fechaDesde).toBe("2027-01-01");
    expect(r.yaCumple).toBe(false);
    expect(r.diasRestantes).toBe(41);
  });

  it("el arraigo familiar no exige permanencia mínima", () => {
    const r = calcularArraigo({ tipo: "familiar", inicioPermanencia: "2026-11-01", hoy: "2026-11-21" });
    expect(r.fechaDesde).toBeNull();
    expect(r.yaCumple).toBe(true);
  });

  it("avisa si la persona fue solicitante de asilo", () => {
    const r = calcularArraigo({
      tipo: "social",
      inicioPermanencia: "2023-01-01",
      hoy: "2026-11-21",
      fueSolicitanteAsilo: true,
    });
    expect(r.avisos.some((a) => a.includes("126.b"))).toBe(true);
  });

  it("rechaza un inicio en el futuro", () => {
    expect(() => calcularArraigo({ tipo: "social", inicioPermanencia: "2027-01-01", hoy: "2026-11-21" })).toThrow();
  });
});

describe("calcularNacionalidad", () => {
  it.each([
    ["general", "2016-11-21"],
    ["refugiado", "2021-11-21"],
    ["iberoamericano-y-otros", "2024-11-21"],
    ["un-anio", "2025-11-21"],
  ] as const)("supuesto %s cumple hoy si empezó el %s", (supuesto, inicio) => {
    const r = calcularNacionalidad({ supuesto, inicioResidenciaLegal: inicio, hoy: "2026-11-21" });
    expect(r.fechaDesde).toBe("2026-11-21");
    expect(r.yaCumple).toBe(true);
  });

  it("calcula lo que falta en el régimen general", () => {
    const r = calcularNacionalidad({ supuesto: "general", inicioResidenciaLegal: "2020-03-01", hoy: "2026-11-21" });
    expect(r.fechaDesde).toBe("2030-03-01");
    expect(r.yaCumple).toBe(false);
  });
});

describe("calcularRenovacion", () => {
  const caducidad = "2027-03-31";
  it("ventana: 2 meses antes y hasta 3 meses después", () => {
    const r = calcularRenovacion({ caducidad, hoy: "2026-11-21" });
    expect(r.abreVentana).toBe("2027-01-31");
    expect(r.limiteTardio).toBe("2027-06-30");
  });
  it.each([
    ["2027-01-30", "demasiado-pronto"],
    ["2027-01-31", "en-plazo"],
    ["2027-03-31", "en-plazo"],
    ["2027-04-01", "fuera-de-plazo-con-sancion"],
    ["2027-06-30", "fuera-de-plazo-con-sancion"],
    ["2027-07-01", "caducada"],
  ] as const)("el %s el estado es %s", (hoy, estado) => {
    expect(calcularRenovacion({ caducidad, hoy }).estado).toBe(estado);
  });
});

describe("calcularPlazoNotificacion", () => {
  it("TIE: 1 mes desde la notificación", () => {
    expect(calcularPlazoNotificacion({ tipo: "tie", notificacion: "2026-01-15" }).fechaLimite).toBe("2026-02-16"); // 15/02/2026 es domingo
  });
  it("contencioso: 2 meses y aviso de agosto", () => {
    const r = calcularPlazoNotificacion({ tipo: "contencioso", notificacion: "2026-03-10" });
    expect(r.fechaLimite).toBe("2026-05-11"); // 10/05/2026 es domingo
    expect(r.avisos.some((a) => a.includes("agosto"))).toBe(true);
  });
});
