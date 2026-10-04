import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect } from 'vitest';
import { App } from './App';
it('Una ruta inexistente ofrece volver al inicio', () => {
  window.history.replaceState({}, '', '/no-existe');
  render(<App />);
  expect(
    screen.getByRole('heading', { name: 'Esta página se pasó de cocción.' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'VOLVER AL INICIO' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Sabor peruano en cada brasa',
  );
});
