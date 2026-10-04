import { createContext, useContext } from 'react';
export type Rol = 'MOZO' | 'CAJA' | 'COCINA' | 'ADMINISTRADOR';
export const OperativoContext = createContext<{ local: string; roles: Rol[]; usuario: string }>({
  local: '',
  roles: [],
  usuario: '',
});
export const useOperativo = () => useContext(OperativoContext);
