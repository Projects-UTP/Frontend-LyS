# Validación inicial

Fecha: 4 de octubre de 2026. Alcance: fundación frontend y tipografía; no valida operaciones del restaurante todavía inexistentes.

## Resultados locales

- Build TypeScript/Vite: correcto.
- ESLint: correcto.
- Auditoría `npm audit --omit=dev`: cero vulnerabilidades.
- Chromium con Playwright, página compilada: 320, 375, 768, 1024, 1440 y 3840 px sin overflow horizontal.
- Cuatro pesos reales de Inter y Bebas Neue 400 cargados desde cinco archivos WOFF2 locales; cero recursos externos.
- Foco de teclado visible y enlace telefónico correcto.
- Texto ampliado al 200% a 320 px sin overflow; se corrigió el desbordamiento detectado en la primera pasada.
- `prefers-reduced-motion: reduce` respetado.
- Cero errores JavaScript en las pasadas.
- Archivos de entorno y vinculación administrativa excluidos de Git.

Las capturas móvil/desktop y el resultado JSON se conservan en la carpeta de artefactos de esta conversación, sin credenciales ni información privada. Se inspeccionó visualmente la captura móvil.

## Límites

No equivale a una auditoría completa WCAG, pruebas de carga, objetivos Lighthouse, pruebas de módulos operativos o CI ejecutada en GitHub. Bakso Sapi no está cargada: el H1 usa el fallback documentado.

Los cinco avisos altos de `npm audit` completo corresponden a dependencias de desarrollo de Tailwind 3.4.19. Se mantienen como deuda explícita en `SCRUM.md` de la raíz compartida, antes de producción. La CI comprueba dependencias de producción, sin ocultar el resultado completo documentado.
