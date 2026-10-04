import { it, expect } from 'vitest';
import { checkoutSchema } from './validacion';
it('delivery exige dirección pero recojo no usa campos sobrantes', () => {
  const v = {
    modalidad: 'RECOJO_LOCAL',
    local_id: 'caba0000-0000-4000-8000-000000000001',
    nombres: 'Prueba',
    celular: '900000001',
    correo: '',
    direccion: '',
    distrito: '',
    referencia: '',
    metodo_previsto: 'YAPE',
  };
  expect(checkoutSchema.safeParse(v).success).toBe(true);
  expect(checkoutSchema.safeParse({ ...v, modalidad: 'DELIVERY' }).success).toBe(false);
  expect(
    checkoutSchema.safeParse({
      ...v,
      modalidad: 'DELIVERY',
      direccion: 'Calle prueba 123',
      distrito: 'Carabayllo',
    }).success,
  ).toBe(true);
});
