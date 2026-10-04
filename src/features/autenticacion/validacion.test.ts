import { describe, it, expect } from 'vitest';
import { registroSchema } from './validacion';
import { redireccionSegura } from './api';
describe('reglas de cuenta', () => {
  const datos = {
    nombres: 'Ana',
    apellidos: 'García',
    correo: 'cliente@example.test',
    celular: '900000001',
    contrasena: 'ClavePrueba2026',
    confirmacion: 'ClavePrueba2026',
  };
  it('rechaza confirmación distinta y celular inválido', () => {
    expect(registroSchema.safeParse({ ...datos, confirmacion: 'otra' }).success).toBe(false);
    expect(registroSchema.safeParse({ ...datos, celular: '123' }).success).toBe(false);
    expect(registroSchema.safeParse(datos).success).toBe(true);
  });
  it('impide retornos externos y conserva los internos', () => {
    for (const value of [
      'https://externo.example',
      '//externo.example',
      '/\\externo.example',
      '/\nexterno',
    ])
      expect(redireccionSegura(value)).toBe('/mi-cuenta');
    expect(redireccionSegura('/checkout')).toBe('/checkout');
  });
});
