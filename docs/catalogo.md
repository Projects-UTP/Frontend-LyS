# Carta dinámica — Sprint 2

HU-CAT-001–005: categorías/productos consultados con InsForge SDK y TanStack Query. La búsqueda normaliza tildes y se realiza sobre el catálogo cargado, sin consulta por cada tecla; filtros quedan en la URL. Detalle /carta/:slug, estados carga/error/vacío y reintento. Caché 60 segundos sin refetch al enfocar.

El catálogo PostgreSQL incluye tres productos y precios explícitamente de demostración. Las fotografías locales son referenciales; si una URL pertenece a Cloudinary se usan f_auto, q_auto y variantes 400/800 px. Cuenta Cloudinary y carta oficial pendientes.

InsForge se consume por proxy /insforge del mismo origen: el SDK conserva access token en memoria y refresh en cookie httpOnly. Vite dev/preview incluye proxy. El hosting de producción deberá implementar el mismo proxy y HTTPS; no está desplegado. VITE_SITE_URL añade canonical únicamente cuando haya dominio confirmado; SEO avanzado/SSR pendientes.

Pruebas de UI con fixtures deterministas en CI, independientes de la nube; integración de tablas/RLS se verifica en backend. Responsive y axe a 390, 768, 1366 y 1920 px. No hay fallback silencioso a mocks si el servidor falla.
