import type { NextConfig } from "next";

/**
 * Dos modos de build:
 *  - Por defecto: exportación ESTÁTICA (carpeta /out). Es la que se sube a Cloudflare Pages,
 *    GitHub Pages, Netlify… (hosting gratuito). Las cabeceras y la redirección de "/" van en
 *    public/_headers y public/_redirects.
 *  - BUILD_TARGET=standalone: servidor Node autocontenido para la imagen Docker.
 */
const standalone = process.env.BUILD_TARGET === "standalone";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(standalone
    ? {
        output: "standalone" as const,
        outputFileTracingIncludes: { "/**": ["./content/**/*"] },
        async redirects() {
          return [{ source: "/", destination: "/es", permanent: false }];
        },
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
              ],
            },
          ];
        },
      }
    : { output: "export" as const }),
};

export default nextConfig;
