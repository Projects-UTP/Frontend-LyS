import { useEffect } from 'react';
export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | Leñas y Sabores`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    const origin = import.meta.env.VITE_SITE_URL;
    if (origin) {
      let canonical = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.append(canonical);
      }
      canonical.href = new URL(location.pathname, origin).href;
    }
  }, [title, description]);
}
