# Interfaz del personal

`/operativo/mesas` exige sesión y asignación activa de `empleados`. Un cliente no elige ni recibe un rol operativo. El selector solo contiene locales asignados. El servidor aplica RLS; ocultar botones no constituye seguridad. Logout elimina la caché operativa y cada consulta distingue usuario/local.

El salón carga mesas configurables, filtra zona/estado y pagina en bloques de 50. El seed es demostrativo, no un plano real. Los estados se escriben además de usar color. Inter es la tipografía operativa, controles de 48 px y foco visible. Playwright prueba 100 mesas, filtros y seis anchos 360–1920, con axe; cliente sin rol denegado. Las identidades y mesas de las pruebas de navegador son fixtures.
