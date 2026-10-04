import { useQuery } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { useAuth } from '@/features/autenticacion/context';
import { useOperativo, type Rol } from './context';
export type Mesa = {
  id: string;
  local_id: string;
  numero: number;
  nombre: string;
  zona: string;
  capacidad: number | null;
  estado: string;
  demostracion: boolean;
  activo: boolean;
};
export type Orden = {
  id: string;
  codigo: string;
  local_id: string;
  mesa_id: string | null;
  mozo_id: string | null;
  modalidad: string;
  estado_pedido: string;
  estado_pago: string;
  revision: number;
  subtotal: number;
  total: number | null;
  demostracion: boolean;
  observaciones: string;
  created_at: string;
  mesa: { numero: number; nombre: string; estado: string } | null;
  items: {
    producto_id: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    observaciones: string;
  }[];
};
export type SesionCaja = {
  id: string;
  local_id: string;
  estado: 'ABIERTA' | 'CERRADA';
  revision: number;
  opened_at: string;
  closed_at: string | null;
  monto_inicial: number;
  ventas: Partial<Record<MetodoPago, number>>;
  total_ventas: number;
  fondos_anulados: number;
  efectivo_esperado: number;
  total_esperado: number;
};
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA_POS';
export type PagoConfirmado = {
  pago_id: string;
  estado: string;
  monto: number;
  vuelto: number;
  reutilizado: boolean;
};
export function useCaja() {
  const { local, usuario, roles } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'caja', local, usuario],
    enabled: !!local && roles.some((r) => ['CAJA', 'ADMINISTRADOR'].includes(r)),
    queryFn: () => rpcOperativo<SesionCaja | null>('mi_caja', { p_local: local }),
  });
}
export function useColaPagos() {
  const { local, usuario, roles } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'cola-pagos', local, usuario],
    enabled: !!local && roles.some((r) => ['CAJA', 'ADMINISTRADOR'].includes(r)),
    queryFn: () =>
      rpcOperativo<(Orden & { cliente: string | null; metodo_previsto: string })[]>('cola_pagos', {
        p_local: local,
      }),
  });
}
export function useOrdenOperativa(id: string) {
  const { local, usuario } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'orden', local, usuario, id],
    enabled: !!local && !!id,
    queryFn: () => rpcOperativo<Orden | null>('orden_operativa', { p_id: id }),
    staleTime: 0,
  });
}
export type OrdenMesa = {
  mesa_id: string;
  codigo: string;
  estado_pedido: string;
  estado_pago: string;
};
export function useOrdenesMesa() {
  const { local, usuario } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'ordenes-mesa', local, usuario],
    enabled: !!local,
    queryFn: () => rpcOperativo<OrdenMesa[]>('listar_pedidos_mesa', { p_local: local }),
  });
}
export function useOrdenMesa(mesa: string) {
  const { local, usuario } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'mesa', local, usuario, mesa],
    enabled: !!local && !!mesa,
    queryFn: () => rpcOperativo<Orden | null>('pedido_de_mesa', { p_mesa: mesa }),
  });
}
export async function rpcOperativo<T>(nombre: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await crearClienteInsforge().database.rpc(nombre, args);
  if (error) {
    const m = error.message ?? '';
    if (m.includes('EFECTIVO_INSUFICIENTE'))
      throw new Error('El efectivo recibido no cubre el total del pedido.');
    if (m.includes('TOTAL_NO_CONFIRMADO'))
      throw new Error('El pedido aún no tiene un total confirmado. No se puede cobrar.');
    if (m.includes('PEDIDO_YA_COBRADO'))
      throw new Error(
        'La orden ya fue cobrada o cambió de estado. Consulta su estado antes de repetir el cobro.',
      );
    if (m.includes('CAJA_CERRADA'))
      throw new Error('La sesión de caja está cerrada. Abre una sesión nueva.');
    if (m.includes('CAJA_YA_ABIERTA'))
      throw new Error('Ya tienes una sesión abierta en este local. Actualiza el resumen.');
    if (m.includes('SIN_PERMISO'))
      throw new Error('Tu rol no permite realizar esta acción en este local.');
    if (m.includes('CONFLICTO')) throw new Error('La orden cambió. Actualiza antes de continuar.');
    if (m.includes('MESA_OCUPADA'))
      throw new Error('La mesa ya tiene una orden. Actualiza el mapa.');
    if (m.includes('PEDIDO_PAGADO'))
      throw new Error('Una orden pagada no permite modificar productos.');
    throw new Error(
      'No pudimos completar la acción. Revisa los datos y actualiza antes de reintentar.',
    );
  }
  return data as T;
}
export function useAsignaciones() {
  const auth = useAuth();
  return useQuery({
    queryKey: ['operativo', 'asignaciones', auth.usuario?.id],
    enabled: !auth.cargando && !!auth.usuario,
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('empleados')
        .select('local_id,rol')
        .eq('usuario_id', auth.usuario!.id)
        .eq('activo', true);
      if (error) throw new Error('No pudimos comprobar tu acceso de personal.');
      return data as { local_id: string; rol: Rol }[];
    },
  });
}
export function useMesas() {
  const { local, usuario } = useOperativo();
  return useQuery({
    queryKey: ['operativo', 'mesas', local, usuario],
    enabled: !!local,
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('mesas')
        .select('id,local_id,numero,nombre,zona,capacidad,estado,demostracion,activo')
        .eq('local_id', local)
        .eq('activo', true)
        .order('numero');
      if (error) throw new Error('No pudimos cargar las mesas.');
      return data as Mesa[];
    },
  });
}
