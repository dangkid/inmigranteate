"use client";

import { useId, useState, type ReactNode } from "react";
import {
  calcularArraigo,
  calcularNacionalidad,
  calcularPlazoNotificacion,
  calcularRenovacion,
  type SupuestoNacionalidad,
  type TipoArraigo,
  type TipoPlazo,
} from "@/lib/calculadoras/calculos";
import { esFechaValida } from "@/lib/calculadoras/fechas";

function hoyISO(): string {
  const d = new Date();
  // Fecha local del usuario, no UTC.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

function Campo({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {hint && <span className="hint"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Resultado({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="status" aria-live="polite">
      {children}
    </div>
  );
}

function Fallo({ msg }: { msg: string }) {
  return (
    <div className="notice notice-danger" role="alert">
      <p>{msg}</p>
    </div>
  );
}

/* --------------------------------- Arraigo -------------------------------- */
function CalcArraigo() {
  const id = useId();
  const [tipo, setTipo] = useState<TipoArraigo>("sociolaboral");
  const [inicio, setInicio] = useState("");
  const [asilo, setAsilo] = useState(false);
  let out: ReactNode = null;
  let r: ReturnType<typeof calcularArraigo> | null = null;
  let fallo = "";
  if (inicio) {
    if (!esFechaValida(inicio)) fallo = "Escribe una fecha válida.";
    else {
      try {
        r = calcularArraigo({ tipo, inicioPermanencia: inicio, hoy: hoyISO(), fueSolicitanteAsilo: asilo });
      } catch (e) {
        fallo = (e as Error).message;
      }
    }
  }
  if (fallo) out = <Fallo msg={fallo} />;
  else if (r) {
    out = (
      <Resultado>
        {r.fechaDesde === null ? (
          <p>El arraigo familiar <strong>no exige un tiempo mínimo</strong> de permanencia en España.</p>
        ) : r.yaCumple ? (
          <p>
            Cumples los 2 años de permanencia desde el <strong>{fmt(r.fechaDesde)}</strong>. Por tiempo, ya podrías pedirlo
            (revisa el resto de requisitos).
          </p>
        ) : (
          <p>
            Cumplirás los 2 años el <strong>{fmt(r.fechaDesde)}</strong>. Faltan <strong>{r.diasRestantes} días</strong>.
          </p>
        )}
        <ul className="small">{r.avisos.map((a) => <li key={a}>{a}</li>)}</ul>
      </Resultado>
    );
  }
  return (
    <section id="arraigo" className="card section">
      <h2>¿Desde cuándo puedo pedir el arraigo?</h2>
      <p className="small muted">Base legal: art. 126.b) del Reglamento de Extranjería (RD 1155/2024).</p>
      <Campo id={`${id}-tipo`} label="Tipo de arraigo">
        <select id={`${id}-tipo`} value={tipo} onChange={(e) => setTipo(e.target.value as TipoArraigo)}>
          <option value="sociolaboral">Sociolaboral</option>
          <option value="social">Social</option>
          <option value="socioformativo">Socioformativo</option>
          <option value="segunda-oportunidad">Segunda oportunidad</option>
          <option value="familiar">Familiar</option>
        </select>
      </Campo>
      <Campo id={`${id}-inicio`} label="¿Desde qué fecha vives en España sin salir?" hint="la fecha que puedas demostrar">
        <input id={`${id}-inicio`} className="input" type="date" value={inicio} max={hoyISO()} onChange={(e) => setInicio(e.target.value)} />
      </Campo>
      <div className="field">
        <label style={{ fontWeight: 400, display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={asilo} onChange={(e) => setAsilo(e.target.checked)} /> He sido solicitante de asilo durante ese tiempo
        </label>
      </div>
      {out}
    </section>
  );
}

/* ------------------------------- Nacionalidad ------------------------------ */
function CalcNacionalidad() {
  const id = useId();
  const [supuesto, setSupuesto] = useState<SupuestoNacionalidad>("general");
  const [inicio, setInicio] = useState("");
  let out: ReactNode = null;
  if (inicio) {
    if (!esFechaValida(inicio)) out = <Fallo msg="Escribe una fecha válida." />;
    else {
      const r = calcularNacionalidad({ supuesto, inicioResidenciaLegal: inicio, hoy: hoyISO() });
      out = (
        <Resultado>
          {r.yaCumple ? (
            <p>
              Cumples el tiempo de residencia desde el <strong>{fmt(r.fechaDesde)}</strong>.
            </p>
          ) : (
            <p>
              Cumplirás el tiempo de residencia el <strong>{fmt(r.fechaDesde)}</strong> (faltan {r.diasRestantes} días).
            </p>
          )}
          <p className="small">
            La residencia debe ser <strong>legal, continuada e inmediatamente anterior</strong> a la solicitud (art. 22.3 del
            Código Civil). El tiempo sin autorización no cuenta. Además se exige buena conducta e integración (exámenes DELE y CCSE, salvo exenciones).
          </p>
        </Resultado>
      );
    }
  }
  return (
    <section id="nacionalidad" className="card section">
      <h2>¿Cuándo puedo pedir la nacionalidad?</h2>
      <p className="small muted">Base legal: art. 22 del Código Civil.</p>
      <Campo id={`${id}-sup`} label="Tu caso">
        <select id={`${id}-sup`} value={supuesto} onChange={(e) => setSupuesto(e.target.value as SupuestoNacionalidad)}>
          <option value="general">General: 10 años</option>
          <option value="refugiado">Con estatuto de refugiado: 5 años</option>
          <option value="iberoamericano-y-otros">Nacional de origen de país iberoamericano, Andorra, Filipinas, Guinea Ecuatorial o Portugal, o sefardí: 2 años</option>
          <option value="un-anio">Supuestos de 1 año (nacido en España, casado con español, etc.)</option>
        </select>
      </Campo>
      <Campo id={`${id}-ini`} label="Fecha de inicio de tu residencia legal" hint="normalmente, la de tu primera autorización de residencia">
        <input id={`${id}-ini`} className="input" type="date" value={inicio} max={hoyISO()} onChange={(e) => setInicio(e.target.value)} />
      </Campo>
      {out}
    </section>
  );
}

/* -------------------------------- Renovación ------------------------------- */
function CalcRenovacion() {
  const id = useId();
  const [cad, setCad] = useState("");
  let out: ReactNode = null;
  if (cad) {
    if (!esFechaValida(cad)) out = <Fallo msg="Escribe una fecha válida." />;
    else {
      const r = calcularRenovacion({ caducidad: cad, hoy: hoyISO() });
      const estado = {
        "demasiado-pronto": "Todavía es pronto para pedirla.",
        "en-plazo": "Estás en plazo: puedes pedirla ya.",
        "fuera-de-plazo-con-sancion": "Ya ha caducado, pero aún puedes pedirla. Te pueden abrir un expediente de multa.",
        caducada: "Han pasado más de 3 meses desde la caducidad. Consulta con una ONG o un abogado qué opciones tienes.",
      }[r.estado];
      out = (
        <Resultado>
          <p>
            <strong>{estado}</strong>
          </p>
          <ul>
            <li>Plazo normal: del <strong>{fmt(r.abreVentana)}</strong> al <strong>{fmt(r.caducidad)}</strong>.</li>
            <li>Plazo tardío (con posible multa): hasta el <strong>{fmt(r.limiteTardio)}</strong>.</li>
          </ul>
          <p className="small">
            Si la pides dentro del plazo, tu autorización sigue valiendo hasta que te contesten. Guarda el justificante de presentación.
          </p>
        </Resultado>
      );
    }
  }
  return (
    <section id="renovacion" className="card section">
      <h2>¿Cuándo tengo que renovar?</h2>
      <p className="small muted">
        Base legal: arts. 80.1, 86.1 y 132.3 del Reglamento (autorizaciones temporales y arraigos). Para otras autorizaciones los plazos pueden ser distintos.
      </p>
      <Campo id={`${id}-cad`} label="Fecha de caducidad de tu autorización o tarjeta">
        <input id={`${id}-cad`} className="input" type="date" value={cad} onChange={(e) => setCad(e.target.value)} />
      </Campo>
      {out}
    </section>
  );
}

/* --------------------------- Plazos desde notificación --------------------------- */
function CalcPlazos() {
  const id = useId();
  const [tipo, setTipo] = useState<TipoPlazo>("tie");
  const [noti, setNoti] = useState("");
  let out: ReactNode = null;
  if (noti) {
    if (!esFechaValida(noti)) out = <Fallo msg="Escribe una fecha válida." />;
    else {
      const r = calcularPlazoNotificacion({ tipo, notificacion: noti });
      out = (
        <Resultado>
          <p>
            Último día: <strong>{fmt(r.fechaLimite)}</strong>
            {r.desplazadoPorFinDeSemana && " (se ha pasado al lunes porque el plazo terminaba en fin de semana)"}.
          </p>
          <ul className="small">{r.avisos.map((a) => <li key={a}>{a}</li>)}</ul>
          <p className="small">No apures: presenta con margen y guarda siempre el justificante.</p>
        </Resultado>
      );
    }
  }
  return (
    <section id="plazos" className="card section">
      <h2>Plazos que empiezan con una notificación</h2>
      <p className="small muted">
        Base legal: arts. 130.6 y 209.1 del Reglamento (TIE), art. 124 de la Ley 39/2015 (reposición), art. 46 de la Ley 29/1998 (contencioso). Cómputo según el art. 30 de la Ley 39/2015.
      </p>
      <Campo id={`${id}-tipo`} label="¿Qué plazo quieres calcular?">
        <select id={`${id}-tipo`} value={tipo} onChange={(e) => setTipo(e.target.value as TipoPlazo)}>
          <option value="tie">Pedir la TIE (huellas) tras la concesión: 1 mes</option>
          <option value="reposicion">Recurso de reposición contra una denegación expresa: 1 mes</option>
          <option value="contencioso">Recurso contencioso-administrativo: 2 meses</option>
        </select>
      </Campo>
      <Campo id={`${id}-noti`} label="Fecha en que recibiste la notificación">
        <input id={`${id}-noti`} className="input" type="date" value={noti} max={hoyISO()} onChange={(e) => setNoti(e.target.value)} />
      </Campo>
      {out}
    </section>
  );
}

export function Calculadoras() {
  return (
    <div className="readable" style={{ display: "grid", gap: "1.2rem" }}>
      <CalcArraigo />
      <CalcRenovacion />
      <CalcPlazos />
      <CalcNacionalidad />
    </div>
  );
}
