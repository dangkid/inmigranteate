# Publica la web en Cloudflare Pages (proyecto "inmigranteate").
# Uso (desde la raíz del proyecto):   powershell -ExecutionPolicy Bypass -File scripts/publicar.ps1
# Requisitos: haber hecho `npx wrangler@4 login` una vez.
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

$env:NEXT_PUBLIC_SITE_URL = "https://inmigranteate.pages.dev"
$env:NEXT_PUBLIC_REPO_URL = "https://github.com/dangkid/inmigranteate"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:WRANGLER_SEND_METRICS = "false"

Push-Location $raiz
try {
  npm test
  if ($LASTEXITCODE -ne 0) { throw "Los tests fallan: no se publica." }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "El build falla: no se publica." }
} finally { Pop-Location }

# Se ejecuta desde fuera del proyecto para que wrangler no toque ningún archivo del repositorio.
Push-Location $env:TEMP
try {
  npx --yes wrangler@4 pages deploy (Join-Path $raiz "out") --project-name inmigranteate --branch main --commit-dirty=true
} finally { Pop-Location }
