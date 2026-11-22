import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { formatFecha } from "@/lib/formato";
import { Icon } from "./Icon";

/**
 * Aviso obligatorio en cada página de contenido: orientativo + fecha + fuente oficial.
 * `compact` lo reduce a una línea para no tapar el contenido (guías).
 */
export function Disclaimer({
  locale,
  t,
  ultimaVerificacion,
  fuenteOficial,
  compact = false,
}: {
  locale: Locale;
  t: Messages;
  ultimaVerificacion?: string;
  fuenteOficial?: { titulo: string; url: string };
  compact?: boolean;
}) {
  return (
    <aside className={`notice disclaimer${compact ? " notice-slim" : ""}`} aria-label={t.disclaimer.titulo}>
      <Icon name="shield" size={compact ? 18 : 22} className="icon" />
      <div>
        <p>
          <strong>{t.disclaimer.titulo}</strong>
          {!compact && <> {t.disclaimer.texto}</>}
          {compact && <> Comprueba siempre la fuente oficial antes de presentar nada.</>}
        </p>
        {!compact && (ultimaVerificacion || fuenteOficial) && (
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
      </div>
    </aside>
  );
}
