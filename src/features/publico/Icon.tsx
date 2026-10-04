const paths = {
  flame: 'M12 3c2 5-3 5-1 9 1-2 3-3 3-5 5 5 5 12-2 14C4 23 3 14 7 10c-1 4 1 5 2 5-2-5 2-7 3-12Z',
  people:
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9v-3a6 6 0 0 1 12 0v3H3Zm14-16a4 4 0 0 1 0 8m2 8v-3a6 6 0 0 0-2-4',
  truck:
    'M3 5h11v12H3V5Zm11 4h4l3 4v4h-7V9ZM7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm11 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l4 2',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
} as const;
export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
