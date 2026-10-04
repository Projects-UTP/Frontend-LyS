# Frontend-LyS

Aplicación de Leñas y Sabores. React, TypeScript, Vite y Tailwind 3.4, con catálogo, autenticación, pedidos y operación organizados por dominio en `src/features`.

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

TanStack Query gestiona datos del servidor, React Hook Form/Zod validan formularios y Zustand conserva el carrito saneado. [Catálogo y preparación Cloudinary](docs/catalogo.md). [Registro, login, recuperación y perfil privado](docs/autenticacion.md).

`/registro`, `/iniciar-sesion`, `/recuperar-acceso` y `/mi-cuenta` usan InsForge Auth. El proxy `/insforge` preserva cookies httpOnly y CSRF; el alojamiento final debe ofrecer el mismo proxy con HTTPS. La verificación de correo permanece habilitada. Las pruebas de correo usan fixtures; la entrega externa está pendiente de un buzón controlado. No se guardan contraseñas/JWT en localStorage.

Validaciones adicionales: `npm run typecheck`, `npm test`; para navegador, `npx playwright install chromium`, `npm run build` y `npm run test:e2e`. [Entrega, pruebas, recursos y pendientes del Sprint 1](docs/sprint-1.md).

Scrum y arquitectura compartidos: `../SCRUM.md` y `../ARQUITECTURA.md`.

Sprint 3: [carrito](docs/carrito.md), [checkout](docs/checkout.md) y [confirmación/seguimiento privados](docs/pedidos.md), con cotización monetaria backend y pago pendiente.

[Mesas, caja, KDS y entrega](docs/operacion.md), restringidos al personal asignado por local. Realtime emplea `/socket.io` y HTTP `/insforge`; ambos proxies deben configurarse con HTTPS en el alojamiento final. No se ha desplegado producción. Los eventos consultan una sola orden autorizada; recuperación por consulta moderada cada 30 segundos solo con la pestaña visible. No hay pagos online ni datos de tarjeta.

[Refinamiento visual del inicio](docs/refinamiento-inicio.md): nueva referencia, imagotipo original, recursos fotográficos y validación responsive.
