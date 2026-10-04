import { z } from 'zod';
export const checkoutSchema = z
  .object({
    modalidad: z.enum(['RECOJO_LOCAL', 'DELIVERY']),
    local_id: z.string().uuid('Selecciona un local.'),
    nombres: z.string().trim().min(2, 'Escribe tu nombre.').max(150),
    celular: z.string().regex(/^9\d{8}$/, 'Escribe un celular peruano de 9 dígitos.'),
    correo: z.union([z.literal(''), z.string().trim().email('Escribe un correo válido.').max(254)]),
    direccion: z.string().trim().max(300),
    distrito: z.string().trim().max(100),
    referencia: z.string().trim().max(300),
    metodo_previsto: z.enum(['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA']),
  })
  .superRefine((v, c) => {
    if (v.modalidad === 'DELIVERY') {
      if (v.direccion.length < 5)
        c.addIssue({
          code: 'custom',
          path: ['direccion'],
          message: 'Escribe una dirección de al menos 5 caracteres.',
        });
      if (v.distrito.length < 2)
        c.addIssue({ code: 'custom', path: ['distrito'], message: 'Escribe tu distrito.' });
    }
  });
export type DatosCheckout = z.infer<typeof checkoutSchema>;
