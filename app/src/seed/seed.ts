/**
 * Fills an empty database with the placeholder content from the design
 * prototype (Intranet.dc.html). Run with `npm run seed`, or `npm run seed:reset`
 * to wipe the seeded collections first.
 */
import config from '@payload-config'
import path from 'path'
import { getPayload, type CollectionSlug, type Payload } from 'payload'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

type L = { sr: string; en: string; de: string }
const TX = (en: string, sr: string, de?: string): L => ({ en, sr, de: de ?? en })

const PROTO_TODAY = '2026-10-07'

const ymd = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

/** Shift prototype dates by whole weeks so "today" in the design lines up with the real week. */
function makeShift() {
  const now = new Date(ymd(new Date()) + 'T00:00:00')
  const proto = new Date(PROTO_TODAY + 'T00:00:00')
  const weeks = Math.round((now.getTime() - proto.getTime()) / (7 * 86400000))
  return (key: string) => {
    const d = new Date(key + 'T00:00:00')
    d.setDate(d.getDate() + weeks * 7)
    return ymd(d)
  }
}
// Noon UTC keeps the calendar day stable in Europe/Belgrade.
const iso = (key: string) => `${key}T12:00:00.000Z`

/** Writes one doc with Serbian as the main locale, then the en/de variants of localized fields. */
async function createLocalized<T extends Record<string, unknown>>(
  payload: Payload,
  collection: CollectionSlug,
  data: T,
  localized: (keyof T)[],
) {
  const pick = (lang: keyof L) => {
    const out: Record<string, unknown> = { ...data }
    for (const k of localized) {
      const v = data[k] as unknown
      if (v && typeof v === 'object' && 'sr' in (v as object)) out[k as string] = (v as L)[lang]
      else if (Array.isArray(v)) out[k as string] = v.map((x) => (x && typeof x === 'object' && 'sr' in x ? x[lang] : x))
    }
    return out
  }
  const doc = await payload.create({ collection, data: pick('sr') as never, locale: 'sr', overrideAccess: true })
  for (const lang of ['en', 'de'] as const) {
    await payload.update({ collection, id: doc.id, data: pick(lang) as never, locale: lang, overrideAccess: true })
  }
  return doc
}

const DEPTS: Record<string, L> = {
  dev: TX('Development', 'Razvoj', 'Entwicklung'),
  design: TX('Design', 'Dizajn', 'Design'),
  support: TX('Support', 'Podrška', 'Support'),
  hr: TX('HR', 'HR', 'HR'),
  sales: TX('Sales', 'Prodaja', 'Vertrieb'),
  office: TX('Office', 'Kancelarija', 'Büro'),
}

type Person = { key: string; name: string; email: string; role: 'superadmin' | 'editor' | 'employee'; photo: string }

// Real accounts; photos are the team portraits from the company website (src/seed/avatars).
const PEOPLE: Person[] = [
  { key: 'mi', name: 'Anđela Mijailović', email: 'mijailovic@optimal-systems.de', role: 'editor', photo: 'andjela-mijailovic.png' },
  { key: 'pa', name: 'Sana Papić', email: 'papic@optimal-systems.de', role: 'superadmin', photo: 'sana-papic.webp' },
  { key: 'zi', name: 'Jovana Živanović', email: 'zivanovic@optimal-systems.de', role: 'editor', photo: 'jovana-zivanovic.webp' },
  { key: 'zu', name: 'Nemanja Žutić', email: 'zutic@optimal-systems.de', role: 'employee', photo: 'nemanja-zutic.webp' },
]

