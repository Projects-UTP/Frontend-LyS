import { createClient } from '@insforge/sdk';

// Esta clave es pública y queda limitada por RLS. Nunca usar una API key administrativa aquí.
let cliente: ReturnType<typeof createClient> | undefined;
export function crearClienteInsforge() {
  const baseUrl = import.meta.env.VITE_INSFORGE_URL;
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

  // El proxy del mismo origen mantiene la cookie httpOnly y la protección CSRF del SDK.
  const url =
    import.meta.env.VITE_INSFORGE_PROXY !== 'false'
      ? `${window.location.origin}/insforge`
      : baseUrl;
  if (!url) throw new Error('La conexión del catálogo aún no está configurada.');
  // Las lecturas reintentan en Query; las mutaciones no se repiten automáticamente.
  cliente ??= createClient({ baseUrl: url, anonKey, retryCount: 0, timeout: 15_000 });
  return cliente;
}
