// Información confirmada centralizada; la carta de muestra no representa oferta vigente.
export const negocio = {
  nombre: 'Leñas y Sabores', razonSocial: 'LOKO BRASA S.A.C.',
  direccion: 'C. Turístico Los Palomares Mz. D Lt. 5, frente a la Planta Eléctrica San Benito, Carabayllo, Lima, Perú.',
  horario: '12:00 p. m. — 12:00 a. m.', telefono: '+51 947 540 597', adicional: '+51 972 193 346',
  whatsapp: 'https://wa.me/51947540597?text=' + encodeURIComponent('Hola, Leñas y Sabores. Quisiera consultar la carta y realizar un pedido.'),
};
export const navegacion = [
  { to: '/', label: 'Inicio' }, { to: '/carta', label: 'Carta' },
  { to: '/promociones', label: 'Promociones' }, { to: '/nosotros', label: 'Nosotros' },
  { to: '/locales', label: 'Locales' }, { to: '/contacto', label: 'Contacto' },
];
export const categorias = ['Pollos a la brasa', 'Parrillas', 'Anticuchos', 'Acompañamientos', 'Bebidas', 'Combos'];
export const productosMuestra = [
  { id: 'pollo', categoria: 'Pollos a la brasa', nombre: 'Pollo a la brasa', descripcion: 'Una presentación de nuestra propuesta de brasa para compartir.', imagen: true },
  { id: 'parrilla', categoria: 'Parrillas', nombre: 'Parrilla para compartir', descripcion: 'Una idea de selección a la parrilla. Composición pendiente de confirmar.', imagen: false },
  { id: 'anticuchos', categoria: 'Anticuchos', nombre: 'Anticuchos', descripcion: 'Una muestra de la categoría. Consulta las opciones disponibles.', imagen: false },
];
