import { createContext, useContext } from 'react';
export interface Usuario {
  id: string;
  email: string;
}
export interface Perfil {
  id: string;
  nombres: string;
  apellidos: string;
  celular: string;
}
export const AuthContext = createContext<{
  usuario: Usuario | null;
  cargando: boolean;
  actualizar: () => Promise<void>;
  salir: () => Promise<void>;
} | null>(null);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Falta el proveedor de autenticación');
  return ctx;
}