const CAL: [string, string, string, L, L?][] = [
  ['2026-09-30', 'event', '10:00', TX('Q3 review', 'Pregled Q3 kvartala', 'Q3-Rückblick')],
  ['2026-10-01', 'event', '10:00', TX('Q4 kick-off', 'Početak Q4 kvartala', 'Q4-Kick-off')],
  ['2026-10-02', 'food', '09:00', TX('Team breakfast', 'Zajednički doručak', 'Team-Frühstück')],
  ['2026-10-05', 'event', '10:00', TX('Weekly kick-off, room Avala', 'Nedeljni sastanak, sala Avala', 'Weekly Kick-off, Raum Avala')],
  ['2026-10-05', 'event', '', TX('Nikola Todorović starts', 'Nikola Todorović počinje', 'Nikola Todorović startet'), TX('Integrations team', 'Tim za integracije', 'Integrations-Team')],
  ['2026-10-06', 'food', '09:00', TX('Pancakes, 3rd floor kitchen', 'Palačinke, kuhinja 3. sprat', 'Pfannkuchen, Küche 3. Etage')],
  ['2026-10-06', 'event', '15:00', TX('Release 11.10 to staging', 'Izdanje 11.10 na staging', 'Release 11.10 auf Staging')],
  ['2026-10-07', 'food', '09:00', TX('Fresh fruit', 'Sveže voće', 'Frisches Obst'), TX('Kitchen', 'Kuhinja', 'Küche')],
  ['2026-10-07', 'event', '10:30', TX('Sprint review', 'Sprint review', 'Sprint-Review'), TX('Kopaonik', 'Kopaonik', 'Kopaonik')],
  ['2026-10-07', 'event', '17:00', TX('Tech talk', 'Tech talk', 'Tech-Talk'), TX('Search', 'Pretraga', 'Suche')],
  ['2026-10-08', 'food', '09:00', TX('Pancakes', 'Palačinke', 'Pfannkuchen'), TX('Kitchen, 3rd floor', 'Kuhinja, 3. sprat', 'Küche, 3. Etage')],
  ['2026-10-08', 'bday', '', TX('Ivan Jovanović, 9 years', 'Ivan Jovanović, 9 godina', 'Ivan Jovanović, 9 Jahre'), TX('Work anniversary', 'Godišnjica u firmi', 'Firmenjubiläum')],
  ['2026-10-08', 'event', '11:00', TX('Insurance consultation', 'Savetovanje o osiguranju', 'Versicherungsberatung'), TX('Book with HR', 'Zakazati kod HR-a', 'Termin über HR')],
  ['2026-10-08', 'event', '16:00', TX('Homemade market, lobby', 'Domaća pijaca, hol', 'Hausgemachtes-Markt, Lobby')],
  ['2026-10-09', 'food', '12:00', TX('Team lunch', 'Zajednički ručak', 'Team-Lunch')],
  ['2026-10-14', 'event', '17:00', TX('Tech talk: Angular 20', 'Tech talk: Angular 20', 'Tech-Talk: Angular 20')],
  ['2026-10-16', 'food', '09:00', TX('Pancakes', 'Palačinke', 'Pfannkuchen')],
  ['2026-10-20', 'event', '15:00', TX('Release 11.11', 'Izdanje 11.11', 'Release 11.11')],
  ['2026-10-23', 'event', '14:00', TX('Team building', 'Team building', 'Teambuilding')],
  ['2026-10-24', 'event', '20:00', TX('Atelje 212, group tickets', 'Atelje 212, grupne karte', 'Atelje 212, Gruppentickets')],
  ['2026-10-27', 'slava', '', TX('Sv. Petka', 'Sv. Petka', 'Sv. Petka'), TX('Radmila I., Petar K.', 'Radmila I., Petar K.', 'Radmila I., Petar K.')],
  ['2026-11-08', 'slava', '', TX('Sv. Dimitrije', 'Mitrovdan', 'Sv. Dimitrije'), TX('Ivan J.', 'Ivan J.', 'Ivan J.')],
  ['2026-11-11', 'holiday', '', TX('Armistice Day, office closed', 'Dan primirja, kancelarija zatvorena', 'Waffenstillstandstag, Büro geschlossen')],
  ['2026-11-21', 'slava', '', TX('Sv. Arhangel Mihailo', 'Aranđelovdan', 'Sv. Arhangel Mihailo'), TX('Milena P., Stefan Đ.', 'Milena P., Stefan Đ.', 'Milena P., Stefan Đ.')],
  ['2026-12-19', 'slava', '', TX('Sv. Nikola', 'Nikoljdan', 'Sv. Nikola'), TX('Nikola T., Nada M.', 'Nikola T., Nada M.', 'Nikola T., Nada M.')],
]

