# Publicar Inmigranteate gratis (Cloudflare Pages)

La web es **100 % estática**: no necesita servidor ni base de datos. Por eso se puede alojar gratis,
con HTTPS, ancho de banda ilimitado y servidores repartidos por todo el mundo.

**Coste: 0 €.** (Solo costaría dinero tener un dominio propio como `inmigranteate.es`; no es necesario:
Cloudflare te da una dirección `nombre.pages.dev`.)

## Lo que necesitas (todo gratis)
1. Una cuenta de **GitHub** → https://github.com/signup
2. Una cuenta de **Cloudflare** → https://dash.cloudflare.com/sign-up

## Paso 1: subir el código a GitHub
1. En GitHub: **New repository**. Nombre: `inmigranteate`. Público (el proyecto es abierto).
   No marques «Add a README».
2. En la carpeta del proyecto, en una terminal (con tus datos reales en nombre y correo; GitHub permite
   usar un correo privado tipo `ID+usuario@users.noreply.github.com`, mira Settings → Emails):

```powershell
git config user.name  "Tu nombre o usuario"
git config user.email "tu-correo-de-github-o-noreply"
git add .
git commit -m "Primera versión de Inmigranteate"
git remote add origin https://github.com/TU-USUARIO/inmigranteate.git
git push -u origin main
```

> Ese nombre y correo quedan **públicos** en el historial del repositorio. Usa el correo noreply si no
> quieres exponer el tuyo.

## Paso 2: conectar Cloudflare Pages
1. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**. Autoriza GitHub y elige el repo.
2. Configuración de build:

| Campo | Valor |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm test && npm run build` |
| Build output directory | `out` |

3. En **Environment variables** (Production) añade:

| Variable | Valor |
|---|---|
| `NODE_VERSION` | `24` |
| `NEXT_PUBLIC_SITE_URL` | la URL final, p. ej. `https://inmigranteate.pages.dev` (sin barra final) |
| `NEXT_PUBLIC_REPO_URL` | `https://github.com/TU-USUARIO/inmigranteate` (activa el botón de reportes) |
| `NEXT_PUBLIC_REPORT_EMAIL` | opcional; correo que recibe reportes |

4. **Save and Deploy.** En 1-2 minutos tendrás la web en `https://<nombre>.pages.dev`.
5. Si la URL final es distinta de la que pusiste en `NEXT_PUBLIC_SITE_URL`, corrígela y pulsa **Retry deployment**.
   (Se usa en el sitemap y en las URL canónicas.)

Desde ahora, **cada `git push` publica automáticamente**. Si una ficha no cumple el esquema o falla un test,
el despliegue se detiene y la versión anterior sigue online.

## Paso 3: que se actualice sola cada semana (aviso de «revisión vencida»)
El aviso de «más de 90 días sin revisar» se calcula al construir. Para que se recalcule sin hacer commits:
1. Cloudflare → tu proyecto → **Settings → Builds & deployments → Deploy hooks → Add**. Copia la URL.
2. En GitHub → repo → **Settings → Secrets and variables → Actions → New secret**: nombre `CF_DEPLOY_HOOK`,
   valor la URL.
3. El workflow `.github/workflows/rebuild-semanal.yml` ya está incluido y la llamará cada lunes.

## Antes de anunciar la web
- [ ] Completar el titular y contacto en `content/paginas/privacidad.md` y `aviso-legal.md` (RGPD: hay que identificar al responsable).
- [ ] Resolver los datos «pendiente de verificar» de las fichas (`npm run revision` te dice cuántos hay).
- [ ] Comprobar en `https://<tu-url>/sitemap.xml` que las URL son las de producción y no `localhost`.
- [ ] Enviar el sitemap a Google Search Console (gratis).

## Alternativas gratuitas
- **Netlify** o **Vercel (plan Hobby)**: funcionan igual. Vercel Hobby no permite uso comercial; Cloudflare no
  tiene esa limitación ni límite de ancho de banda, por eso es la recomendada.
- **GitHub Pages**: gratis, pero sirve la web en una subruta (`usuario.github.io/inmigranteate`) y habría que
  configurar `basePath`; no la recomiendo.
- **Tu propio servidor con Docker**: ver README. Solo merece la pena si ya tienes uno.
