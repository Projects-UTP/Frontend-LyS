# Refinamiento visual del inicio — Sprint 1

Petición del 4 de octubre de 2026: aproximar la portada a la referencia aportada por el usuario y usar el imagotipo real y las nuevas fotografías. Permanece dentro de la web pública; no inicia Sprint 2.

## Dirección y cambios

Web gastronómica cálida, fondo claro, rojo de marca, titulares artesanales y fotografía protagonista. Composición según la referencia; variación 5, movimiento 2, densidad 5. CSS propio sobre el sistema existente, sin nuevas dependencias. El pie oscuro y las filas de contenido siguen la referencia solicitada.

- Imagotipo original en navbar y variante blanca en footer, sin reconstruir la marca con texto.
- Banner continuo con titular «Sabor peruano en cada brasa», dos acciones y horario. Encuadre adaptado y motivos del propio banner en escritorio; composición apilada en tablet/móvil para proteger la lectura.
- Tres presentaciones fotografiadas y cinco categorías con imágenes, marca/modalidades, local y cierre de contacto. Se reemplazaron las ilustraciones de platos por las fotos suministradas.
- Datos reales de Carabayllo; fotografía gastronómica referencial en la sección del local. No se presenta una imagen ficticia del establecimiento.
- Sin precios, descuentos, carrito, contador de compra, sedes, suscripción ni redes ficticias de la maqueta. Las muestras siguen identificadas y la consulta utiliza WhatsApp.

## Recursos

31 WebP, 1.50 MB en conjunto, incluyendo el catálogo-v2 disponible en la carpeta indicada. Solo se descargan las imágenes mostradas. El inventario `public/images/recursos.json` registra nombres originales, dimensiones y tamaños. `scripts/preparar-recursos.py` permite repetir la optimización con Python/Pillow y la carpeta fuente; solo reduce dimensiones y comprime, sin retocar contenido. Originales permanecen en la carpeta del usuario. Las variantes existentes del banner se reutilizan. No hizo falta generar imágenes.

Corrección solicitada por el usuario: Bakso Sapi real en titulares principales como arte rasterizado accesible, Bebas Neue en categorías/productos/CTA e Inter en párrafos y navegación. Se retiró Georgia. Ver docs/design-system/tipografia.md para implementación y alcance de licencia.

## Validación

Lint, TypeScript, 2 pruebas Vitest, build y 6 E2E correctos. E2E ampliados para verificar imagotipo y carga de fotografías. Once anchos entre 320 y 3840 px y texto al 200% sin desbordamiento; menú, foco, rutas, 404 y movimiento reducido correctos. Axe sin hallazgos en inicio, carta, contacto y 404 a 1440 y 390 px. Capturas revisadas de 390, 768, 1024 y 1440 px en test-results (ignoradas por Git). Las pruebas automáticas complementan la inspección visual, no certifican WCAG.

Se corrigieron superposición de titular/fotografía, duplicación visual del fondo y encuadre tablet durante QA. Bundle aproximado: 276 kB JS (87.5 kB gzip), 21 kB CSS (5.3 kB gzip). Mantener los pendientes comerciales, legales, Cloudinary, licencia Bakso y despliegue documentados en Sprint 1.