const LINKS: { group: string; title: L; description: L; tile?: string; icon?: string }[] = [
  { group: 'start', title: TX('Onboarding checklist', 'Lista za početak', 'Onboarding-Checkliste'), description: TX('Your first 30 days', 'Tvojih prvih 30 dana', 'Deine ersten 30 Tage') },
  { group: 'start', title: TX('IT setup & VPN access', 'IT i VPN', 'IT-Setup & VPN-Zugang'), description: TX('Service desk, ext. 4000', 'Service desk, lokal 4000', 'Service-Desk, Durchwahl 4000'), tile: 'navy', icon: 'vpn' },
  { group: 'start', title: TX('Who does what', 'Ko šta radi', 'Wer macht was'), description: TX('Teams and contacts', 'Timovi i kontakti', 'Teams und Kontakte') },
  { group: 'start', title: TX('Office rules & access cards', 'Pravila kancelarije i kartice', 'Bürordnung & Zugangskarten'), description: TX('Reception, ground floor', 'Recepcija, prizemlje', 'Empfang, Erdgeschoss') },
  { group: 'people', title: TX('Health insurance', 'Zdravstveno osiguranje', 'Krankenversicherung'), description: TX('Coverage, claims, forms', 'Pokriće, zahtevi, obrasci', 'Leistungen, Anträge, Formulare'), tile: 'mid', icon: 'health' },
  { group: 'people', title: TX('Vacation & absence', 'Godišnji odmor', 'Urlaub & Abwesenheit'), description: TX('Request in the HR portal', 'Zahtev u HR portalu', 'Antrag im HR-Portal'), tile: 'sky', icon: 'vacation' },
  { group: 'people', title: TX('Home office', 'Rad od kuće', 'Homeoffice-Regelung'), description: TX('Up to 3 days per week', 'Do 3 dana nedeljno', 'Bis zu 3 Tage pro Woche') },
  { group: 'people', title: TX('Learning budget', 'Budžet za učenje', 'Weiterbildungsbudget'), description: TX('Courses, books, conferences', 'Kursevi, knjige, konferencije', 'Kurse, Bücher, Konferenzen') },
  { group: 'admin', title: TX('Travel & expenses', 'Putovanja i troškovi', 'Reisen & Spesen'), description: TX('Receipts within 14 days', 'Računi u roku od 14 dana', 'Belege innerhalb 14 Tagen') },
  { group: 'admin', title: TX('Order office supplies', 'Naruči kancelarijski materijal', 'Büromaterial bestellen'), description: TX('Via the office manager', 'Preko office menadžera', 'Über das Office-Management') },
  { group: 'admin', title: TX('Report an IT incident', 'Prijavi IT problem', 'IT-Störung melden'), description: TX('Service desk ticket', 'Tiket za service desk', 'Ticket beim Service-Desk'), tile: 'sand', icon: 'alert' },
  { group: 'admin', title: TX('Meeting rooms', 'Sale za sastanke', 'Besprechungsräume'), description: TX('Avala, Kopaonik, Tara', 'Avala, Kopaonik, Tara', 'Avala, Kopaonik, Tara') },
]

const ADS: { kind: 'sell' | 'buy' | 'give'; title: string; description: string; author: string; price: string }[] = [
  { kind: 'sell', title: 'Bagremov med, tegle od 900 g', description: 'Iz porodičnih košnica kod Topole. Preuzimanje u četvrtak.', author: 'mi', price: '1 200 RSD' },
  { kind: 'sell', title: 'Domaći ajvar', description: 'Blagi i ljuti, ostalo šest tegli.', author: 'zu', price: '900 RSD' },
  { kind: 'sell', title: 'Pletene vunene čarape', description: 'Veličine 38 – 44.', author: 'pa', price: '1 500 RSD' },
  { kind: 'sell', title: 'Keramičke šolje', description: 'Glazura malo nesavršena, potpuno upotrebljive.', author: 'pa', price: '1 000 RSD' },
  { kind: 'give', title: 'Rasad paprike', description: 'Ponesite svoju kutiju.', author: 'zu', price: '' },
  { kind: 'sell', title: 'Gibanica po porudžbini, petak ujutru', description: 'Poručiti do srede uveče.', author: 'zi', price: '800 RSD' },
]

