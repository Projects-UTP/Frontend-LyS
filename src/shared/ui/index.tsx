import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';

const actionClass = 'action';
export function Button(props: ComponentProps<'button'>) { return <button {...props} className={`${actionClass} ${props.className ?? ''}`} />; }
export function ActionLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return to.startsWith('/') ? <Link className={`${actionClass} ${className}`} to={to}>{children}</Link> : <a className={`${actionClass} ${className}`} href={to}>{children}</a>;
}
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`container ${className}`}>{children}</div>; }
export function Section({ title, id, children, eyebrow }: { title: string; id: string; children: ReactNode; eyebrow?: string }) {
  return <section className="section" id={id} aria-labelledby={`${id}-title`}><Container>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 id={`${id}-title`} className="section-title">{title}</h2>{children}</Container></section>;
}
export function Input({ label, id, ...props }: ComponentProps<'input'> & { label: string; id: string }) { return <label className="input-label" htmlFor={id}>{label}<input {...props} id={id} className="input" /></label>; }
export function Badge({ children }: { children: ReactNode }) { return <span className="badge">{children}</span>; }
export function Loader() { return <p role="status" className="feedback">Cargando…</p>; }
export function Feedback({ children }: { children: ReactNode }) { return <p role="status" className="feedback">{children}</p>; }
