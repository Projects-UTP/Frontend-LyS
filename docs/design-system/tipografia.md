# Sistema tipográfico — Leñas y Sabores

La elección del usuario es Bakso Sapi + Bebas Neue + Inter. Se retiró el fallback Georgia del refinamiento anterior.

| Uso                                        | Familia    | Implementación                                                 |
| ------------------------------------------ | ---------- | -------------------------------------------------------------- |
| Hero y titulares principales               | Bakso Sapi | Arte rasterizado de frases completas, con texto HTML accesible |
| Categorías, productos, etiquetas y botones | Bebas Neue | WOFF2 local, peso 400                                          |
| Párrafos, navegación y formularios         | Inter      | WOFF2 local, pesos 400, 500, 600 y 700                         |

Los colores conservan los tokens existentes: rojo #C81018, oscuro #8F1015, suave #FBEAEC, negro #171717, gris #5E5E5E y blanco #FFFFFF.

## Bakso Sapi

La versión gratuita descargada de [DaFont](https://www.dafont.com/bakso_sapi.font) se identifica como Desktop Only por [Locomotype](https://locomotype.com/fonts/bakso-sapi-font/). Su [EULA](https://locomotype.com/eula/) permite imágenes rasterizadas en sitios web, pero no convertir esa versión a webfont ni distribuir el archivo instalable. Por eso no se incorpora un OTF/WOFF ni un @font-face de Bakso al repositorio.

`scripts/preparar-titulares-bakso.py` recibe un OTF obtenido localmente y, con Pillow, prepara 19 frases completas en PNG transparente de alta resolución. No exporta un catálogo de glifos. El archivo original permanece fuera del repositorio. `public/typography` contiene solamente el arte estático; `bakso-titulares.json` registra tamaños y nombres.

`BaksoText` mantiene el texto de cada título en HTML para lectores de pantalla y lo acompaña con el gráfico mediante máscara CSS, que permite conservar los colores de marca. Los gráficos ajustan su ancho en móvil; el modo de colores forzados muestra el texto HTML con Bebas Neue. Los titulares nuevos deben prepararse como arte o adquirir una licencia web adecuada antes de usar Bakso como fuente de texto dinámica. Una licencia web continúa pendiente únicamente para esa futura modalidad.

## Fuentes web

Inter y Bebas Neue ya estaban instaladas mediante @fontsource. `fonts.css` declara cinco WOFF2 locales con `font-display: swap`; Vite genera sus URLs con hash. No se consulta Google Fonts durante la navegación. Ambas están bajo SIL OFL 1.1; los avisos completos se conservan en `public/licenses`.

Fuentes originales: [Inter](https://rsms.me/inter/), [Bebas Neue](https://github.com/dharmatype/Bebas-Neue). Bebas utiliza su único peso real, 400. Los párrafos e interfaces operativas deben conservar Inter.

## Validación

Lint, TypeScript, Vitest, build y seis E2E. Se verifican carga y dimensiones de los titulares, nombre accesible del h1, rutas, teclado, axe, once anchos entre 320 y 3840 px y texto al 200%. Se revisan las capturas de escritorio, tablet y móvil.
