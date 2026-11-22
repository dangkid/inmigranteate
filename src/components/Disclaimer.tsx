import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { formatFecha } from "@/lib/formato";

/** Aviso obligatorio en cada página de contenido: orientativo + fecha + fuente oficial. */
export function Disclaimer({
  locale,
  t,
  ultimaVerificacion,
  fuenteOficial,
}: {
  locale: Locale;
  t: Messages;
  ultimaVerificacion?: string;
  fuenteOficial?: { titulo: string; url: string };
}) {
  return (
    <aside className="notice disclaimer" aria-label={t.disclaimer.titulo}>
      <p>
        <strong>{t.disclaimer.titulo}</strong> {t.disclaimer.texto}
      </p>
      {(ultimaVerificacion || fuenteOficial) && (
        <p className="small">
          {ultimaVerificacion && (
            <>
              {t.common.ultimaVerificacion}: <time dateTime={ultimaVerificacion}>{formatFecha(ultimaVerificacion, locale)}</time>.{" "}
            </>
          )}
          {fuenteOficial && (
            <>
              {t.common.fuenteOficial}:{" "}
              <a href={fuenteOficial.url} rel="noopener" target="_blank">
                {fuenteOficial.titulo}
              </a>
            </>
          )}
        </p>
      )}
    </aside>
  );
}
