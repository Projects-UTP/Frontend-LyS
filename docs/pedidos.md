# Confirmación y seguimiento privados

`/pedido/:codigo/confirmacion` y `/pedido/:codigo` consultan `consultar_pedido`. Los importes, snapshots e historial proceden exclusivamente del servidor. La confirmación registra la orden pendiente de pago; elegir Yape, Plin o tarjeta no acredita una transferencia. Delivery mantiene total pendiente mientras no exista tarifa confirmada.

Un código LYS no concede acceso. El propietario necesita su sesión; el invitado una capacidad aleatoria de 256 bits guardada solo en memoria/sessionStorage, sin incluirla en URL. PostgreSQL conserva su hash y vencimiento de siete días. Recargar la misma pestaña conserva acceso; otra pestaña o su pérdida no permite consultar por código. Proteger la aplicación con HTTPS y CSP, pues XSS podría robar una capacidad. No mostrar direcciones/contactos privados en este resumen. Logout invalida caché de pedidos del propietario.

El seguimiento presenta estados e historial reales, con actualización manual y recuperación de errores; no simula avances ni tiempos de entrega. Tests SQL prueban RLS, idempotencia concurrente, snapshots y reversión transaccional; Playwright comprueba confirmación, recarga, seguimiento, acceso perdido y accesibilidad en móvil/escritorio con fixtures explícitos.