const JOBS: { dept: string; title: L; meta: L; bonus: string }[] = [
  { dept: 'dev', title: TX('Angular developer, web client', 'Angular programer, web klijent', 'Angular-Entwickler:in, Web-Client'), meta: TX('Belgrade · full time', 'Beograd · puno radno vreme', 'Belgrad · Vollzeit'), bonus: 'Bonus 60 000 RSD' },
  { dept: 'support', title: TX('Support specialist, 2nd level', 'Specijalista podrške, 2. nivo', 'Support-Spezialist:in, 2nd Level'), meta: TX('Belgrade · hybrid', 'Beograd · hibridno', 'Belgrad · hybrid'), bonus: 'Bonus 40 000 RSD' },
  { dept: 'design', title: TX('Product designer', 'Dizajner proizvoda', 'Produktdesigner:in'), meta: TX('Belgrade or Berlin · full time', 'Beograd ili Berlin · puno radno vreme', 'Belgrad oder Berlin · Vollzeit'), bonus: 'Bonus 60 000 RSD' },
  { dept: 'dev', title: TX('Student, test automation', 'Student, automatizacija testova', 'Werkstudent:in, Testautomatisierung'), meta: TX('Belgrade · 20 h per week', 'Beograd · 20 h nedeljno', 'Belgrad · 20 h pro Woche'), bonus: 'Bonus 20 000 RSD' },
]

const RCATS: { slug: string; label: L; icon: string; fg: string; bg: string; subs: [string, L][] }[] = [
  { slug: 'kultura', label: TX('Culture', 'Kultura', 'Kultur'), icon: 'culture', fg: '#003768', bg: '#E8EEF2', subs: [['theater', TX('Theater', 'Pozorište', 'Theater')], ['cinema', TX('Cinema', 'Bioskop', 'Kino')], ['concerts', TX('Concerts', 'Koncerti', 'Konzerte')], ['books', TX('Books', 'Knjige', 'Bücher')]] },
  { slug: 'vikend', label: TX('Weekend getaways', 'Gde za vikend', 'Wohin am Wochenende'), icon: 'weekend', fg: '#000000', bg: '#E8EEF2', subs: [['salas', TX('Farmsteads', 'Salaši', 'Salaši')], ['wellness', TX('Wellness', 'Wellness', 'Wellness')], ['trips', TX('Day trips', 'Izleti', 'Ausflüge')], ['mountains', TX('Mountains', 'Planine', 'Berge')]] },
  { slug: 'gastro', label: TX('Gastro corner', 'Gastro kutak', 'Gastro-Ecke'), icon: 'gastro', fg: '#000000', bg: '#E8EEF2', subs: [['recipes', TX('Recipes', 'Recepti', 'Rezepte')], ['restaurants', TX('Restaurants', 'Restorani', 'Restaurants')], ['coffee', TX('Coffee & sweets', 'Kafa i slatko', 'Kaffee & Süßes')]] },
]

