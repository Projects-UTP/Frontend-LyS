import { useQuery } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import type { ItemCarrito } from '@/features/carrito/store';
export type Local = { id: string; nombre: string; direccion: string; telefono: string };
export type Cotizacion = {
  items: {
    product_id: string;
    nombre: string;
    quantity: number;
    precio_unitario: number;
    subtotal: number;
    demostracion: boolean;
  }[];
  subtotal: number;
  descuento: number;
  costo_delivery: number | null;
  total: number | null;
  version: string;
  local_id: string;
  local_nombre: string;
  modalidad: 'RECOJO_LOCAL' | 'DELIVERY';
  demostracion: boolean;
};
export type Solicitud = {
  items: ItemCarrito[];
  modalidad: 'RECOJO_LOCAL' | 'DELIVERY';
  local_id: string;
  contacto: { nombres: string; celular: string; correo?: string };
  direccion: { direccion: string; distrito: string; referencia: string } | null;
  metodo_previsto: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';
};
export function useLocales() {
  return useQuery({
    queryKey: ['locales'],
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('locales')
        .select('id,nombre,direccion,telefono')
        .eq('activo', true)
        .order('nombre')
        .limit(100);
      if (error) throw new Error('No pudimos consultar los locales.');
      return data as Local[];
    },
  });
}
export function errorPedido(error: unknown) {
  const texto = (error as { message?: string })?.message ?? '';
  if (texto.includes('COTIZACION_CAMBIO'))
    return 'El precio cambió. Vuelve a revisar el pedido antes de confirmar.';
  if (texto.includes('PRODUCTO_NO_DISPONIBLE'))
    return 'Un producto ya no está disponible. Corrige el carrito y vuelve a revisar.';
  if (texto.includes('LOCAL_NO_DISPONIBLE'))
    return 'El local ya no está disponible. Selecciona otro antes de continuar.';
  if (texto.includes('IDEMPOTENCIA_CONFLICTO'))
    return 'Este intento ya pertenece a otro pedido. Revisa su confirmación antes de repetirlo.';
  if (/INVALID|NO_PERMITIDOS|NO_CORRESPONDE/.test(texto))
    return 'Revisa los datos del pedido e inténtalo nuevamente.';
  return 'No pudimos confirmar la solicitud. Reintenta sin cambiar el pedido para evitar duplicados.';
}
export async function cotizar(s: Solicitud) {
  const { data, error } = await crearClienteInsforge().database.rpc('cotizar_pedido', {
    p_items: s.items,
    p_modalidad: s.modalidad,
    p_local_id: s.local_id,
  });
  if (error) throw new Error(errorPedido(error));
  return data as Cotizacion;
}
export async function crearPedido(
  s: Solicitud,
  version: string,
  intento: { id: string; acceso: string },
) {
  const { data, error } = await crearClienteInsforge().database.rpc('crear_pedido_web', {
    p_solicitud: s,
    p_version: version,
    p_idempotencia: intento.id,
    p_acceso: intento.acceso,
  });
  if (error) throw new Error(errorPedido(error));
  if (!data?.codigo) throw new Error('No recibimos confirmación. Reintenta el mismo pedido.');
  return data as { codigo: string; id: string; reutilizado: boolean };
}
