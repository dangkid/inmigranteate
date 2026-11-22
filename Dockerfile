# syntax=docker/dockerfile:1
# Imagen de producción de Inmigranteate (Next.js en modo standalone).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_TARGET=standalone
# Variables públicas que se incrustan en el build (ver README).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_REPORT_EMAIL=
ARG NEXT_PUBLIC_REPO_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_REPORT_EMAIL=$NEXT_PUBLIC_REPORT_EMAIL \
    NEXT_PUBLIC_REPO_URL=$NEXT_PUBLIC_REPO_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valida contenido y lógica antes de construir: si una ficha es inválida, la imagen no se crea.
RUN npm test && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/content ./content
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/es >/dev/null || exit 1
CMD ["node", "server.js"]