const RPOSTS: { cat: string; sub: string; who: string; title: string; text: string; meta: string; likes: number; comments: [string, string][] }[] = [
  { cat: 'kultura', sub: 'theater', who: 'pa', title: 'Hipnoza jedne ljubavi, Atelje 212', text: 'Gledala sinoć, odlična glumačka podela i duhovit tekst. Za subotu još ima karata.', meta: 'Atelje 212 · subota 20:00', likes: 8, comments: [['zu', 'Idem u subotu, ko je za?'], ['mi', 'Mogu da sredim grupne karte.']] },
  { cat: 'kultura', sub: 'cinema', who: 'pa', title: 'Festival autorskog filma, Kinoteka', text: 'Cele nedelje projekcije, pretpremijere i razgovori sa rediteljima.', meta: 'Kinoteka · do 30. okt.', likes: 6, comments: [['zi', 'Preporučujem utorak, gost je reditelj.']] },
  { cat: 'kultura', sub: 'concerts', who: 'mi', title: 'Beogradska filharmonija, Kolarac', text: 'Na programu Dvoržak i Brams. Karte se brzo rasprodaju.', meta: 'Kolarac · 29. okt. 20:00', likes: 5, comments: [] },
  { cat: 'kultura', sub: 'books', who: 'zi', title: 'Knjiga meseca: Na Drini ćuprija', text: 'Čitamo zajedno do kraja meseca, razgovor uz kafu 31. oktobra.', meta: 'Polica u kuhinji, 3. sprat', likes: 4, comments: [['pa', 'Ja sam unutra!']] },
  { cat: 'vikend', sub: 'salas', who: 'zu', title: 'Salaš 137, Čenej', text: 'Domaća kuhinja, konji i mir. Idealno za porodicu, sat vremena od Beograda.', meta: 'Čenej · oko 1 h vožnje', likes: 10, comments: [['zu', 'Bili smo leto, doručak je odličan.'], ['zi', 'Treba li rezervacija?'], ['zu', 'Vikendom obavezno.']] },
  { cat: 'vikend', sub: 'wellness', who: 'zu', title: 'Wellness vikend na Zlatiboru', text: 'Bazen, sauna i šetnje kroz borovu šumu. Paket za dve noći je povoljan van sezone.', meta: 'Zlatibor · oko 3 h vožnje', likes: 7, comments: [] },
  { cat: 'vikend', sub: 'trips', who: 'zi', title: 'Uvac i beloglavi supovi', text: 'Vožnja čamcem kroz meandre i vidikovac Molitva. Ponesite dvogled.', meta: 'Uvac · ceo dan', likes: 9, comments: [['pa', 'Najlepši pogled u Srbiji.']] },
  { cat: 'vikend', sub: 'mountains', who: 'mi', title: 'Rtanj, uspon do vrha', text: 'Oko tri sata uspona, lagano tempo. Najbolje krenuti rano ujutru.', meta: 'Rtanj · ceo dan', likes: 3, comments: [] },
  { cat: 'gastro', sub: 'recipes', who: 'zi', title: 'Gibanica moje bake', text: 'Kore, sir, jaja, kisela voda i malo strpljenja. Recept je u komentarima.', meta: 'Recept · oko 1 h', likes: 11, comments: [['zi', '6 jaja, 500 g sira, pakovanje kora, 200 ml kisele vode, 100 ml ulja. 200 °C, 40 min.'], ['mi', 'Probaću za vikend!']] },
  { cat: 'gastro', sub: 'restaurants', who: 'mi', title: 'Tri šešira, Skadarlija', text: 'Klasika za goste iz inostranstva: muzika, roštilj i dobra atmosfera.', meta: 'Skadarlija · preporučena rezervacija', likes: 5, comments: [] },
  { cat: 'gastro', sub: 'coffee', who: 'pa', title: 'Najbolja kafa blizu kancelarije', text: 'Mala pržionica na pet minuta hoda. Flat white vredi šetnje.', meta: '5 min peške', likes: 6, comments: [['mi', 'Potvrđujem!']] },
]

const ALBUMS: { name: L; date: L; theme: string }[] = [
  { name: TX('Business Run 2026', 'Business Run 2026', 'Business Run 2026'), date: TX('September 2026', 'septembar 2026.', 'September 2026'), theme: 'blue' },
  { name: TX('New Year party', 'Nova godina', 'Neujahrsfeier'), date: TX('December 2025', 'decembar 2025.', 'Dezember 2025'), theme: 'sand' },
  { name: TX('Everyday life', 'Svakodnevica', 'Büroalltag'), date: TX('Ongoing', 'stalno se dopunjuje', 'laufend'), theme: 'green' },
  { name: TX('Team trip, Fruška gora', 'Timski izlet, Fruška gora', 'Teamausflug, Fruška gora'), date: TX('June 2026', 'jun 2026.', 'Juni 2026'), theme: 'green' },
  { name: TX('Slavas & birthdays', 'Slave i rođendani', 'Slavas & Geburtstage'), date: TX('2026', '2026.', '2026'), theme: 'blue' },
]

