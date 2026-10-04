import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMesas } from './api';
import { useOperativo } from './context';
export function Mesas() {
  const query = useMesas(),
    { roles } = useOperativo();
  const [zona, setZona] = useState(''),
    [estado, setEstado] = useState(''),
    [limite, setLimite] = useState(50);
  if (!roles.some((r) => ['MOZO', 'CAJA', 'ADMINISTRADOR'].includes(r)))
    return (
      <>
        <h1>Sin acceso a mesas</h1>
        <p>Tu rol no permite consultar el salón.</p>
      </>
    );
  const mesas = query.data ?? [],
    visibles = mesas.filter((m) => (!zona || m.zona === zona) && (!estado || m.estado === estado));
  return (
    <>
      <div className="op-title">
        <div>
          <p className="op-kicker">SALÓN</p>
          <h1>Mesas del local</h1>
        </div>
        <button disabled={query.isFetching} onClick={() => void query.refetch()}>
          Actualizar mesas
        </button>
      </div>
      {mesas.some((m) => m.demostracion) && (
        <p className="op-notice">
          Distribución de demostración. Mesas y zonas configurables; aforo pendiente de
          confirmación.
        </p>
      )}
      <div className="op-filters">
        <label>
          Zona
          <select
            value={zona}
            onChange={(e) => {
              setZona(e.target.value);
              setLimite(50);
            }}
          >
            <option value="">Todas las zonas</option>
            {[...new Set(mesas.map((m) => m.zona))].map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setLimite(50);
            }}
          >
            <option value="">Todos los estados</option>
            {[...new Set(mesas.map((m) => m.estado))].map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
        <p>{visibles.length} mesas</p>
      </div>
      {query.isPending ? (
        <p role="status">Cargando mesas…</p>
      ) : query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : visibles.length === 0 ? (
        <p>No hay mesas con estos filtros.</p>
      ) : (
        <div className="op-table-grid">
          {visibles.slice(0, limite).map((m) => (
            <Link
              key={m.id}
              className={`op-table op-table-${m.estado.toLowerCase()}`}
              to={`/operativo/mesa/${m.id}`}
              aria-label={`${m.nombre}, ${m.estado.replaceAll('_', ' ')}`}
            >
              <span>{m.zona}</span>
              <strong>{m.nombre}</strong>
              <span className="op-badge">{m.estado.replaceAll('_', ' ')}</span>
              {m.capacidad && <small>{m.capacidad} personas</small>}
            </Link>
          ))}
        </div>
      )}
      {visibles.length > limite && (
        <button onClick={() => setLimite((l) => l + 50)}>Mostrar más mesas</button>
      )}
    </>
  );
}
