// Información confirmada centralizada; la carta de muestra no representa oferta vigente.
export const negocio = {
  nombre: 'Leñas y Sabores',
  razonSocial: 'LOKO BRASA S.A.C.',
  direccion:
    'C. Turístico Los Palomares Mz. D Lt. 5, frente a la Planta Eléctrica San Benito, Carabayllo, Lima, Perú.',
  horario: '12:00 p. m. — 12:00 a. m.',
  telefono: '+51 947 540 597',
  adicional: '+51 972 193 346',
  whatsapp:
    'https://wa.me/51947540597?text=' +
    encodeURIComponent('Hola, Leñas y Sabores. Quisiera consultar la carta y realizar un pedido.'),
};
export const navegacion = [
  { to: '/', label: 'Inicio' },
  { to: '/carta', label: 'Carta' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/locales', label: 'Locales' },
  { to: '/contacto', label: 'Contacto' },
];
export const categorias = [
  'Pollos a la brasa',
  'Parrillas',
  'Anticuchos',
  'Acompañamientos',
  'Bebidas',
  'Combos',
  'Alitas',
];
export const categoriasInicio = [
  { nombre: 'Pollos a la brasa', imagen: 'cat-pollos' },
  { nombre: 'Parrillas', imagen: 'cat-parrillas' },
  { nombre: 'Alitas', imagen: 'cat-alitas' },
  { nombre: 'Acompañamientos', imagen: 'catalogo-v2-papas' },
  { nombre: 'Bebidas', imagen: 'cat-bebidas' },
];
export const productosMuestra = [
  {
    id: 'pollo',
    categoria: 'Pollos a la brasa',
    nombre: 'Pollo entero',
    descripcion: 'Una presentación de nuestra propuesta de brasa para compartir.',
    imagen: 'fav-pollo-entero',
  },
  {
    id: 'cuarto',
    categoria: 'Pollos a la brasa',
    nombre: 'Un cuarto de pollo',
    descripcion: 'Tu antojo de brasa, en una presentación individual de muestra.',
    imagen: 'fav-cuarto-pollo',
  },
  {
    id: 'anticuchos',
    categoria: 'Anticuchos',
    nombre: 'Anticuchos',
    descripcion: 'Una muestra de la categoría. Consulta las opciones disponibles.',
    imagen: 'fav-anticuchos',
  },
];
