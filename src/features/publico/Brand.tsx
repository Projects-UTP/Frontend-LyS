import { Link } from 'react-router-dom';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Leñas y Sabores, inicio">
      <img
        src={`/images/imagotipo${light ? '-blanco' : ''}.webp`}
        width="600"
        height={light ? 202 : 209}
        alt="Leñas y Sabores · Pollos y Parrillas"
      />
    </Link>
  );
}
