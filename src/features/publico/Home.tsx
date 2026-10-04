import { Hero } from './Hero';
import {
  Categories,
  Promotions,
  About,
  FeaturedProducts,
  Services,
  LocationSection,
} from './Sections';
export function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Promotions />
      <About />
      <FeaturedProducts />
      <Services />
      <LocationSection />
    </>
  );
}
