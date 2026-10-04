# Sistema tipográfico — Leñas y Sabores

## Inspección inicial

El repositorio contenía solamente `README.md`: sin React, estilos, Tailwind, fuentes ni dependencias. Se creó una base React/TypeScript/Vite con Tailwind 3.4 y tokens reutilizables, conservando el README original como punto de entrada.

## Familias y uso

Refinamiento posterior de la Home: la referencia aportada el 4 de octubre usa titulares editoriales. Se incorpora `--font-editorial` en `publico.css`: Bakso Sapi con fallback Georgia/serif del sistema para estos títulos y cards. No descarga otra fuente ni presupone la licencia de Bakso. `--font-display` conserva el fallback previo para componentes existentes; Inter y Bebas Neue mantienen sus funciones. Esta variación responde a la nueva referencia visual del usuario.

| Token / clase                     | Familia                               | Pesos normales                   | Uso                                                                         | Evitar                                                       |
| --------------------------------- | ------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `--font-display` / `font-display` | Bakso Sapi; temporalmente Arial Black | 400 cuando se apruebe el archivo | Hero, titulares de marca y promociones grandes                              | Párrafos, tablas, formularios y módulos operativos           |
| `--font-heading` / `font-heading` | Bebas Neue                            | 400, único peso disponible       | Categorías, precios, CTA, títulos secundarios                               | Párrafos largos y texto pequeño                              |
| `--font-body` / `font-body`       | Inter                                 | 400, 500, 600, 700               | Navegación, descripciones, formularios, caja, cocina, inventario y reportes | Sustituirla por fuentes decorativas en interfaces operativas |

Los fallbacks se centralizan en `src/shared/styles/tokens.css`. Tailwind los consume desde `tailwind.config.js`; los componentes no repiten nombres de familias. Bebas Neue no tiene un peso bold real: no usar `font-bold` para simularlo.

## Archivos y licencias

Inter y Bebas Neue se distribuyen localmente mediante `@fontsource/inter` y `@fontsource/bebas-neue` (versiones fijadas en `package-lock.json`). Fontsource distribuye los archivos de Google Fonts; se verificó `metadata.json` y `LICENSE` de ambos paquetes. Las licencias completas se conservan en `public/licenses/`.

Fuentes originales:

- Inter: <https://rsms.me/inter/> y <https://github.com/rsms/inter/blob/master/LICENSE.txt>.
- Bebas Neue: <https://github.com/dharmatype/Bebas-Neue> y <https://github.com/google/fonts/blob/main/ofl/bebasneue/OFL.txt>.
- Distribución local: <https://fontsource.org/fonts/inter> y <https://fontsource.org/fonts/bebas-neue>.

Ambas están bajo SIL Open Font License 1.1, que permite incrustación y distribución con software conservando los avisos de licencia. Se utilizan archivos originales de la distribución, sin conversión.

**Bakso Sapi pendiente:** no se descargó, convirtió ni incorporó ningún archivo. El token reserva el nombre, pero el navegador usa `Arial Black` como fallback. Para activar la fuente, aportar archivo legalmente obtenido y licencia que autorice explícitamente uso web comercial y conversión si fuera necesaria. Ubicación prevista: `src/assets/fonts/bakso-sapi/`. Incorporar `@font-face` solo cuando se verifique esa autorización. El fallback no reproduce la apariencia de Bakso Sapi.

Barbecue Chicken, Hot Restaurant, Brushshop y Lemon Milk quedan como opciones gráficas futuras, sin carga ni archivos incorporados.

## Carga y rendimiento

`src/shared/styles/fonts.css` declara cinco `@font-face` locales WOFF2: Inter 400–700 y Bebas Neue 400. Todas usan `font-display: swap`. El subconjunto latino cubre ñ, tildes y signos de apertura del español. Se ampliará solo si un idioma posterior lo requiere.

Vite genera URLs con hash; el navegador descarga únicamente los pesos usados en la página. No hay consultas a Google Fonts en tiempo de ejecución, JavaScript de carga ni preload indiscriminado. No se añadieron preloads: requieren evidencia de mejora en las métricas.

## Jerarquía y colores

- Hero: `font-display text-display`; 40–72 px fluidos con `clamp`, interlineado 1.1.
- H2: `font-heading text-heading`; 36–48 px fluidos, interlineado 1.15.
- H3/categorías: Bebas Neue, 24–32 px.
- Precio: Bebas Neue regular; moneda `PEN` y locale `es-PE` al implementar el catálogo.
- CTA: Bebas Neue a 24 px, objetivo táctil mínimo 44 px y foco visible.
- Body: Inter, 16–18 px, interlineado 1.625; secundario 14–16 px.
- Operación: Inter como base; nunca aplicar `font-display` a caja, cocina, administración o tablas.

Paleta: rojo `#C81018`, rojo oscuro `#8F1015`, rojo suave `#FBEAEC`, texto `#171717`, secundario `#5E5E5E`, fondo predominante `#FFFFFF`. Los colores de marca tienen clases `brand-red-50/500/700`; los textos utilizan `neutral-950/600`. Mantener blanco predominante y reservar el rojo para CTA y acentos.

## Verificación

Ejecutar `npm run build`, `npm run lint` y revisar fuentes efectivamente cargadas, zoom, foco y ausencia de scroll horizontal entre 320 px y 3840 px. No dar por concluida la integración de Bakso Sapi hasta resolver la licencia y verificar su archivo en navegador.
