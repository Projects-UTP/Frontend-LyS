const memoria = new Map<string, string>();
export function guardarAcceso(codigo: string, acceso: string) {
  memoria.set(codigo, acceso);
  try {
    sessionStorage.setItem(
      `lys-pedido-${codigo}`,
      JSON.stringify({ acceso, expira: Date.now() + 7 * 86400000 }),
    );
  } catch {
    /* La confirmación aún funciona en esta pestaña mediante memoria. */
  }
}
export function leerAcceso(codigo: string) {
  if (memoria.has(codigo)) return memoria.get(codigo);
  try {
    const v = JSON.parse(sessionStorage.getItem(`lys-pedido-${codigo}`) ?? 'null');
    if (v?.expira > Date.now() && /^[a-f0-9]{64}$/.test(v.acceso)) return v.acceso as string;
  } catch {
    /* Datos corruptos no conceden acceso. */
  }
  return undefined;
}
export async function intentoPedido(solicitud: unknown, version: string, identidad: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify({ solicitud, version, identidad })),
  );
  const huella = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  try {
    const anterior = JSON.parse(sessionStorage.getItem('lys-intento-pedido') ?? 'null');
    if (
      anterior?.huella === huella &&
      /^[a-f0-9]{64}$/.test(anterior.acceso) &&
      /^[0-9a-f-]{36}$/.test(anterior.id)
    )
      return anterior as { id: string; acceso: string; huella: string };
  } catch {
    /* Un intento corrupto se sustituye. */
  }
  const acceso = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
  const intento = { id: crypto.randomUUID(), acceso, huella };
  try {
    sessionStorage.setItem('lys-intento-pedido', JSON.stringify(intento));
  } catch {
    /* La referencia de la pantalla conserva el mismo intento durante el reintento. */
  }
  return intento;
}