const SEEDED: CollectionSlug[] = [
  'chat-messages', 'poll-votes', 'polls', 'rec-comments', 'rec-posts', 'rec-categories',
  'albums', 'jobs', 'classifieds', 'links', 'events', 'users', 'departments', 'media',
]

async function main() {
  const payload = await getPayload({ config })
  const reset = process.env.SEED_RESET === 'true'

  const existing = await payload.count({ collection: 'events', overrideAccess: true })
  if (existing.totalDocs > 0 && !reset) {
    payload.logger.info('Database already has content – nothing to do. Use `npm run seed:reset` to start over.')
    process.exit(0)
  }
  if (reset) {
    for (const collection of SEEDED) {
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    }
  }

  const shift = makeShift()

  payload.logger.info('Seeding departments and colleagues…')
  const deptIds: Record<string, number> = {}
  for (const [slug, name] of Object.entries(DEPTS)) {
    deptIds[slug] = (await createLocalized(payload, 'departments', { slug, name }, ['name'])).id as number
  }

  const userIds: Record<string, number> = {}
  for (const p of PEOPLE) {
    const avatar = await payload.create({
      collection: 'media',
      data: { alt: p.name },
      filePath: path.resolve(dirname, 'avatars', p.photo),
      overrideAccess: true,
    })
    const doc = await payload.create({
      collection: 'users',
      data: { name: p.name, email: p.email, role: p.role, office: 'Beograd', avatar: avatar.id },
      overrideAccess: true,
    })
    userIds[p.key] = doc.id as number
  }

  for (const [date, type, time, title, description] of CAL) {
    await createLocalized(payload, 'events', { date: iso(shift(date)), type, time, title, description }, ['title', 'description'])
  }
  for (const [i, l] of LINKS.entries()) {
    await createLocalized(payload, 'links', { ...l, url: '#', order: i }, ['title', 'description'])
  }
  for (const ad of ADS) {
    await payload.create({ collection: 'classifieds', data: { ...ad, author: userIds[ad.author] }, overrideAccess: true })
  }
  for (const j of JOBS) {
    await createLocalized(payload, 'jobs', { ...j, department: deptIds[j.dept], open: true }, ['title', 'meta'])
  }

  payload.logger.info('Seeding recommendations, poll, gallery, chat…')
  const catIds: Record<string, number> = {}
  for (const [i, c] of RCATS.entries()) {
    // Array rows must keep their IDs across locales, so create first, then localize labels per row.
    const doc = await payload.create({
      collection: 'rec-categories',
      locale: 'sr',
      overrideAccess: true,
      data: { slug: c.slug, label: c.label.sr, icon: c.icon as never, fg: c.fg, bg: c.bg, order: i, subs: c.subs.map(([slug, label]) => ({ slug, label: label.sr, icon: slug as never })) },
    })
    for (const lang of ['en', 'de'] as const) {
      await payload.update({
        collection: 'rec-categories',
        id: doc.id,
        locale: lang,
        overrideAccess: true,
        data: { label: c.label[lang], subs: (doc.subs ?? []).map((s, j) => ({ ...s, label: c.subs[j][1][lang] })) },
      })
    }
    catIds[c.slug] = doc.id
  }
  const allUsers = Object.values(userIds)
  for (const [i, p] of RPOSTS.entries()) {
    const post = await payload.create({
      collection: 'rec-posts',
      overrideAccess: true,
      data: {
        category: catIds[p.cat],
        sub: p.sub,
        title: p.title,
        text: p.text,
        meta: p.meta,
        author: userIds[p.who],
        likes: allUsers.slice(i % 3, (i % 3) + p.likes),
      },
    })
    for (const [who, text] of p.comments) {
      await payload.create({ collection: 'rec-comments', data: { post: post.id, author: userIds[who], text }, overrideAccess: true })
    }
  }

  const poll = await payload.create({
    collection: 'polls',
    locale: 'sr',
    overrideAccess: true,
    data: {
      question: 'Gde ide timski izlet u novembru?',
      options: [{ label: 'Fruška gora' }, { label: 'Zlatibor' }, { label: 'Salaš u Vojvodini' }],
      until: iso(shift('2026-10-20')),
      active: true,
    },
  })
  const pollEn = ['Fruška gora', 'Zlatibor', 'A salaš in Vojvodina']
  const pollDe = ['Fruška gora', 'Zlatibor', 'Salaš in der Vojvodina']
  for (const [lang, q, labels] of [
    ['en', 'Where should the November team trip go?', pollEn],
    ['de', 'Wohin geht der Teamausflug im November?', pollDe],
  ] as const) {
    await payload.update({
      collection: 'polls',
      id: poll.id,
      locale: lang,
      overrideAccess: true,
      data: { question: q, options: (poll.options ?? []).map((o, j) => ({ ...o, label: labels[j] })) },
    })
  }
  const optionIds = (poll.options ?? []).map((o) => o.id!)
  for (const [i, uid] of allUsers.entries()) {
    if (i === allUsers.length - 1) continue // leave one colleague who hasn't voted
    await payload.create({ collection: 'poll-votes', data: { poll: poll.id, user: uid, option: optionIds[[2, 0, 2, 1, 0, 2, 0, 2, 1, 2][i % 10]] }, overrideAccess: true })
  }

  for (const [i, a] of ALBUMS.entries()) {
    await createLocalized(payload, 'albums', { name: a.name, dateLabel: a.date, theme: a.theme, order: i }, ['name', 'dateLabel'])
  }

  const chat: [string | null, string][] = [
    [null, 'Ručak · danas'],
    ['mi', 'Poručujem u 11:00, upišite ovde šta želite.'],
    ['zi', 'Pljeskavica, srednja, sa kajmakom'],
    ['zu', 'Posna musaka i kisela voda'],
    ['zu', 'Isto kao gore'],
  ]
  for (const [who, text] of chat) {
    await payload.create({
      collection: 'chat-messages',
      data: { text, system: who === null, author: who ? userIds[who] : undefined },
      overrideAccess: true,
    })
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'sr',
    overrideAccess: true,
    data: {
      homeTitle: 'Sve za ovu nedelju',
      homeSubtitle: 'Samo kratke beleške. Sve duže je na posebnoj stranici, jedan klik dalje.',
      showNewcomers: true,
      parkingNote: 'Četvrtak: garaža puna od 09:00. Mesto 12 ostaje slobodno za gosta.',
      handymanName: 'Majstor Žile',
      handymanPhone: '064 123 4567',
      handymanDescription: 'Popravke, vodoinstalacije, sitni poslovi',
      teamsUrl: '#',
      chatSubtitle: 'Teams grupa · Ručak',
    },
  })
  for (const [lang, d] of [
    ['en', { homeTitle: 'Everything for this week', homeSubtitle: 'Short notes only. Anything longer lives on its own page, one click away.', parkingNote: 'Thursday: garage full from 09:00. Spot 12 stays free for a visitor.', handymanDescription: 'Repairs, plumbing, small jobs', chatSubtitle: 'Teams group · Lunch' }],
    ['de', { homeTitle: 'Alles für diese Woche', homeSubtitle: 'Nur kurze Notizen. Alles Längere steht auf einer eigenen Seite, einen Klick entfernt.', parkingNote: 'Donnerstag: Garage ab 09:00 voll. Platz 12 bleibt für einen Gast frei.', handymanDescription: 'Reparaturen, Sanitär, Kleinarbeiten', chatSubtitle: 'Teams-Gruppe · Mittagessen' }],
  ] as const) {
    await payload.updateGlobal({ slug: 'site-settings', locale: lang, overrideAccess: true, data: d })
  }

  payload.logger.info('Seed finished.')
  process.exit(0)
}

// `payload run` imports this module, so the work must finish via top-level await.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
