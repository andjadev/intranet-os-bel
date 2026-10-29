import { TIME_ZONE } from './constants'

/** Local YYYY-MM-DD for a Date (uses the Date's local fields). */
export const ymd = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

/** Today's date key in the office time zone, independent of the server's TZ. */
export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Date key of a stored Payload date (ISO string), read in the office time zone. */
export function dateKeyOf(iso: string): string {
  return todayKey(new Date(iso))
}

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)

export const addDays = (key: string, n: number) => {
  const d = new Date(key + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** Matches the prototype's search: start of first or last name, "đ" = "dj", no diacritics. */
export const normalizeName = (s: string) =>
  s.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[̀-ͯ]/g, '')
