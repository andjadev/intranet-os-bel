export const LOCALES = ['sr', 'en', 'de'] as const
export type Lang = (typeof LOCALES)[number]
export const DEFAULT_LANG: Lang = 'sr'
export const LANG_COOKIE = 'osbel_lang'
export const THEME_COOKIE = 'osbel_theme'
export type Theme = 'light' | 'dark'
export const TIME_ZONE = 'Europe/Belgrade'
export const MIN_PASSWORD_LENGTH = 10

export const EVENT_TYPES = ['bday', 'slava', 'event', 'food', 'holiday'] as const
export type EventType = (typeof EVENT_TYPES)[number]

/** [glyph color, background] per README "Tipovi događaja"; CSS tokens so they follow the light/dark theme. */
export const TYPE_COLORS: Record<EventType, [string, string]> = {
  bday: ['var(--heading)', 'var(--blue-5)'],
  slava: ['var(--heading)', 'var(--blue-5)'],
  event: ['var(--navy)', 'var(--blue-5)'],
  food: ['var(--heading)', 'var(--blue-5)'],
  holiday: ['var(--holiday)', 'var(--holiday-bg)'],
}

/** Useful-info tile colors, README section 4. */
export const TILE_STYLES = {
  navy: { bg: '#003768', fg: '#FFFFFF' },
  mid: { bg: 'linear-gradient(135deg, #009FE3, #007CF0)', fg: '#FFFFFF' },
  sky: { bg: 'var(--blue-4)', fg: 'var(--text-blue)' },
  sand: { bg: 'var(--tile-dark)', fg: '#FFFFFF' },
} as const
export type TileStyle = keyof typeof TILE_STYLES

export const ALBUM_THEMES = {
  blue: { fg: 'var(--navy)', bg: ['var(--blue-5)', 'var(--blue-3)', 'var(--blue-8)'] },
  sand: { fg: 'var(--heading)', bg: ['var(--blue-4)', 'var(--blue-2)', 'var(--blue-6)'] },
  green: { fg: 'var(--text-2)', bg: ['var(--blue-6)', 'var(--blue-4)', 'var(--blue-9)'] },
} as const
export type AlbumTheme = keyof typeof ALBUM_THEMES


export const AD_KINDS = ['sell', 'buy', 'give'] as const

export const ICONS = {
  // useful tiles
  vpn: 'vpn',
  health: 'health',
  vacation: 'vacation',
  alert: 'alert',
  card: 'card',
  doc: 'doc',
  info: 'info',
  folder: 'folder',
  home: 'home',
  chat: 'chat',
  wrench: 'wrench',
  star: 'star',
  // recommendation categories
  culture: 'culture',
  weekend: 'weekend',
  gastro: 'gastro',
  // recommendation sub-categories
  theater: 'theater',
  cinema: 'cinema',
  concerts: 'concerts',
  books: 'books',
  salas: 'salas',
  wellness: 'wellness',
  trips: 'trips',
  mountains: 'mountains',
  recipes: 'recipes',
  restaurants: 'restaurants',
  coffee: 'coffee',
} as const
export type IconName = keyof typeof ICONS
// Readable admin labels for the useful-info icons; the others show their key.
const ICON_LABELS: Partial<Record<IconName, { sr: string; en: string; de: string }>> = {
  vpn: { sr: 'Katanac (VPN, lozinke)', en: 'Padlock (VPN, passwords)', de: 'Schloss (VPN, Passwörter)' },
  health: { sr: 'Srce (zdravlje)', en: 'Heart (health)', de: 'Herz (Gesundheit)' },
  vacation: { sr: 'Kalendar (odmor)', en: 'Calendar (leave)', de: 'Kalender (Urlaub)' },
  alert: { sr: 'Upozorenje (prijava problema)', en: 'Warning (report a problem)', de: 'Warnung (Problem melden)' },
  card: { sr: 'Kartica', en: 'Card', de: 'Karte' },
  doc: { sr: 'Dokument', en: 'Document', de: 'Dokument' },
  info: { sr: 'Info', en: 'Info', de: 'Info' },
  folder: { sr: 'Fascikla', en: 'Folder', de: 'Ordner' },
  home: { sr: 'Kuća', en: 'House', de: 'Haus' },
  chat: { sr: 'Poruka', en: 'Message', de: 'Nachricht' },
  wrench: { sr: 'Alat (IT, podešavanja)', en: 'Wrench (IT, setup)', de: 'Werkzeug (IT, Einrichtung)' },
  star: { sr: 'Zvezdica', en: 'Star', de: 'Stern' },
}
export const iconOptions = (names: IconName[]) => names.map((n) => ({ label: ICON_LABELS[n] ?? n, value: n }))
/** Icons offered for useful-info links and their categories. */
export const INFO_ICONS: IconName[] = ['vpn', 'health', 'vacation', 'alert', 'card', 'doc', 'info', 'folder', 'home', 'chat', 'wrench', 'star']

// Category colors are stored as hex in the CMS; the standard palette values are mapped to theme tokens.
const FG_TOKENS: Record<string, string> = { '#003768': 'var(--navy)', '#000000': 'var(--heading)', '#E8EEF2': 'var(--blue-5)' }
const SOLID_TOKENS: Record<string, string> = { '#000000': 'var(--tile-dark)' }
/** For text, icons and light chip backgrounds. */
export const themeColor = (hex: string) => FG_TOKENS[hex.toUpperCase()] ?? hex
/** For a filled background behind white text. */
export const solidColor = (hex: string) => SOLID_TOKENS[hex.toUpperCase()] ?? hex
