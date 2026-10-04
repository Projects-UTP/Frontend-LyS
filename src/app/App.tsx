export function App() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-20">
      <p className="font-heading text-2xl tracking-wide text-brand-red-500">LEÑAS Y SABORES</p>
      <h1 className="mt-6 max-w-3xl font-display text-display leading-tight text-neutral-950">
        Sabor que nace de las brasas
      </h1>
      <p className="mt-6 max-w-xl text-lg text-neutral-600">
        Pollo a la brasa y parrillas en Carabayllo, Lima.
      </p>
      <a className="mt-8 inline-flex min-h-12 max-w-full items-center rounded px-6 font-heading text-2xl tracking-wide bg-brand-red-500 text-white transition-colors hover:bg-brand-red-700" href="tel:+51947540597">
        CONTÁCTANOS
      </a>
      <section aria-labelledby="local-title" className="mt-16 border-t border-brand-red-50 pt-8">
        <h2 id="local-title" className="font-heading text-heading text-neutral-950">Nuestro local</h2>
        <address className="mt-3 max-w-xl not-italic text-neutral-600">
          C. Turístico Los Palomares Mz. D Lt. 5, frente a la Planta Eléctrica San Benito, Carabayllo, Lima, Perú.
        </address>
        <p className="mt-3 text-neutral-600">De 12:00 p. m. a 12:00 a. m.</p>
      </section>
    </main>
  );
}
