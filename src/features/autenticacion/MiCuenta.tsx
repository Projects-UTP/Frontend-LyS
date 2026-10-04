import { Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Campo, MarcoCuenta, ResumenErrores } from '@/shared/ui/Formulario';
import { useErrorSummary } from '@/shared/lib/formularios';
import { useAuth, type Perfil } from './context';
import { guardarPerfil, usePerfil } from './api';
import { datosPerfil } from './validacion';
export function MiCuenta() {
  const auth = useAuth();
  const perfil = usePerfil();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (auth.cargando)
    return (
      <div className="container commerce-state" role="status">
        Comprobando tu sesión…
      </div>
    );
  if (!auth.usuario)
    return (
      <Navigate replace to={`/iniciar-sesion?volver=${encodeURIComponent(location.pathname)}`} />
    );
  return (
    <MarcoCuenta title="Bienvenido a tu mesa" description="Tus datos, en un solo lugar.">
      <h2>Mi cuenta</h2>
      {perfil.isPending ? (
        <p role="status">Cargando tu perfil…</p>
      ) : perfil.error ? (
        <div role="alert">
          <p>{perfil.error.message}</p>
          <button className="text-button" onClick={() => void perfil.refetch()}>
            Reintentar
          </button>
        </div>
      ) : perfil.data ? (
        <dl className="profile-data">
          <dt>Nombres</dt>
          <dd>{perfil.data.nombres}</dd>
          <dt>Apellidos</dt>
          <dd>{perfil.data.apellidos}</dd>
          <dt>Correo</dt>
          <dd>{auth.usuario.email}</dd>
          <dt>Celular</dt>
          <dd>{perfil.data.celular}</dd>
        </dl>
      ) : (
        <CompletarPerfil id={auth.usuario.id} />
      )}
      <button
        className="action action-outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await auth.salir();
          } catch {
            setError('No pudimos cerrar la sesión. Reintenta.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'CERRANDO SESIÓN…' : 'CERRAR SESIÓN'}
      </button>
      {error && <p role="alert">{error}</p>}
    </MarcoCuenta>
  );
}
function CompletarPerfil({ id }: { id: string }) {
  const query = useQueryClient();
  const form = useForm<Omit<Perfil, 'id'>>({
    resolver: zodResolver(datosPerfil),
    shouldFocusError: false,
  });
  const { summary, invalid } = useErrorSummary();
  const [error, setError] = useState('');
  return (
    <>
      <p>Completa tus datos para tu próximo pedido.</p>
      <form
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          setError('');
          try {
            await guardarPerfil(id, values);
            await query.invalidateQueries({ queryKey: ['perfil', id] });
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No pudimos guardar tus datos.');
          }
        }, invalid)}
      >
        <ResumenErrores errors={form.formState.errors} summary={summary} />
        <Campo
          name="nombres"
          label="Nombres"
          register={form.register}
          errors={form.formState.errors}
          autoComplete="given-name"
        />
        <Campo
          name="apellidos"
          label="Apellidos"
          register={form.register}
          errors={form.formState.errors}
          autoComplete="family-name"
        />
        <Campo
          name="celular"
          label="Celular"
          register={form.register}
          errors={form.formState.errors}
          autoComplete="tel-national"
          type="tel"
        />
        {error && <p role="alert">{error}</p>}
        <button className="action" disabled={form.formState.isSubmitting}>
          GUARDAR DATOS
        </button>
      </form>
    </>
  );
}
