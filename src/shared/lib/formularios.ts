import { useRef } from 'react';
export function useErrorSummary() {
  const summary = useRef<HTMLDivElement>(null);
  return { summary, invalid: () => requestAnimationFrame(() => summary.current?.focus()) };
}
