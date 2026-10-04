import { type InputHTMLAttributes, type ReactNode } from 'react';
import type { useErrorSummary } from '@/shared/lib/formularios';
import {
  get,
  type FieldErrors,
  type FieldError,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from 'react-hook-form';
export function Campo<T extends FieldValues>({
  name,
  label,
  register,
  errors,
  ...props
}: {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
} & InputHTMLAttributes<HTMLInputElement>) {
  const error = get(errors, name) as FieldError | undefined;
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        <input
          {...props}
          id={name}
          {...register(name)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </label>
      {error && (
        <p className="field-error" id={`${name}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
}
export function ResumenErrores<T extends FieldValues>({
  errors,
  summary,
}: {
  errors: FieldErrors<T>;
  summary: ReturnType<typeof useErrorSummary>['summary'];
}) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  return (
    <div className="form-errors" role="alert" tabIndex={-1} ref={summary}>
      <h2>Revisa estos datos</h2>
      <ul>
        {entries.map(([key, e]) => (
          <li key={key}>
            <a href={`#${key}`}>{String((e as FieldError).message)}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
export function MarcoCuenta({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="container commerce-section account-grid">
      <aside className="account-story">
        <p className="eyebrow">LEÑAS Y SABORES</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <img
          src="/images/cat-pollos.webp"
          width="1024"
          height="768"
          alt="Pollo a la brasa · imagen referencial"
        />
      </aside>
      <div className="account-panel">{children}</div>
    </section>
  );
}
