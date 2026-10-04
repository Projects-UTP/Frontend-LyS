# Autenticación — Sprint 2

InsForge Auth mantiene el token de acceso en memoria y la sesión renovable en cookie httpOnly. Se usa el proxy `/insforge` del mismo origen y CSRF del SDK; no se guardan contraseñas ni JWT en localStorage. El alojamiento final necesita HTTPS y el mismo proxy. No se ha publicado un dominio de producción.

`/registro` valida nombres, apellidos, correo, celular peruano, contraseña de 8–72 caracteres y confirmación con React Hook Form/Zod. La configuración real exige verificación por código. Los datos del formulario permanecen en memoria mientras se verifica; al cerrar la pantalla se puede completar después el perfil. No hay DNI ni roles elegidos por el cliente.

`/mi-cuenta` espera a hidratar la sesión, protege la ruta y consulta el perfil bajo RLS. Los perfiles están separados de las credenciales administradas. Si falla su creación después del alta de Auth, la cuenta puede completar sus datos sin volver a registrarse.

El SDK 1.5.2 oculta errores HTTP de logout: se observa su transporte para comprobar la revocación antes de anunciar un cierre. Si falla, se conserva la identidad visible, se intenta restaurar la sesión y se solicita reintentar. Un cierre confirmado elimina las consultas privadas.

Las pruebas de navegador usan cuentas, códigos y tokens sintéticos calculados en ejecución; no son evidencia de entrega de correo. La entrega y recepción externa requieren un buzón de prueba controlado. Las pruebas SQL de acceso a otro perfil se ejecutan en PostgreSQL efímero de CI, sin manipular el esquema administrado de Auth en LYS.

`/iniciar-sesion` valida correo/contraseña, bloquea envíos simultáneos y presenta errores legibles. Un correo pendiente puede verificar su código y completar el perfil. El retorno admite exclusivamente rutas internas. La cabecera muestra Ingresar/Mi cuenta. Las rutas de cuenta llevan noindex.

HU-AUT-002/003: pruebas de credenciales inválidas, redirección externa rechazada, cierre HTTP 503 sin falsa confirmación, cierre correcto y recarga sin sesión. Perfil/login cuentan con capturas deterministas.
