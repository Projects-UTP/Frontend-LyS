import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Campo, MarcoCuenta, ResumenErrores } from '@/shared/ui/Formulario';
import { useErrorSummary } from '@/shared/lib/formularios';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { correo, codigoSchema } from './validacion';
import { errorAuth, redireccionSegura } from './api';
import { useAuth } from './context';
const esquema = z.object({
  correo,
  contrasena: z.string().min(1, 'Escribe tu contraseña.').max(72),
});
export function IniciarSesion() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const destino = redireccionSegura(params.get('volver'));
  const form = useForm<z.infer<typeof esquema>>({
    resolver: zodResolver(esquema),
    shouldFocusError: false,
  });
  const codigo = useForm<{ codigo: string }>({ resolver: zodResolver(codigoSchema) });
  const { summary, invalid } = useErrorSummary();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  if (!auth.cargando && auth.usuario) return <Navigate replace to={destino} />;
  return (
    <MarcoCuenta
      title="Vuelve a tu mesa"
      description="Ingresa a tu cuenta para consultar tus datos y próximos pedidos."
    >
      <h2>Iniciar sesión</h2>
      <form
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          setError('');
          setEmail('');
          const { error: err } = await crearClienteInsforge().auth.signInWithPassword({
            email: values.correo,
            password: values.contrasena,
          });
          if (err) {
            setError(errorAuth(err));
            if (err.statusCode === 403 || /verif/i.test(err.message)) setEmail(values.correo);
            return;
          }
          form.reset();
          await auth.actualizar();
          navigate(destino, { replace: true });
        }, invalid)}
      >
        <ResumenErrores errors={form.formState.errors} summary={summary} />
        <Campo
          name="correo"
          label="Correo"
          type="email"
          autoComplete="email"
          register={form.register}
          errors={form.formState.errors}
        />
        <Campo
          name="contrasena"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          register={form.register}
          errors={form.formState.errors}
        />
        {error && (
          <p className="form-errors" role="alert">
            {error}
          </p>
        )}
        <button className="action" disabled={form.formState.isSubmitting || auth.cargando}>
          {form.formState.isSubmitting ? 'INICIANDO SESIÓN…' : 'INICIAR SESIÓN'}
        </button>
      </form>
      {email && (
        <section aria-label="Verificación pendiente">
          <h3>Verifica tu correo</h3>
          <p>Introduce el código enviado a tu correo para continuar.</p>
          <form
            noValidate
            onSubmit={codigo.handleSubmit(async (values) => {
              setError('');
              const { error: err } = await crearClienteInsforge().auth.verifyEmail({
                email,
                otp: values.codigo,
              });
              if (err) {
                setError(errorAuth(err));
                return;
              }
              await auth.actualizar();
              navigate(destino, { replace: true });
            })}
          >
            <Campo
              name="codigo"
              label="Código de verificación"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              register={codigo.register}
              errors={codigo.formState.errors}
            />
            <button className="action" disabled={codigo.formState.isSubmitting}>
              VERIFICAR CORREO
            </button>
          </form>
          <button
            className="text-button"
            disabled={enviando}
            onClick={async () => {
              setEnviando(true);
              try {
                const { error: err } = await crearClienteInsforge().auth.resendVerificationEmail({
                  email,
                });
                setMensaje(
                  err ? errorAuth(err) : 'Solicitud enviada. Revisa también correo no deseado.',
                );
              } finally {
                setEnviando(false);
              }
            }}
          >
            Reenviar código
          </button>
          {mensaje && <p role="status">{mensaje}</p>}
        </section>
      )}
      <p className="account-links">
        <Link to="/recuperar-acceso">Olvidé mi contraseña</Link>
      </p>
      <p className="account-links">
        ¿Primera visita? <Link to="/registro">Crear cuenta</Link>
      </p>
    </MarcoCuenta>
  );
}
