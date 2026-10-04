# Sprint 1 — Web pública

Implementación de HU-WEB-001–011 de EP-02. La coordinación y los criterios detallados están en `../SCRUM.md`. Rama nacida de `dev`: `feature/sprint-1-web-publica`.

## Entrega

Inicio con portada, seis categorías de muestra, promociones, identidad, tres productos ilustrativos, modalidades y local/contacto. Encabezado con menú móvil, acceso a cuenta identificado como próximo y footer compartido. Rutas `/`, `/carta`, `/promociones`, `/nosotros`, `/locales`, `/contacto` y recuperación de rutas inexistentes.

WhatsApp y teléfonos utilizan los números confirmados. El enlace Cómo llegar abre una búsqueda de la dirección confirmada en Google Maps, sin SDK ni API. No se persisten pedidos. La navegación restablece foco al contenido; el menú admite Escape y devuelve el foco al botón.

## Contenido y recursos

`src/features/publico/contenido.ts` centraliza datos del negocio y mocks reemplazables. Categorías, productos y promociones son **muestras**, sin precios, descuentos ni disponibilidad oficiales. Las imágenes de parrilla y anticuchos deben reemplazarse por fotos oficiales; actualmente se usa una ilustración del isotipo. No se inventaron historia, premios ni redes sociales.

Banner e isotipo proporcionados por el usuario conservados en `src/assets`. Versiones WebP de desarrollo en `public/images`; banner de 1024 px: 95.7 kB; versión de 640 px: 37.1 kB; logo de 128 px: 8.5 kB. Imagen principal con prioridad alta y `srcset`; imágenes inferiores con lazy loading y dimensiones. Cloudinary queda pendiente de configuración para producción. Inter y Bebas Neue se sirven localmente; Bakso Sapi se presenta como arte rasterizado en los titulares principales; el archivo gratuito Desktop Only no se incrusta como webfont. Inter y Bebas Neue siguen locales.

## Verificación

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build` y `npm run test:e2e`. Playwright requiere `npx playwright install chromium` y build previo. Por defecto abre navegador; para entornos sin pantalla: `$env:CI='true'` en PowerShell. GitHub Actions utiliza ese modo automáticamente.

Seis pruebas E2E: portada/acciones, rutas/categoría vacía/404, menú móvil con teclado, desbordamientos de 320 a 3840 px y texto al 200%, análisis axe en escritorio/móvil y capturas con movimiento reducido. Capturas generadas en `test-results/` (ignorado por Git). La revisión automática de accesibilidad complementa teclado y revisión visual; no constituye una certificación WCAG.

Bundle inicial aproximado: JS 274 kB (87 kB gzip), CSS 16.6 kB (4.4 kB gzip). No se añadieron librerías de animación ni imágenes remotas. SEO inicial: títulos por ruta, descripción, favicon, OG básico y noindex para 404. URL canónica/imagen OG absoluta, SSR y SEO local avanzado requieren dominio y despliegue posterior.

## Pendientes antes de producción

- Carta, precios, disponibilidad, promociones y fotos oficiales.
- Licencia web de Bakso Sapi solo si se requiere texto dinámico con esa fuente; credenciales Cloudinary.
- Redes sociales, textos legales, libro de reclamaciones y dominio.
- Cinco avisos de seguridad de herramientas de desarrollo heredados de Tailwind 3; auditoría de dependencias de producción sin vulnerabilidades altas. Migración mayor requiere un cambio independiente.
- Configurar fallback SPA en hosting para rutas directas. No se ha desplegado producción.

Sprint 2 queda sin iniciar: catálogo real y autenticación deben refinarse con datos y reglas del negocio.
