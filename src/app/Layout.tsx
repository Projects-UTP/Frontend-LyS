import { Outlet, Link } from 'react-router-dom';
import { Container } from '@/shared/ui';

export function Layout() {
  return <><header><Container><Link to="/">Leñas y Sabores</Link></Container></header><main id="contenido"><Outlet /></main><footer><Container>Leñas y Sabores · Carabayllo, Lima</Container></footer></>;
}
