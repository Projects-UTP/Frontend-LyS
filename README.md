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

La página inicial permite validar la identidad tipográfica y contactar por teléfono con los datos proporcionados. No implementa todavía catálogo, carrito ni pedidos. La fábrica `crearClienteInsforge` conecta el SDK cuando un dominio lo requiera; no ejecuta operaciones de negocio al abrir la página.

React Router, TanStack Query, Zustand, React Hook Form y Zod forman parte de la arquitectura prevista; se instalarán al usarlos, evitando dependencias sin función en este incremento.

Scrum y arquitectura compartidos: `../SCRUM.md` y `../ARQUITECTURA.md`.
