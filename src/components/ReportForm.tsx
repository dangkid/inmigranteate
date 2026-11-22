"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Formulario de reporte. NO envía nada a un servidor propio: prepara un correo
 * o un issue público en el repositorio, que la persona revisa y envía si quiere.
 * Se advierte de no incluir datos personales.
 */
export function ReportForm({ email, repoUrl }: { email: string; repoUrl: string }) {
  const params = useSearchParams();
  const [pagina, setPagina] = useState(params.get("pagina") ?? "");
  const [problema, setProblema] = useState("");
  const [fuente, setFuente] = useState("");
  const [error, setError] = useState("");

  const cuerpo = () =>
    [
      `Página: ${pagina || "(no indicada)"}`,
      "",
      "Qué está mal o desactualizado:",
      problema,
      "",
      `Fuente oficial que lo confirma: ${fuente || "(no indicada)"}`,
    ].join("\n");

  const titulo = () => `Información desactualizada: ${pagina || "página sin indicar"}`.slice(0, 120);

  const enviar = (via: "email" | "issue") => {
    if (problema.trim().length < 10) {
      setError("Explica brevemente qué está mal (al menos 10 caracteres).");
      return;
    }
    setError("");
    const url =
      via === "issue"
        ? `${repoUrl}/issues/new?labels=${encodeURIComponent("reporte-contenido")}&title=${encodeURIComponent(titulo())}&body=${encodeURIComponent(cuerpo())}`
        : `mailto:${email}?subject=${encodeURIComponent(titulo())}&body=${encodeURIComponent(cuerpo())}`;
    window.open(url, "_blank", "noopener");
  };

  const hayCanal = Boolean(email || repoUrl);

  return (
    <form className="readable" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="notice notice-warn">
        <p>
          <strong>No escribas datos personales</strong>: ni tu nombre, ni NIE, pasaporte, dirección o detalles de tu expediente.
          Solo necesitamos saber qué dato está mal y, si puedes, dónde lo has visto en una fuente oficial.
        </p>
      </div>
      <div className="field">
        <label htmlFor="r-pagina">Página o trámite</label>
        <input id="r-pagina" className="input" value={pagina} onChange={(e) => setPagina(e.target.value)} placeholder="Ej.: arraigo-social" />
      </div>
      <div className="field">
        <label htmlFor="r-problema">¿Qué está mal o desactualizado?</label>
        <textarea
          id="r-problema"
          className="input"
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "r-error" : undefined}
        />
        {error && (
          <p id="r-error" role="alert" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="r-fuente">
          Enlace a la fuente oficial <span className="hint">(opcional: BOE, Ministerio, sede electrónica…)</span>
        </label>
        <input id="r-fuente" className="input" type="url" value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="https://www.boe.es/..." />
      </div>
      {hayCanal ? (
        <div className="btn-row">
          {repoUrl && (
            <button type="button" className="btn" onClick={() => enviar("issue")}>
              Abrir reporte público
            </button>
          )}
          {email && (
            <button type="button" className={repoUrl ? "btn btn-secondary" : "btn"} onClick={() => enviar("email")}>
              Enviar por correo
            </button>
          )}
        </div>
      ) : (
        <div className="notice notice-danger">
          <p>El canal de reportes aún no está configurado en este despliegue (variables NEXT_PUBLIC_REPORT_EMAIL o NEXT_PUBLIC_REPO_URL).</p>
        </div>
      )}
      <p className="small muted">
        Cada reporte lo revisa una persona y se contrasta con una fuente oficial antes de cambiar la guía.
      </p>
    </form>
  );
}
