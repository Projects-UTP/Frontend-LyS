import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input, Button } from './index';
describe('Componentes accesibles', () => {
  it('Asocia la etiqueta del campo y respeta un botón deshabilitado', () => {
    const click = vi.fn();
    render(<><Input id="nombre" label="Nombre" /><Button disabled onClick={click}>Continuar</Button></>);
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(click).not.toHaveBeenCalled();
  });
});
