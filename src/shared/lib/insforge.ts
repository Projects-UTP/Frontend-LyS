import { createClient } from '@insforge/sdk';

// Esta clave es pública y queda limitada por RLS. Nunca usar una API key administrativa aquí.
export function crearClienteInsforge() {
  const baseUrl = import.meta.env.VITE_INSFORGE_URL;
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('Faltan VITE_INSFORGE_URL y VITE_INSFORGE_ANON_KEY en el entorno local.');
  }

  return createClient({ baseUrl, anonKey });
}
