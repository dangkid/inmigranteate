# Inmigranteate

Web gratuita y abierta que explica, paso a paso y en lenguaje sencillo, los trámites de extranjería en España.

- **Solo inmigración legal y regular.** No se dan atajos ni nada que pueda considerarse fraude.
- **Exactitud por encima de todo.** Cada dato tiene su fuente y su fecha de verificación. Lo que no está confirmado se marca como `pendiente_de_verificar`.
- **Privacidad.** Sin registro, sin cookies de seguimiento y sin scripts de terceros. El asistente, el buscador, las calculadoras y las listas de comprobación funcionan en el navegador.

## Stack

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Todas las páginas se generan estáticas en el build (SSG): rápidas, indexables y baratas de servir |
| Contenido | Markdown con frontmatter YAML en `/content`, validado con Zod | Versionado en Git, revisable en pull requests y sin base de datos |
| Buscador | MiniSearch en el cliente | Sin servidor de búsqueda; no se envían las consultas a ningún sitio |
| Tests | Vitest | Calculadoras, árbol del asistente y validación de **todo** el contenido |
| Despliegue | Exportación estática en Cloudflare Pages (gratis); Docker opcional (`BUILD_TARGET=standalone`) | Sin servidor que mantener ni pagar |
| Estilos | Un único CSS sin frameworks ni fuentes externas | Ligero para móviles con pocos datos; propiedades lógicas para árabe y urdu (RTL) |

## Desarrollo

Requisitos: Node.js 20.9 o superior (se recomienda la versión LTS).

```bash
npm install
npm run dev        # http://localhost:3000/es
npm test           # tests (calculadoras, asistente, contenido)
npm run check      # typecheck + lint + tests
npm run build      # build de producción
npm run revision   # informe de fichas que hay que revisar
```

## Despliegue gratuito (recomendado)

La web se exporta como **sitio estático** (`npm run build` genera la carpeta `out/`). Se publica gratis en
Cloudflare Pages, con despliegue automático en cada `git push`. Guía paso a paso en **[DESPLIEGUE.md](DESPLIEGUE.md)**.

## Despliegue con Docker (alternativa en servidor propio)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://tu-dominio.es \
  --build-arg NEXT_PUBLIC_REPORT_EMAIL=correo@tu-dominio.es \
  --build-arg NEXT_PUBLIC_REPO_URL=https://github.com/tu-org/inmigranteate \
  -t inmigranteate .

docker run -p 3000:3000 inmigranteate
# o bien:
docker compose up -d --build
```

El build de la imagen **ejecuta los tests**. Si una ficha no cumple el esquema, la imagen no se construye.

| Variable (en el build) | Para qué |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública: se usa en el sitemap, las URL canónicas y los datos estructurados |
| `NEXT_PUBLIC_REPORT_EMAIL` | Correo que reciben los reportes de información desactualizada (opcional) |
| `NEXT_PUBLIC_REPO_URL` | Repositorio público: si existe, los reportes se abren como issue (opcional) |

Pon delante un proxy inverso con HTTPS y compresión gzip o brotli (Caddy, Nginx, Traefik…).

> Como las páginas son estáticas, el aviso de "revisión vencida" (más de 90 días) se calcula en el build. **Reconstruye al menos una vez por semana** o cada vez que cambie el contenido (en Cloudflare lo hace el workflow `rebuild-semanal.yml`).

## Estructura

```
content/
  tramites/<slug>.md      fichas de trámites (una por archivo; _plantilla.md es la plantilla)
  glosario.md             términos del glosario
  novedades/*.md          cambios normativos
  paginas/*.md            páginas editoriales (estafas, ayuda, sobre, privacidad, aviso-legal)
  normativa/              informes internos de estado normativo (no se publican)
  i18n/<locale>/...       traducciones revisadas (mismo nombre de archivo que el original)
src/
  app/[locale]/...        rutas
  components/             interfaz (Ficha, Asistente, Buscador, Calculadoras, Checklist…)
  content/                esquema (schema.ts), carga (load.ts) y test del contenido
  lib/asistente/          árbol de decisión (arbol.ts), motor y tests
  lib/calculadoras/       cálculo de fechas con su base legal y tests
  i18n/                   idiomas y textos de la interfaz
scripts/revision.mjs      informe de mantenimiento
docs/                     plan de investigación
```

## Cómo añadir o actualizar un trámite

1. Copia `content/tramites/_plantilla.md` a `content/tramites/<slug>.md`. El `slug` del frontmatter debe coincidir con el nombre del archivo.
2. Rellena cada campo **con tus palabras**, sin copiar textos literales ni incluir datos personales.
3. **Cada requisito** necesita al menos una fuente o un `pendiente_de_verificar` que explique qué falta. Los requisitos nunca pueden apoyarse solo en fuentes de nivel 3 (foros); el test lo comprueba.
4. Usa `estado: revisado` solo si **no** queda ningún `pendiente_de_verificar` (el test también lo comprueba).
5. Actualiza `ultima_verificacion` cada vez que contrastes la ficha con la fuente oficial.
6. Si la ficha cambia el resultado del asistente, edita `src/lib/asistente/arbol.ts`. El test valida que no haya ciclos ni enlaces rotos.
7. Ejecuta `npm run check` y abre un pull request.

### Niveles de fuente

| Nivel | Qué es | Uso |
|---|---|---|
| 1 | BOE, ministerios, sedes electrónicas, Policía, Instituto Cervantes… | Manda siempre |
| 2 | ONG, colegios de abogados, universidades, guías autonómicas | Contexto, errores frecuentes, casos frontera |
| 3 | Foros y comunidades | **Solo** tiempos reales, problemas y dudas frecuentes. Nunca para requisitos |

## Añadir un idioma

1. Crea `src/i18n/messages/<code>.ts` con la misma forma que `es.ts` y regístralo en `src/i18n/messages/index.ts`.
2. Añade las traducciones **revisadas por una persona** en `content/i18n/<code>/tramites/<slug>.md` (y el glosario y las páginas). Si una ficha no está traducida, se muestra en español con un aviso.
3. Pon `enabled: true` en `src/i18n/config.ts`. El árabe y el urdu ya están marcados como RTL.

## Mantenimiento (Fase 6)

- **Revisión periódica:** `npm run revision` ordena las fichas por urgencia (revisión vencida y número de datos pendientes). En CI se ejecuta cada lunes y falla si alguna ficha supera los 90 días.
- **Seguimiento del BOE:** suscripción a alertas de "Mi BOE" sobre la LO 4/2000, el RD 1155/2024, la Ley 12/2009 y el Código Civil (nacionalidad). Cada cambio se registra en `content/novedades/` y se revisan las fichas afectadas (campo `afecta`).
- **Reportes de usuarios:** el formulario abre un issue con la etiqueta `reporte-contenido` (o un correo). Flujo: triaje, contraste con fuente de Nivel 1, pull request con la ficha corregida y su nueva `ultima_verificacion`, y cierre del issue con el enlace a la fuente.

## Estado

MVP en construcción. Ver `docs/fase-1-plan-investigacion.md` y `content/normativa/estado-normativo-2026-11.md`.
