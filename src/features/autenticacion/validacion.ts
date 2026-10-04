import { z } from 'zod';
export const datosPerfil = z.object({
  nombres: z.string().trim().min(2, 'Escribe al menos 2 caracteres.').max(100),
  apellidos: z.string().trim().min(2, 'Escribe tus apellidos.').max(100),
  celular: z.string().regex(/^9\d{8}$/, 'Escribe un celular peruano de 9 dígitos.'),
});
export const correo = z.string().trim().email('Escribe un correo válido.').max(254);
export const contrasena = z
  .string()
  .min(8, 'Usa al menos 8 caracteres.')
  .max(72, 'Usa como máximo 72 caracteres.');
export const registroSchema = datosPerfil
  .extend({ correo, contrasena, confirmacion: z.string() })
  .refine((v) => v.contrasena === v.confirmacion, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmacion'],
  });
export const codigoSchema = z.object({
  codigo: z.string().regex(/^\d{6}$/, 'Escribe el código de 6 dígitos.'),
});
export type Registro = z.infer<typeof registroSchema>;
