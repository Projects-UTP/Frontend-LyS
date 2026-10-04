import { useQuery } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { useAuth, type Perfil } from './context';
export function usePerfil() {
  const { usuario } = useAuth();
  return useQuery({
    queryKey: ['perfil', usuario?.id],
    enabled: !!usuario,
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('perfiles_cliente')
        .select('id,nombres,apellidos,celular')
        .eq('id', usuario!.id)
        .maybeSingle();
      if (error) throw new Error('No pudimos cargar tu perfil.');
      return data as Perfil | null;
    },
  });
}
export async function guardarPerfil(id: string, datos: Omit<Perfil, 'id'>) {
  const { error } = await crearClienteInsforge()
    .database.from('perfiles_cliente')
    .insert([{ id, ...datos }]);
  if (error)
    throw new Error(
      'La cuenta está creada, pero falta guardar tu perfil. Complétalo en Mi cuenta.',
    );
}
export function errorAuth(error: unknown) {
  const e = error as { statusCode?: number; error?: string; message?: string };
  if (e.statusCode === 409 || /already|exists|registered/i.test(e.message ?? ''))
    return 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu acceso.';
  if (e.statusCode === 401) return 'El correo o la contraseña no son correctos.';
  if (e.statusCode === 403) return 'Verifica tu correo antes de iniciar sesión.';
  if (e.statusCode === 429) return 'Hay demasiados intentos. Espera un momento y vuelve a probar.';
  if (e.statusCode === 400) return 'Revisa los datos o el código. Puede haber vencido.';
  return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo nuevamente.';
}
export const redireccionSegura = (value: string | null) =>
  value &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  !/[\r\n]/.test(value)
    ? value
    : '/mi-cuenta';
