import { createClient } from '@insforge/sdk';

// Esta clave es pública y queda limitada por RLS. Nunca usar una API key administrativa aquí.
let cliente: ReturnType<typeof createClient> | undefined;
let cerrando = false;
let cierreConfirmado = false;
export const cierreEnCurso = () => cerrando;
// El SDK 1.5.2 omite errores de logout. Observamos su respuesta para no anunciar
// un cierre que no revocó la cookie de sesión en el servidor.
const fetchObservado: typeof fetch = async (input, init) => {
  const direccion = input instanceof Request ? input.url : String(input);
  const url = new URL(direccion, window.location.origin);
  // Auth resuelve rutas absolutas; el proxy debe aplicarse antes de enviar HTTP.
  if (
    import.meta.env.VITE_INSFORGE_PROXY !== 'false' &&
    url.origin === window.location.origin &&
    url.pathname.startsWith('/api/')
  ) {
    url.pathname = `/insforge${url.pathname}`;
  }
  const destino = input instanceof Request ? new Request(url, input) : url;
  const response = await fetch(destino, init);
  if (cerrando && url.pathname.endsWith('/api/auth/logout')) {
    cierreConfirmado = response.ok;
  }
  return response;
};
export async function cerrarSesionConfirmada() {
  const csrf = document.cookie.split('; ').find((c) => c.startsWith('insforge_csrf_token='));
  cerrando = true;
  cierreConfirmado = false;
  try {
    await crearClienteInsforge().auth.signOut();
    if (!cierreConfirmado) {
      if (csrf)
        document.cookie = `${csrf}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      await crearClienteInsforge().auth.getCurrentUser();
      throw new Error(
        'No pudimos confirmar el cierre de sesión. Reintenta cuando tengas conexión.',
      );
    }
  } finally {
    cerrando = false;
  }
}
export function crearClienteInsforge() {
  const baseUrl = import.meta.env.VITE_INSFORGE_URL;
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

  // El proxy del mismo origen mantiene la cookie httpOnly y la protección CSRF del SDK.
  const url = import.meta.env.VITE_INSFORGE_PROXY !== 'false' ? window.location.origin : baseUrl;
  if (!url) throw new Error('La conexión del catálogo aún no está configurada.');
  // Las lecturas reintentan en Query; las mutaciones no se repiten automáticamente.
  cliente ??= createClient({
    baseUrl: url,
    anonKey,
    retryCount: 0,
    timeout: 15_000,
    fetch: fetchObservado,
  });
  return cliente;
}
