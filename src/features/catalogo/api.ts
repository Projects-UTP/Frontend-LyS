import { useQuery } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_url: string | null;
  orden: number;
  demostracion: boolean;
}
export interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string | null;
  disponible: boolean;
  destacado: boolean;
  demostracion: boolean;
}
const columnas =
  'id,categoria_id,nombre,slug,descripcion,precio_base,imagen_url,disponible,destacado,demostracion';
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('categorias')
        .select('id,nombre,slug,descripcion,imagen_url,orden,demostracion')
        .order('orden');
      if (error) throw new Error('No pudimos cargar las categorías. Intenta nuevamente.');
      return data as Categoria[];
    },
  });
}
export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('productos')
        .select(columnas)
        .order('nombre');
      if (error) throw new Error('No pudimos cargar la carta. Intenta nuevamente.');
      return data as Producto[];
    },
  });
}
export function useProducto(slug: string) {
  return useQuery({
    queryKey: ['producto', slug],
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge()
        .database.from('productos')
        .select(columnas)
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw new Error('No pudimos consultar este producto.');
      return data as Producto | null;
    },
  });
}
export const soles = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
export const normalizar = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
