import { Link } from 'react-router-dom';
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Leñas y Sabores, inicio">
      <img src="/images/isotipo.webp" width="44" height="44" alt="" />
      <span>
        LEÑAS <span className="brand-and">&</span> SABORES
        <small>POLLO A LA BRASA · CARABAYLLO</small>
      </span>
    </Link>
  );
}
