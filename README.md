# Frontend-LyS

Aplicación de Leñas y Sabores. Base React, TypeScript, Vite y Tailwind 3.4, organizada en `src/app` y `src/shared`; los dominios se incorporarán a `src/features` cuando se desarrollen sus historias.

## Desarrollo

```powershell
npm ci
npm run dev
npm run lint
npm run build
```

Node 22.20 o superior compatible con Vite. Crear `.env.local` a partir de `.env.example` y obtener la clave **anon** desde la CLI del backend. Nunca usar claves administrativas en variables `VITE_`.

[Sistema tipográfico](docs/design-system/tipografia.md): Inter y Bebas Neue locales, WOFF2, `font-display: swap`, fallbacks y tokens de Tailwind. Bakso Sapi está pendiente de archivo con licencia web verificada.

La web pública del Sprint 1 incluye inicio, carta de muestra, promociones, nosotros, local, contacto y 404. Usa los recursos oficiales entregados y WhatsApp para contacto. Catálogo y promociones son muestras explícitas sin precios oficiales. La fábrica `crearClienteInsforge` conecta el SDK cuando un dominio lo requiera; no ejecuta operaciones de negocio al abrir la página.

React Router ya está integrado. TanStack Query, Zustand, React Hook Form y Zod se instalarán cuando sus dominios los requieran.

Validaciones adicionales: `npm run typecheck`, `npm test`; para navegador, `npx playwright install chromium`, `npm run build` y `npm run test:e2e`. [Entrega, pruebas, recursos y pendientes del Sprint 1](docs/sprint-1.md).

Scrum y arquitectura compartidos: `../SCRUM.md` y `../ARQUITECTURA.md`.
