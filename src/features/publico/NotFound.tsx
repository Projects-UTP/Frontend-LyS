import { ActionLink, Container } from '@/shared/ui';
import { BaksoText } from '@/shared/ui/BaksoText';
export function NotFound() {
  return (
    <Container className="not-found">
      <p className="eyebrow">404 · Página no encontrada</p>
      <h1>
        <BaksoText text="Esta página se pasó de cocción." />
      </h1>
      <p>La dirección que buscas no existe. Volvamos a donde nace el sabor.</p>
      <ActionLink to="/">VOLVER AL INICIO</ActionLink>
    </Container>
  );
}
