// Inline 16×16 stroke icons taken from the design prototype (Intranet.dc.html).
const PATHS = {
  bday: ['M2.5 13.5h11v-5h-11z M4 8.5v-2h8v2 M8 6.5v-2.5', 'M8 1.8v.4'],
  slava: ['M6.5 7h3v7h-3z', 'M8 1.5c1.2 1.4 1.2 2.6 0 3.5c-1.2-.9-1.2-2.1 0-3.5z'],
  event: ['M2.5 3.5h11v10h-11z M2.5 6.5h11 M5.5 2v2.5 M10.5 2v2.5'],
  food: ['M4.5 1.5v4a1.5 1.5 0 0 0 3 0v-4 M6 5.5v9 M11 14.5V1.5c-1.5.5-2.5 2-2.5 4v3h2.5'],
  holiday: ['M4 14.5v-12 M4 3h8l-2 3 2 3h-8'],
  rocket: ['M9.5 2.5c2-1 4-1 4-1s0 2-1 4L9 9 7 7z', 'M7 7 4.5 6.5 3 8l2.5 1 M9 9l.5 2.5L8 13l-1-2.5', 'M5.5 10.5c-1 .3-2 1.5-2 3c1.5 0 2.7-1 3-2'],
  personSearch: ['M6.5 7.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z M2 13.5c0-2.3 2-4 4.5-4c1 0 1.8.2 2.5.6', 'M11.8 13.2a1.9 1.9 0 1 0 0-3.8a1.9 1.9 0 0 0 0 3.8z M13.2 12.6l1.3 1.3'],
  sun: ['M8 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M8 1v1.5 M8 13.5V15 M1 8h1.5 M13.5 8H15 M3.1 3.1l1.1 1.1 M11.8 11.8l1.1 1.1 M3.1 12.9l1.1-1.1 M11.8 4.2l1.1-1.1'],
  moon: ['M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3z'],
  search: ['M7 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10z M10.6 10.6L14 14'],
  info: ['M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13z M8 7.5v4 M8 4.8v.1'],
  doc: ['M3 3.5h10v9H3z M3 6.5h10 M6 9.5h4'],
  vpn: ['M5 7V5a3 3 0 0 1 6 0v2 M3.5 7h9v6.5h-9z M8 9.5v1.5'],
  health: ['M8 14s-5-3-5-7a3 3 0 0 1 5-2a3 3 0 0 1 5 2c0 4-5 7-5 7z'],
  vacation: ['M2.5 4h11v9.5h-11z M2.5 7h11 M5.5 2.5v3 M10.5 2.5v3 M6 10l1.3 1.3L10 9'],
  card: ['M2 5h12v7H2z M2 7.5h12 M4.5 10h2'],
  alert: ['M8 2l6 11H2z M8 6.5v3 M8 11.3v.1'],
  home: ['M2.5 14.5v-8l5.5-4 5.5 4v8z M6.5 14.5v-4h3v4'],
  tag: ['M2.5 7.5 8 2h5.5v5.5L8 13z M10.5 5.5v.1'],
  image: ['M2.5 3.5h11v9h-11z M2.5 10.5l3-3 3 3 2-2 3 3 M10.5 5.5a.9.9 0 1 0 0 1.8a.9.9 0 0 0 0-1.8z'],
  wrench: ['M10 2.5a3 3 0 0 0-2.8 4L2.5 11.2l2.3 2.3 4.7-4.7A3 3 0 0 0 13.5 6l-1.8 1.8-1.5-.4-.4-1.5L11.6 4A3 3 0 0 0 10 2.5z'],
  parking: ['M3.5 14V8.5h9V14 M8 8.5V5 M6 5h4 M2.5 14h11', 'M6.5 11.5v-1.2a1.5 1.5 0 0 1 3 0v1.2'],
  chat: ['M2.5 3.5h11v7.5h-6l-3 2.5v-2.5h-2z'],
  arrow: ['M2.5 8h10 M9 4.5 12.5 8 9 11.5'],
  star: ['M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z'],
  poll: ['M3 13.5V8 M8 13.5V3 M13 13.5V6'],
  folder: ['M1.5 4.5a1 1 0 0 1 1-1h3.5l1.5 1.5h6a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z'],
  heart: ['M8 13.5S2 10 2 5.8A2.8 2.8 0 0 1 8 4.3a2.8 2.8 0 0 1 6 1.5C14 10 8 13.5 8 13.5z'],
  culture: ['M2 5h12v2a1.5 1.5 0 0 0 0 3v2H2v-2a1.5 1.5 0 0 0 0-3z M9.5 5v7'],
  weekend: ['M1.5 13.5 6 6l3 4.5 2-3 3.5 6z M11.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3z'],
  gastro: ['M4.5 1.5v4a1.5 1.5 0 0 0 3 0v-4 M6 5.5v9 M11 14.5V1.5c-1.5.5-2.5 2-2.5 4v3h2.5'],
  theater: ['M2 2.5h6.5v4a3.25 3.25 0 0 1-6.5 0z M7.5 6h6.5v4a3.25 3.25 0 0 1-6.5 0z M4 4.8h.1 M6.5 4.8h.1 M9.5 8.3h.1 M12 8.3h.1 M9.8 11.3c.7-.6 1.7-.6 2.4 0 M4 7.2c.7.6 1.7.6 2.4 0'],
  cinema: ['M3.5 6h9l-1.2 8H4.7z M6.2 6l.4 8 M9.8 6l-.4 8 M3.8 6a1.6 1.6 0 0 1 1.7-2.1a1.9 1.9 0 0 1 2.5-1.3a1.9 1.9 0 0 1 2.5 1.3A1.6 1.6 0 0 1 12.2 6'],
  concerts: ['M6 12.5V3.5l7-1.5v9 M6 12.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0z M13 11a2 2 0 1 1-4 0a2 2 0 0 1 4 0z'],
  books: ['M2.5 3h4A1.5 1.5 0 0 1 8 4.5v9A1.5 1.5 0 0 0 6.5 12h-4z M13.5 3h-4A1.5 1.5 0 0 0 8 4.5v9A1.5 1.5 0 0 1 9.5 12h4z'],
  salas: ['M2 14V7l6-4.5L14 7v7z M6 14v-4h4v4 M2 7h12'],
  wellness: ['M8 2s4.5 4.8 4.5 8a4.5 4.5 0 0 1-9 0C3.5 6.8 8 2 8 2z M6 10.5a2 2 0 0 0 2 2'],
  trips: ['M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13z M10.5 5.5 9 9l-3.5 1.5L7 7z'],
  mountains: ['M1.5 13.5 6 6l3 4.5 2-3 3.5 6z M11.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3z'],
  recipes: ['M2.5 7.5h11V10a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3z M1.5 7.5h13 M6 2.5c-.5.8.5 1.2 0 2 M10 2.5c-.5.8.5 1.2 0 2'],
  restaurants: ['M4.5 1.5v4a1.5 1.5 0 0 0 3 0v-4 M6 5.5v9 M11 14.5V1.5c-1.5.5-2.5 2-2.5 4v3h2.5'],
  coffee: ['M2.5 6h8v3.5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z M10.5 7h1.2a1.6 1.6 0 0 1 0 3.2h-1.2 M5 2.5V4 M8 2.5V4'],
  plus: ['M8 3v10 M3 8h10'],
} as const

export type IconKey = keyof typeof PATHS

export function Icon({
  name,
  size = 16,
  stroke = 1.6,
  fill = 'none',
}: {
  name: string
  size?: number
  stroke?: number
  fill?: string
}) {
  const paths = PATHS[name as IconKey] ?? PATHS.doc
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
