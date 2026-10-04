import { describe, it, expect } from 'vitest';
import { leerEvento, fusionarCola } from './eventos';
import type { Orden } from './api';
const local = 'caba0000-0000-4000-8000-000000000001',
  id = 'ba000000-0000-4000-8000-000000000001',
  canal = `lys-operativo:${local}:COCINA`;
describe('recuperación de eventos operativos', () => {
  it('rechaza eventos de otro local, rol o revisión malformada', () => {
    const e = { id, local_id: local, mesa_id: null, revision: 3, meta: { channel: canal } };
    expect(leerEvento(e, local, [canal])).not.toBeNull();
    expect(leerEvento({ ...e, revision: -1 }, local, [canal])).toBeNull();
    expect(leerEvento({ ...e, local_id: id }, local, [canal])).toBeNull();
    expect(
      leerEvento({ ...e, meta: { channel: canal.replace('COCINA', 'CAJA') } }, local, [canal]),
    ).toBeNull();
  });
  it('una respuesta retrasada no retrocede el estado y una salida retira solo su tarjeta', () => {
    const listo = {
      id,
      revision: 6,
      estado_pedido: 'LISTO',
      created_at: '2026-10-04T12:00:00Z',
    } as Orden;
    const otro = { ...listo, id: local };
    const cola = [listo, otro];
    expect(
      fusionarCola(
        cola,
        { ...listo, revision: 5, estado_pedido: 'EN_PREPARACION' },
        id,
        () => true,
      ),
    ).toEqual(cola);
    expect(fusionarCola(cola, null, id, () => true)).toEqual([otro]);
    expect(
      fusionarCola(
        cola,
        { ...listo, revision: 8, estado_pedido: 'FINALIZADO' },
        id,
        (p) => p.estado_pedido === 'LISTO',
      ),
    ).toEqual([otro]);
  });
});
