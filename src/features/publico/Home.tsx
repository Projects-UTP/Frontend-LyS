import { Hero } from './Hero';
import { Categories, Promotions, Benefits, CallToAction, LocationSection } from './Sections';
export function Home() {
  return (
    <>
      <Hero />
      <Promotions />
      <Categories />
      <Benefits />
      <LocationSection />
      <CallToAction />
    </>
  );
}
