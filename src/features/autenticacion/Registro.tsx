import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { Campo, MarcoCuenta, ResumenErrores } from '@/shared/ui/Formulario';
import { useErrorSummary } from '@/shared/lib/formularios';
import { registroSchema, codigoSchema, type Registro } from './validacion';
import { errorAuth, guardarPerfil } from './api';
import { useAuth } from './context';
export function RegistroCliente() {
  const config = useQuery({
    queryKey: ['auth-config'],
    queryFn: async () => {
      const { data, error } = await crearClienteInsforge().auth.getPublicAuthConfig();
      if (error) throw new Error('No pudimos consultar la configuración de registro.');
      return data;
    },
    staleTime: 300_000,
  });
  const form = useForm<Registro>({
    resolver: zodResolver(registroSchema),
    shouldFocusError: false,
  });
  const { summary, invalid } = useErrorSummary();
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Registro | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const submit = async (values: Registro) => {
    setError('');
    try {
      const { data, error: err } = await crearClienteInsforge().auth.signUp({
        email: values.correo,
        password: values.contrasena,
        name: values.nombres,
        redirectTo: `${location.origin}/iniciar-sesion`,
      });
      if (err) {
        setError(errorAuth(err));
        return;
      }
      if (data?.requireEmailVerification) {
        setDraft({ ...values, contrasena: '', confirmacion: '' });
        form.reset();
      } else if (data?.user) {
        await guardarPerfil(data.user.id, {
          nombres: values.nombres,
          apellidos: values.apellidos,
          celular: values.celular,
        });
        await auth.actualizar();
        navigate('/mi-cuenta');
      } else
        setError('No recibimos confirmación. Intenta iniciar sesión antes de repetir el registro.');
    } catch (e) {
      setError(e instanceof Error ? e.message : errorAuth(e));
    }
  };
  return (
    <MarcoCuenta
      title="Tu lugar en la mesa"
      description="Crea tu cuenta para guardar tus datos. También podrás pedir como invitado."
    >
      {draft ? (
        <Verificacion draft={draft} method={config.data?.verifyEmailMethod ?? 'code'} />
      ) : (
        <>
          <h2>Crear cuenta</h2>
          {config.isPending ? (
            <p role="status">Preparando el registro…</p>
          ) : config.error ? (
            <div role="alert">
              <p>{config.error.message}</p>
              <button className="text-button" onClick={() => void config.refetch()}>
                Reintentar
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={form.handleSubmit(submit, invalid)}
              aria-busy={form.formState.isSubmitting}
            >
              <ResumenErrores errors={form.formState.errors} summary={summary} />
              <div className="form-grid">
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
              </div>
              <Campo
                name="correo"
                label="Correo"
                type="email"
                autoComplete="email"
                register={form.register}
                errors={form.formState.errors}
              />
              <Campo
                name="celular"
                label="Celular"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                register={form.register}
                errors={form.formState.errors}
              />
              <Campo
                name="contrasena"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                register={form.register}
                errors={form.formState.errors}
              />
              <p className="muted">
                Usa entre 8 y 72 caracteres. Puedes pegar una contraseña de tu gestor.
              </p>
              <Campo
                name="confirmacion"
                label="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                register={form.register}
                errors={form.formState.errors}
              />
              {error && (
                <p role="alert" className="form-errors">
                  {error}
                </p>
              )}
              <button
                className="action"
                disabled={form.formState.isSubmitting || config.data?.disableSignup}
              >
                {form.formState.isSubmitting ? 'CREANDO CUENTA…' : 'CREAR CUENTA'}
              </button>
            </form>
          )}
          <p className="account-links">
            ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Iniciar sesión</Link>
          </p>
        </>
      )}
    </MarcoCuenta>
  );
}
function Verificacion({ draft, method }: { draft: Registro; method: 'code' | 'link' }) {
  const form = useForm<{ codigo: string }>({ resolver: zodResolver(codigoSchema) });
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const verify = async ({ codigo }: { codigo: string }) => {
    setError('');
    const { data, error: err } = await crearClienteInsforge().auth.verifyEmail({
      email: draft.correo,
      otp: codigo,
    });
    if (err) {
      setError(errorAuth(err));
      return;
    }
    if (data?.user) {
      try {
        await guardarPerfil(data.user.id, {
          nombres: draft.nombres,
          apellidos: draft.apellidos,
          celular: draft.celular,
        });
      } catch {
        setMessage('Completa tus datos en Mi cuenta.');
      }
      await auth.actualizar();
      navigate('/mi-cuenta');
    }
  };
  const resend = async () => {
    setResending(true);
    setError('');
    try {
      const { error: err } = await crearClienteInsforge().auth.resendVerificationEmail({
        email: draft.correo,
        redirectTo: `${location.origin}/iniciar-sesion`,
      });
      if (err) setError(errorAuth(err));
      else setMessage('Enviamos otro código. Revisa también correo no deseado.');
    } finally {
      setResending(false);
    }
  };
  return (
    <>
      <h2>Verifica tu correo</h2>
      <p>
        Enviamos {method === 'code' ? 'un código' : 'un enlace'} a <strong>{draft.correo}</strong>.
      </p>
      {method === 'code' ? (
        <form onSubmit={form.handleSubmit(verify)} noValidate>
          <Campo
            name="codigo"
            label="Código de verificación"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            register={form.register}
            errors={form.formState.errors}
          />
          <button className="action" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'VERIFICANDO…' : 'VERIFICAR CORREO'}
          </button>
        </form>
      ) : (
        <Link className="action" to="/iniciar-sesion">
          IR A INICIAR SESIÓN
        </Link>
      )}
      {error && (
        <p className="form-errors" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <button className="text-button" onClick={() => void resend()} disabled={resending}>
        Reenviar verificación
      </button>
      <p className="muted">
        No necesitas registrar otra cuenta si cierras esta página. Podrás verificar el correo desde
        el inicio de sesión y completar después tu perfil.
      </p>
    </>
  );
}
