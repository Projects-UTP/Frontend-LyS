import titles from './bakso-titulares.json';
// Arte rasterizado de frases completas, con texto accesible. No distribuye la fuente.
export function BaksoText({ text }: { text: string }) {
  const art = titles[text as keyof typeof titles];
  if (!art) return <>{text}</>;
  return (
    <span className="bakso-title">
      <span className="bakso-accessible">{text}</span>
      <span
        aria-hidden="true"
        className="bakso-art"
        style={{
          width: `${art.width}em`,
          aspectRatio: art.ratio,
          maskImage: `url('/typography/${art.file}')`,
        }}
      />
    </span>
  );
}
