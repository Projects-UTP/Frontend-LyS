# Carrito — Sprint 3

Zustand persiste `lys-carrito` versión 1, exclusivamente product_id/quantity. No persiste datos del cliente ni precios, fotos o totales. La hidratación descarta entradas corruptas, UUID inválidos, duplicados y cantidades fuera de 1–50; máximo treinta productos distintos.

El catálogo y detalle agregan productos disponibles, la cabecera muestra unidades y `/carrito` permite aumentar/reducir/eliminar. Reducir hasta uno no elimina silenciosamente; la eliminación es explícita. Cada cambio tiene feedback textual accesible. El resumen usa centavos enteros para importes referenciales y consulta los metadatos actuales del catálogo.

Un producto retirado o no disponible se conserva visible para poder eliminarlo y bloquea la continuación. El checkout posterior cotiza en backend antes de confirmar. No se borra el carrito al iniciar checkout.

Validación: persistencia tras recarga, almacenamiento limitado, controles, vacío, saneamiento y cantidades inválidas. Axe y ausencia de scroll horizontal en 390/768/1366/1920. Capturas móvil/escritorio con fixtures deterministas del catálogo.
