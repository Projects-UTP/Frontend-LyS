# Interfaz del personal

`/operativo/mesas` exige sesión y asignación activa de `empleados`. Un cliente no elige ni recibe un rol operativo. El selector solo contiene locales asignados. El servidor aplica RLS; ocultar botones no constituye seguridad. Logout elimina la caché operativa y cada consulta distingue usuario/local.

El salón carga mesas configurables, filtra zona/estado y pagina en bloques de 50. El seed es demostrativo, no un plano real. Los estados se escriben además de usar color. Inter es la tipografía operativa, controles de 48 px y foco visible. Playwright prueba 100 mesas, filtros y seis anchos 360–1920, con axe; cliente sin rol denegado. Las identidades y mesas de las pruebas de navegador son fixtures.

`/operativo/mesa/:id` abre un borrador y ocupa la mesa. Permite buscar/filtrar, añadir/cambiar/quitar productos y observaciones de 240 caracteres por producto/400 por orden. Guardar consulta la cotización del servidor y exige revisión actual. Se revisa el resumen antes de enviar a caja. Correcciones posteriores requieren motivo; una orden pagada se muestra sin edición libre. Conflictos y errores conservan la entrada para corregirla. El mapa consulta códigos activos en una sola RPC del local. El envío permanece PENDIENTE_PAGO/PENDIENTE: nunca cocina antes del cobro.

`/operativo/caja` admite CAJA/ADMINISTRADOR: apertura propia, cola por antigüedad, detalle consultado de nuevo, recibido/vuelto en céntimos enteros y confirmación explícita. Yape/Plin/POS se verifican fuera de la aplicación. El intento monetario persiste como UUID/hash (sin referencia/contacto) y se conserva en memoria si sessionStorage falla. Ante incertidumbre se consulta estado antes de cambiar el intento; el servidor impide doble cobro. Delivery sin total no puede cobrarse. Cierre muestra ventas por método y efectivo esperado, sin afirmar arqueo físico o emisión SUNAT. Fondos anulados requieren conciliación y no acreditan devolución.
# Cocina y entrega

`/operativo/cocina` solo admite COCINA/ADMINISTRADOR; Inter, cantidades destacadas, mesa/modalidad, mozo, timestamps y observaciones sin columnas monetarias. Los estados vienen del servidor. El reloj visual se actualiza cada 30 segundos sin consultas de red. `VITE_KDS_ATENCION_MIN` y `VITE_KDS_DEMORA_MIN` son opcionales: ambos deben ser positivos y demora mayor que atención. Vacíos deshabilitan el semáforo; no se inventa un SLA. BRASA/PARRILLA/BEBIDAS/ENSALADAS se mantienen como futura extensión de estaciones, sin dividir la orden antes de confirmar la operación real.

`/operativo/listos` admite MOZO/ADMINISTRADOR. La entrega exige confirmación explícita y revisión actual. El servidor registra ENTREGADO y FINALIZADO en la misma transacción para consumo local/recojo; libera la mesa y conserva timestamps e historial. No se implementa despacho delivery.
## Conexión de operación

Una conexión del SDK comparte la sesión Auth en memoria y se suscribe únicamente a los canales exactos de roles/local asignados. El proxy HTTP `/insforge` y el proxy WebSocket `/socket.io` mantienen el mismo origen; producción requiere HTTPS y ambos proxies. Cambio de local, usuario o salida limpia listeners/suscripciones y desconecta.

Cada evento valida ámbito/revisión, consulta una sola orden autorizada y actualiza sus tarjetas/mapa. Duplicados y respuestas antiguas no retroceden estados. No vuelve a cargar todas las órdenes por evento. Al reconectar o volver a la pestaña consulta el ámbito activo; si falla la conexión, fallback cada 30 segundos solo visible y actualización manual. Aviso de listos visible al mozo, sin fabricar una notificación de cocina.

Consola registra únicamente códigos de fallo de RPC o conexión, sin errores del proveedor ni contactos, referencias o tokens. Pruebas de navegador emulan Socket.IO y no demuestran entrega real a personal aún no provisionado; la conexión WebSocket real anónima fue rechazada en lys-validacion.

## Anulaciones administrativas

`/operativo/anulaciones` requiere ADMINISTRADOR del local tanto en la interfaz como en las RPC/RLS. Busca por código humano y consulta datos mínimos del pago. Motivo de 3–400 caracteres y confirmación explícita obligatorios; solo antes de preparación y con la sesión abierta. Conserva registro, actor, fecha y motivo; no elimina movimientos ni acredita una devolución. Los fondos anulados permanecen en los importes esperados hasta su conciliación. Tras el resultado se consulta de nuevo el servidor. Un cajero sin asignación administrativa no tiene acceso. Playwright verifica el cobro previo, anulación, conservación del pago/fondos y móvil/escritorio; PostgreSQL verifica las prohibiciones y la transacción.

El detalle de cobro consulta `consultar_orden_operativa` para obtener la información vigente autorizada. El método previsto del pedido web no confirma el método recibido. La prueba de red anónima también comprobó el proxy WebSocket local: conectado y suscripción privada rechazada `REALTIME_UNAUTHORIZED`.
