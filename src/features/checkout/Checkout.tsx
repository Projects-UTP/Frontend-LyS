import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Campo, ResumenErrores } from '@/shared/ui/Formulario';
import { useErrorSummary } from '@/shared/lib/formularios';
import { useCarrito } from '@/features/carrito/store';
import { useAuth } from '@/features/autenticacion/context';
import { usePerfil } from '@/features/autenticacion/api';
import { soles } from '@/features/catalogo/api';
import {
  cotizar,
  crearPedido,
  useLocales,
  type Cotizacion,
  type Solicitud,
} from '@/features/pedidos/api';
import { guardarAcceso, intentoPedido } from '@/features/pedidos/acceso';
import { checkoutSchema, type DatosCheckout } from './validacion';
export function Checkout() {
  const cart = useCarrito();
  const auth = useAuth();
  const perfil = usePerfil();
  const locales = useLocales();
  const navigate = useNavigate();
  const queries = useQueryClient();
  const form = useForm<DatosCheckout>({
    resolver: zodResolver(checkoutSchema),
    shouldFocusError: false,
    defaultValues: {
      modalidad: 'RECOJO_LOCAL',
      local_id: '',
      nombres: '',
      celular: '',
      correo: '',
      direccion: '',
      distrito: '',
      referencia: '',
      metodo_previsto: 'EFECTIVO',
    },
  });
  const { summary, invalid } = useErrorSummary();
  const [paso, setPaso] = useState(1);
  const [invitado, setInvitado] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState<{ solicitud: Solicitud; cotizacion: Cotizacion } | null>(
    null,
  );
  const precargado = useRef(false);
  const intento = useRef<{ id: string; acceso: string } | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const modalidad = useWatch({ control: form.control, name: 'modalidad' });
  const localId = useWatch({ control: form.control, name: 'local_id' });
  useEffect(() => {
    if (locales.data?.length === 1 && !form.getValues('local_id'))
      form.setValue('local_id', locales.data[0].id);
  }, [locales.data, form]);
  useEffect(() => {
    if (
      perfil.data &&
      !precargado.current &&
      !['nombres', 'celular', 'correo'].some(
        (n) => form.getFieldState(n as 'nombres' | 'celular' | 'correo').isDirty,
      )
    ) {
      form.setValue('nombres', `${perfil.data.nombres} ${perfil.data.apellidos}`);
      form.setValue('celular', perfil.data.celular);
      form.setValue('correo', auth.usuario?.email ?? '');
      precargado.current = true;
    }
  }, [perfil.data, auth.usuario, form]);
  const siguiente = (n: number) => {
    form.clearErrors();
    setPaso(n);
    setError('');
    requestAnimationFrame(() => titulo.current?.focus());
  };
  const confirmar = useMutation({
    mutationFn: async () => {
      if (!revision) throw new Error('Vuelve a revisar el pedido.');
      if (JSON.stringify(cart.items) !== JSON.stringify(revision.solicitud.items))
        throw new Error('El carrito cambió. Vuelve a revisar el pedido.');
      intento.current ??= await intentoPedido(
        revision.solicitud,
        revision.cotizacion.version,
        auth.usuario?.id ?? 'invitado',
      );
      const respuesta = await crearPedido(
        revision.solicitud,
        revision.cotizacion.version,
        intento.current,
      );
      if (!auth.usuario) guardarAcceso(respuesta.codigo, intento.current.acceso);
      return respuesta;
    },
    onSuccess: (r) => {
      cart.vaciar();
      queries.invalidateQueries({ queryKey: ['pedidos'] });
      try {
        sessionStorage.removeItem('lys-intento-pedido');
      } catch {
        /* Pedido confirmado; el carrito ya puede vaciarse. */
      }
      navigate(`/pedido/${r.codigo}/confirmacion`, { replace: true });
    },
    onError: (e) => {
      setError(e.message);
    },
    retry: false,
  });
  if (!cart.items.length)
    return (
      <section className="container commerce-section empty-state">
        <h1>No hay productos para revisar</h1>
        <Link className="action" to="/carta">
          VOLVER A LA CARTA
        </Link>
      </section>
    );
  return (
    <section className="container commerce-section checkout-shell">
      <div className="section-top">
        <div>
          <p className="eyebrow">TU PEDIDO, PASO A PASO</p>
          <h1>Revisar y pedir</h1>
        </div>
        <Link className="text-button" to="/carrito">
          Volver al carrito
        </Link>
      </div>
      <p className="demo-banner">
        Pedido de demostración · precios referenciales. Este flujo no procesa pagos reales.
      </p>
      <ol className="checkout-progress" aria-label="Pasos del pedido">
        {['Modalidad', 'Datos y pago previsto', 'Revisión'].map((t, i) => (
          <li key={t} aria-current={paso === i + 1 ? 'step' : undefined}>
            <span>{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <div className="checkout-panel">
        <h2 tabIndex={-1} ref={titulo}>
          {paso === 1
            ? '¿Dónde disfrutarás tu pedido?'
            : paso === 2
              ? 'Tus datos de contacto'
              : 'Revisa antes de confirmar'}
        </h2>
        {!auth.usuario && !invitado ? (
          <div className="guest-choice">
            {auth.cargando && <p role="status">Comprobando tu sesión…</p>}
            <p>Puedes pedir sin crear una cuenta.</p>
            <button className="action" disabled={auth.cargando} onClick={() => setInvitado(true)}>
              CONTINUAR COMO INVITADO
            </button>
            <Link className="text-button" to="/iniciar-sesion?volver=/checkout">
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            {auth.usuario && (
              <p className="muted">
                Usamos tus datos de cuenta. Puedes corregirlos para este pedido sin modificar tu
                perfil.
              </p>
            )}
            {perfil.error && auth.usuario && (
              <p role="alert">
                No pudimos precargar tu perfil. Completa los datos para este pedido.
              </p>
            )}
            {paso < 3 ? (
              <form
                noValidate
                onSubmit={(event) => {
                  void form.handleSubmit(async (values) => {
                    setError('');
                    const solicitud: Solicitud = {
                      items: cart.items.map((i) => ({ ...i })),
                      modalidad: values.modalidad,
                      local_id: values.local_id,
                      contacto: {
                        nombres: values.nombres,
                        celular: values.celular,
                        correo: values.correo,
                      },
                      direccion:
                        values.modalidad === 'DELIVERY'
                          ? {
                              direccion: values.direccion,
                              distrito: values.distrito,
                              referencia: values.referencia,
                            }
                          : null,
                      metodo_previsto: values.metodo_previsto,
                    };
                    try {
                      const c = await cotizar(solicitud);
                      setRevision({ solicitud, cotizacion: c });
                      intento.current = null;
                      siguiente(3);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'No pudimos revisar tu pedido.');
                    }
                  }, invalid)(event);
                }}
              >
                <ResumenErrores errors={form.formState.errors} summary={summary} />
                {paso === 1 ? (
                  <>
                    <fieldset>
                      <legend>Modalidad</legend>
                      <div className="choice-grid">
                        <label>
                          <input
                            type="radio"
                            value="RECOJO_LOCAL"
                            {...form.register('modalidad')}
                          />
                          Recojo en el local
                        </label>
                        <label>
                          <input type="radio" value="DELIVERY" {...form.register('modalidad')} />
                          Delivery
                        </label>
                      </div>
                    </fieldset>
                    {locales.isPending ? (
                      <p role="status">Consultando el local…</p>
                    ) : locales.error ? (
                      <div role="alert">
                        <p>{locales.error.message}</p>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => void locales.refetch()}
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : !locales.data?.length ? (
                      <p role="alert">No hay locales disponibles para recibir pedidos.</p>
                    ) : (
                      <div className="form-field">
                        <label htmlFor="local_id">
                          Local
                          <select
                            id="local_id"
                            {...form.register('local_id')}
                            aria-invalid={!!form.formState.errors.local_id}
                            aria-describedby={
                              form.formState.errors.local_id ? 'local_id-error' : undefined
                            }
                          >
                            {locales.data.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                        {form.formState.errors.local_id && (
                          <p className="field-error" id="local_id-error">
                            {form.formState.errors.local_id.message}
                          </p>
                        )}
                        <p className="local-address">
                          {locales.data.find((l) => l.id === localId)?.direccion}
                        </p>
                      </div>
                    )}
                    {modalidad === 'DELIVERY' && (
                      <>
                        <Campo
                          name="direccion"
                          label="Dirección"
                          autoComplete="street-address"
                          register={form.register}
                          errors={form.formState.errors}
                        />
                        <Campo
                          name="distrito"
                          label="Distrito"
                          autoComplete="address-level2"
                          register={form.register}
                          errors={form.formState.errors}
                        />
                        <Campo
                          name="referencia"
                          label="Referencia (opcional)"
                          register={form.register}
                          errors={form.formState.errors}
                        />
                        <p className="delivery-note">
                          Costo de delivery pendiente de confirmación. El total definitivo aún no
                          está disponible.
                        </p>
                      </>
                    )}
                    <button
                      type="button"
                      className="action"
                      disabled={locales.isPending || !!locales.error || !locales.data?.length}
                      onClick={async () => {
                        if (
                          await form.trigger([
                            'modalidad',
                            'local_id',
                            'direccion',
                            'distrito',
                            'referencia',
                          ])
                        )
                          siguiente(2);
                        else invalid();
                      }}
                    >
                      CONTINUAR
                    </button>
                  </>
                ) : (
                  <>
                    <Campo
                      name="nombres"
                      label="Nombres y apellidos"
                      autoComplete="name"
                      register={form.register}
                      errors={form.formState.errors}
                    />
                    <Campo
                      name="celular"
                      label="Celular"
                      type="tel"
                      autoComplete="tel-national"
                      register={form.register}
                      errors={form.formState.errors}
                    />
                    <Campo
                      name="correo"
                      label="Correo (opcional)"
                      type="email"
                      autoComplete="email"
                      register={form.register}
                      errors={form.formState.errors}
                    />
                    <fieldset>
                      <legend>Método de pago previsto</legend>
                      <div className="choice-grid">
                        {(['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA'] as const).map((m) => (
                          <label key={m}>
                            <input type="radio" value={m} {...form.register('metodo_previsto')} />
                            {m === 'TARJETA' ? 'Tarjeta' : m[0] + m.slice(1).toLowerCase()}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <p className="delivery-note">
                      Esta selección no realiza un cobro. El pago quedará pendiente.
                    </p>
                    <div className="checkout-actions">
                      <button
                        type="button"
                        className="text-button"
                        disabled={form.formState.isSubmitting}
                        onClick={() => siguiente(1)}
                      >
                        Volver a modalidad
                      </button>
                      <button className="action" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'CONSULTANDO IMPORTES…' : 'REVISAR PEDIDO'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              revision && (
                <>
                  <div className="review-layout">
                    <div>
                      <h3>Productos</h3>
                      <ul className="review-items">
                        {revision.cotizacion.items.map((i) => (
                          <li key={i.product_id}>
                            <span>
                              {i.quantity} × {i.nombre}
                            </span>
                            <strong>{soles(i.subtotal)}</strong>
                          </li>
                        ))}
                      </ul>
                      <h3>Contacto</h3>
                      <p>
                        {revision.solicitud.contacto.nombres}
                        <br />
                        {revision.solicitud.contacto.celular}
                        <br />
                        {revision.solicitud.contacto.correo}
                      </p>
                      <h3>
                        {revision.solicitud.modalidad === 'RECOJO_LOCAL'
                          ? 'Recojo en local'
                          : 'Delivery'}
                      </h3>
                      <p>{revision.cotizacion.local_nombre}</p>
                      <p>
                        {locales.data?.find((l) => l.id === revision.solicitud.local_id)?.direccion}
                      </p>
                      {revision.solicitud.direccion && (
                        <p>
                          {revision.solicitud.direccion.direccion}
                          <br />
                          {revision.solicitud.direccion.distrito}
                          <br />
                          {revision.solicitud.direccion.referencia}
                        </p>
                      )}
                      <h3>Pago previsto</h3>
                      <p>{revision.solicitud.metodo_previsto} · pendiente de pago</p>
                    </div>
                    <aside className="order-summary">
                      <h3>Importes del servidor</h3>
                      <dl>
                        <dt>Subtotal</dt>
                        <dd>{soles(revision.cotizacion.subtotal)}</dd>
                        <dt>Descuento</dt>
                        <dd>{soles(revision.cotizacion.descuento)}</dd>
                        <dt>Delivery</dt>
                        <dd>
                          {revision.cotizacion.costo_delivery === null
                            ? 'Por confirmar'
                            : soles(revision.cotizacion.costo_delivery)}
                        </dd>
                        <dt>Total</dt>
                        <dd>
                          {revision.cotizacion.total === null
                            ? 'Pendiente'
                            : soles(revision.cotizacion.total)}
                        </dd>
                      </dl>
                      {revision.cotizacion.total === null && (
                        <p>Costo de delivery pendiente de confirmación.</p>
                      )}
                      <p>Al confirmar se registra el pedido. No se aprueba ningún pago.</p>
                    </aside>
                  </div>
                  <div className="checkout-actions">
                    <button
                      className="text-button"
                      disabled={confirmar.isPending}
                      onClick={() => siguiente(2)}
                    >
                      Corregir datos
                    </button>
                    <button
                      className="action"
                      disabled={confirmar.isPending}
                      onClick={() => confirmar.mutate()}
                    >
                      {confirmar.isPending ? 'REGISTRANDO…' : 'CONFIRMAR PEDIDO'}
                    </button>
                  </div>
                </>
              )
            )}
          </>
        )}
        {error && (
          <div className="form-errors" role="alert">
            <p>{error}</p>
            {paso === 3 && !confirmar.isPending && (
              <button className="text-button" onClick={() => siguiente(2)}>
                Volver a revisar
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
