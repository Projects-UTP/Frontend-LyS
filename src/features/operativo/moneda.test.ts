import { describe, it, expect } from 'vitest';
import { centimos, decimalMonetario } from './moneda';
describe('dinero del control de caja', () => {
  it('calcula vuelto exacto y acepta coma decimal', () => {
    expect(centimos('20.00')! - centimos('19,90')!).toBe(10);
    expect(decimalMonetario(10)).toBe('0.10');
    expect(centimos('0,1')).toBe(10);
  });
  it('rechaza precisión extra y formatos ambiguos', () => {
    for (const v of ['20.001', '1e2', '-10', '20,10.00', '', 'Infinity'])
      expect(centimos(v)).toBeNull();
  });
});
