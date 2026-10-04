import { z } from 'zod';
import type { Orden } from './api';
const evento = z.object({
  id: z.uuid(),
  local_id: z.uuid(),
  mesa_id: z.uuid().nullable(),
  revision: z.number().int().positive(),
  meta: z.object({ channel: z.string() }),
});
export function leerEvento(valor: unknown, local: string, canales: readonly string[]) {
  const r = evento.safeParse(valor);
  return r.success && r.data.local_id === local && canales.includes(r.data.meta.channel)
    ? r.data
    : null;
}
export function fusionarCola(
  actual: Orden[] | undefined,
  nueva: Orden | null,
  id: string,
  acepta: (p: Orden) => boolean,
) {
  if (!actual) return actual;
  const anterior = actual.find((p) => p.id === id);
  if (nueva && anterior && nueva.revision < anterior.revision) return actual;
  const otras = actual.filter((p) => p.id !== id);
  if (nueva && acepta(nueva)) otras.push(nueva);
  return otras.sort((a, b) => a.created_at.localeCompare(b.created_at));
}
