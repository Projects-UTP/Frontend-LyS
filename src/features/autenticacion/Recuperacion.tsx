import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Campo, MarcoCuenta, ResumenErrores } from '@/shared/ui/Formulario';
import { useErrorSummary } from '@/shared/lib/formularios';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { correo, contrasena, codigoSchema } from './validacion';
const solicitar = z.object({ correo });
const cambiar = codigoSchema
  .extend({ contrasena, confirmacion: z.string() })
  .refine((v) => v.contrasena === v.confirmacion, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmacion'],
  });
export function RecuperarAcceso() {
  const form = useForm<z.infer<typeof solicitar>>({
    resolver: zodResolver(solicitar),
    shouldFocusError: false,
  });
  const cambio = useForm<z.infer<typeof cambiar>>({
    resolver: zodResolver(cambiar),
    shouldFocusError: false,
  });
  const resumen = useErrorSummary();
  const resumenCambio = useErrorSummary();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [listo, setListo] = useState(false);
  return (
    <MarcoCuenta
      title="Recupera tu acceso"
      description="Vuelve a disfrutar de tu mesa. No compartas tu código ni tu contraseña."
    >
      <h2>
        {listo ? 'Contraseña actualizada' : email ? 'Cambiar contraseña' : 'Recuperar contraseña'}
      </h2>
      {listo ? (
        <>
          <p role="status">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Link className="action" to="/iniciar-sesion">
            INICIAR SESIÓN
          </Link>
        </>
      ) : !email ? (
        <form
          noValidate
          onSubmit={form.handleSubmit(async (v) => {
            setError('');
            const sdk = crearClienteInsforge();
            const config = await sdk.auth.getPublicAuthConfig();
            if (config.error) {
              setError('No pudimos consultar la configuración. Reintenta.');
              return;
            }
            if (config.data?.resetPasswordMethod !== 'code') {
              setError(
                'La recuperación por código no está habilitada. Consulta al local para recuperar el acceso.',
              );
              return;
            }
            const { error: err } = await sdk.auth.sendResetPasswordEmail({ email: v.correo });
            if (err) {
              setError('No pudimos enviar la solicitud. Espera un momento y reintenta.');
              return;
            }
            setEmail(v.correo);
            form.reset();
          }, resumen.invalid)}
        >
          <ResumenErrores errors={form.formState.errors} summary={resumen.summary} />
          <Campo
            name="correo"
            label="Correo"
            type="email"
            autoComplete="email"
            register={form.register}
            errors={form.formState.errors}
          />
          <button className="action" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'ENVIANDO…' : 'ENVIAR CÓDIGO'}
          </button>
        </form>
      ) : (
        <>
          <p role="status">
            Si existe una cuenta con ese correo, recibirás un código. Revisa también correo no
            deseado.
          </p>
          <form
            noValidate
            onSubmit={cambio.handleSubmit(async (v) => {
              setError('');
              const sdk = crearClienteInsforge();
              let temporal = token;
              if (!temporal) {
                const respuesta = await sdk.auth.exchangeResetPasswordToken({
                  email,
                  code: v.codigo,
                });
                if (respuesta.error || !respuesta.data) {
                  setError(
                    'El código no es válido o venció. Solicita otro e inténtalo nuevamente.',
                  );
                  return;
                }
                temporal = respuesta.data.token;
                setToken(temporal);
              }
              // El token de cambio permanece solo en memoria, nunca en URL o almacenamiento.
              const { error: err } = await sdk.auth.resetPassword({
                otp: temporal,
                newPassword: v.contrasena,
              });
              if (err) {
                setError(
                  'No pudimos cambiar la contraseña. Reintenta o solicita otro código si venció.',
                );
                return;
              }
              setToken('');
              setEmail('');
              cambio.reset();
              setListo(true);
            }, resumenCambio.invalid)}
          >
            <ResumenErrores errors={cambio.formState.errors} summary={resumenCambio.summary} />
            <Campo
              name="codigo"
              label="Código de recuperación"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              register={cambio.register}
              errors={cambio.formState.errors}
            />
            <Campo
              name="contrasena"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              register={cambio.register}
              errors={cambio.formState.errors}
            />
            <Campo
              name="confirmacion"
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              register={cambio.register}
              errors={cambio.formState.errors}
            />
            <button className="action" disabled={cambio.formState.isSubmitting}>
              {cambio.formState.isSubmitting ? 'ACTUALIZANDO…' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </form>
          <button
            className="text-button"
            disabled={cambio.formState.isSubmitting}
            onClick={() => {
              setEmail('');
              setToken('');
              setError('');
              cambio.reset();
            }}
          >
            Solicitar otro código
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="form-errors">
          {error}
        </p>
      )}
      {!listo && (
        <p className="account-links">
          <Link to="/iniciar-sesion">Volver a iniciar sesión</Link>
        </p>
      )}
    </MarcoCuenta>
  );
}
