# Checkout — Sprint 3

Tres pasos: modalidad/local/dirección, contacto/método previsto, revisión con cotización backend. Invitados no necesitan cuenta; usuarios reutilizan el perfil y pueden corregir datos del pedido sin modificarlo permanentemente. Locales se consultan por ID desde InsForge y no se copia una dirección dentro de cada pedido.

Recojo utiliza subtotal como total; delivery exige dirección/distrito y admite referencia opcional. Costo y total definitivo de delivery permanecen pendientes de confirmación. Efectivo/Yape/Plin/Tarjeta son métodos previstos; no hay datos de tarjetas, pasarela o pago aprobado.

Al revisar, el RPC recibe exclusivamente IDs/cantidades/modalidad/local. Confirmar remite contacto y método, versión de cotización y una clave UUID de idempotencia; no envía precios/subtotales/totales. La clave se conserva durante un reintento. sessionStorage contiene solo clave, capacidad aleatoria y hash del intento, sin contacto. El hash permite recuperar el mismo intento tras recarga si se reintroducen los mismos datos.

El servidor es la autoridad final. Un precio cambiado/no disponibilidad requiere revisar de nuevo. Un fallo mantiene el carrito y permite reintentar con la misma clave; el carrito solo se vacía tras respuesta confirmada. Los datos personales del formulario no persisten. La capacidad de lectura de un resumen invitado se conserva en la pestaña y nunca se añade a URL; expira en backend a siete días.

Pruebas: contacto/dirección inválidos, cuatro tamaños sin overflow/axe, servidor fallido seguido de reintento con misma clave y carrito conservado, delivery sin tarifa inventada, perfil precargado sin cambios permanentes. Capturas móvil/escritorio de revisión con datos sintéticos. El backend fue comprobado también con dos solicitudes simultáneas reales en lys-validacion: mismo pedido, pago pendiente y lectura sin clave denegada.
