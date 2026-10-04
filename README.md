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

[Sistema tipográfico](docs/design-system/tipografia.md): Inter y Bebas Neue locales; Bakso Sapi mediante arte rasterizado accesible, conforme a su licencia Desktop Only.

La web pública incluye inicio, promociones, nosotros, local, contacto y 404. `/carta` y `/carta/:slug` consultan el catálogo real de InsForge con categorías, búsqueda y disponibilidad; sus tres productos y precios están identificados como demostración. Se conservan los recursos oficiales y el contacto del local confirmado.

TanStack Query gestiona datos del servidor y React Hook Form/Zod validan formularios. Zustand queda instalado para el carrito del Sprint 3. [Catálogo y preparación Cloudinary](docs/catalogo.md). [Registro, login, recuperación y perfil privado](docs/autenticacion.md).

`/registro`, `/iniciar-sesion`, `/recuperar-acceso` y `/mi-cuenta` usan InsForge Auth. El proxy `/insforge` preserva cookies httpOnly y CSRF; el alojamiento final debe ofrecer el mismo proxy con HTTPS. La verificación de correo permanece habilitada. Las pruebas de correo usan fixtures; la entrega externa está pendiente de un buzón controlado. No se guardan contraseñas/JWT en localStorage.

Validaciones adicionales: `npm run typecheck`, `npm test`; para navegador, `npx playwright install chromium`, `npm run build` y `npm run test:e2e`. [Entrega, pruebas, recursos y pendientes del Sprint 1](docs/sprint-1.md).

Scrum y arquitectura compartidos: `../SCRUM.md` y `../ARQUITECTURA.md`.

[Refinamiento visual del inicio](docs/refinamiento-inicio.md): nueva referencia, imagotipo original, recursos fotográficos y validación responsive.
