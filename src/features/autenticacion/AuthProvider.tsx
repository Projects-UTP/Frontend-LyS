import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext, type Usuario } from './context';
import { crearClienteInsforge, cerrarSesionConfirmada, cierreEnCurso } from '@/shared/lib/insforge';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const queries = useQueryClient();
  const actualizar = useCallback(async () => {
    try {
      const { data, error } = await crearClienteInsforge().auth.getCurrentUser();
      setUsuario(error ? null : (data?.user ?? null));
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const sdk = crearClienteInsforge();
    void sdk.auth
      .getCurrentUser()
      .then(({ data, error }) => {
        if (active) {
          setUsuario(error ? null : (data?.user ?? null));
          setCargando(false);
        }
      })
      .catch(() => {
        if (active) setCargando(false);
      });
    const unsubscribe = sdk.auth.onAuthStateChange((event) => {
      if (event === 'signedOut' && !cierreEnCurso()) {
        setUsuario(null);
        queries.removeQueries({ queryKey: ['perfil'] });
        queries.removeQueries({ queryKey: ['pedidos'] });
        queries.removeQueries({ queryKey: ['pedido'] });
      } else if (event === 'signedIn') {
        void actualizar();
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [actualizar, queries]);
  const salir = async () => {
    await cerrarSesionConfirmada();
    setUsuario(null);
    queries.removeQueries({ queryKey: ['perfil'] });
    queries.removeQueries({ queryKey: ['pedidos'] });
    queries.removeQueries({ queryKey: ['pedido'] });
  };
  return (
    <AuthContext.Provider value={{ usuario, cargando, actualizar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}
