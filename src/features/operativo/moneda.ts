// Los controles trabajan en céntimos enteros; PostgreSQL valida numeric(12,2).
export function centimos(valor: string): number | null {
  if (!/^\d{1,10}([.,]\d{1,2})?$/.test(valor.trim())) return null;
  const [entero, decimal = ''] = valor.trim().replace(',', '.').split('.');
  const n = Number(entero) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(n) ? n : null;
}
export const decimalMonetario = (n: number) =>
  `${Math.floor(n / 100)}.${String(n % 100).padStart(2, '0')}`;
const intentosEnMemoria = new Map<string, string>();
export async function intentoCobro(datos: unknown) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(datos)),
  );
  const huella = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  if (intentosEnMemoria.has(huella)) return intentosEnMemoria.get(huella)!;
  try {
    const anterior = JSON.parse(sessionStorage.getItem('lys-intento-cobro') ?? 'null');
    if (
      anterior?.huella === huella &&
      /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(anterior.id)
    ) {
      intentosEnMemoria.set(huella, anterior.id);
      return anterior.id as string;
    }
  } catch {
    /* Un registro corrupto no conserva el intento. */
  }
  const id = crypto.randomUUID();
  intentosEnMemoria.set(huella, id);
  try {
    sessionStorage.setItem('lys-intento-cobro', JSON.stringify({ huella, id }));
  } catch {
    /* El formulario conserva el intento durante el reintento. */
  }
  return id;
}
