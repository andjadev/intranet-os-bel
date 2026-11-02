# OSBEL Intranet

Interni portal za OS BG (OPTIMAL SYSTEMS Beograd), izgrađen prema dizajnu u
`../Intranet dashboard design/design_handoff_osbel_intranet/`.

- **Portal** (`/`): kalendar „Kratak pogled", nove kolege, pretraga kolega, korisne informacije,
  boravak u kancelariji, OSBEL Chat, preporuke + anketa. Podstranice: profil kolege, mali oglasi,
  poslovi, linkovi, preporuke, galerija. Jezici SR / EN / DE.
- **Admin / CMS** (`/admin`): urednici i administratori unose sav sadržaj.
- **Prijava**: e-pošta + lozinka (nalog otvara superadmin). Kasnije i Microsoft (Entra ID) nalog.

## Stack

| Sloj | Izbor |
|---|---|
| App | Next.js 16 (App Router) + TypeScript |
| CMS | Payload 3 (radi u istoj aplikaciji, `/admin`) |
| Baza | SQLite fajl (podrazumevano) ili PostgreSQL |
| Prijava | Lozinka (Payload: heš, zaključavanje) i/ili Microsoft Entra ID (OIDC + PKCE, `arctic`); sopstvena potpisana sesija (`jose`) |
| Hosting | Jedan Docker kontejner + volume za podatke |

Za ~100 zaposlenih SQLite je sasvim dovoljan: nema posebnog DB servera, backup je kopija jednog fajla.

## Lokalno pokretanje

Potreban je Node.js 22.23.4+ (ili 24.22.1+).

```bash
cp .env.example .env      # pa popuni PAYLOAD_SECRET / AUTH_SECRET
npm install
npm run seed              # nalozi Mijailović i Papić (superadmin), ispisuje privremene lozinke
npm run dev               # http://localhost:3000
```

Baza kreće prazna; sav sadržaj se unosi u `/admin`. `npm run seed:reset` briše **sav** sadržaj
(sve kolekcije, slike, podešavanja portala) i ponovo pravi dva naloga sa novim lozinkama.

## Prijava lozinkom

- Nalog otvara superadmin: `/admin` → Kolege → *Create new*, uz privremenu lozinku (najmanje 10 znakova),
  koju kolegi javi lično ili preko Teams-a.
- Pri prvoj prijavi kolega mora da postavi svoju lozinku (`/lozinka`). Kasnije je menja iz menija (avatar → Promeni lozinku).
- Zaboravljena lozinka: superadmin u `/admin` postavi novu privremenu (dugme *Change password* na kolegi).
  Svaka promena lozinke odjavljuje sve ranije sesije tog naloga.
- Posle 5 pogrešnih pokušaja nalog je zaključan 15 minuta. Poruka o grešci je ista za nepostojeći nalog,
  pogrešnu lozinku i zaključan nalog.
- Nema samostalne registracije ni slanja e-pošte; Payload-ove rute `/api/users/login`, `first-register`,
  `forgot-password` i `reset-password` su isključene (`src/proxy.ts`).
- Kad Microsoft prijava proradi: `DISABLE_PASSWORD_LOGIN=true` sakriva formu za lozinku.

Razvojna prijava (`ENABLE_DEV_LOGIN=true`, izbor kolege bez lozinke) je samo za lokalni rad i **nikada**
ne sme biti uključena na javnom serveru. Adrese iz `SUPERADMIN_EMAILS` dobijaju ulogu superadmin pri prijavi.

## Uloge

| Uloga | Može |
|---|---|
| `superadmin` | sve, uključujući kolege i dodelu uloga |
| `editor` | donji deo početne: preporuke i ankete, mali oglasi, galerija i slike, OSBEL Chat, parking i Majstor Žile |
| `employee` | čita portal; dodaje oglase, preporuke, komentare, lajkove, glas u anketi, chat poruke; menja svoj profil |

Uloge dodeljuje superadmin u `/admin` → Kolege → (osoba) → Uloga. Editor u adminu vidi samo svoje kolekcije;
naslov početne i Teams link u Podešavanjima portala su mu samo za čitanje.

## Šta se uređuje u `/admin`

| Blok na portalu | Gde u adminu | Ko |
|---|---|---|
| Kratak pogled (kalendar), sledeća hrana | **Kalendar** (tip „Hrana u kancelariji" puni „Sledeća hrana"). Rođendani i slave dolaze automatski iz profila kolega (polja „Rođendan" i „Slava"), za tekuću i narednih 5 godina. | superadmin |
| Kolege, profil, Nove kolege | **Kolege** (štiklirati „Prikaži u Nove kolege"), **Timovi** | superadmin |
| Korisne informacije (4 pločice + stranica) | **Korisne informacije** (polje „Pločica na početnoj"); kategorije sa ikonicom: traka iznad liste ili **Kategorije informacija** | superadmin |
| Poslovi | **Otvorene pozicije** | superadmin |
| Naslov početne, Teams link | **Podešavanja portala** | superadmin |
| Mali oglasi | **Mali oglasi** (zaposleni dodaju i sami) | editor |
| Preporuke, anketa | grupa **Preporuke** (kategorije, objave, komentari, ankete) | editor |
| Galerija | **Galerija** (album = više fotografija), **Fajlovi i slike** | editor |
| OSBEL Chat | **OSBEL Chat** (brisanje poruka) | editor |
| Parking, Majstor Žile, podnaslov chata | **Podešavanja portala** | editor |

Lokalizovana polja (SR/EN/DE) se prevode biranjem jezika gore desno u adminu.

## Microsoft (Entra ID) prijava – šta tražiti od IT-a

1. **App registration** u Entra ID (single tenant).
2. **Redirect URI** (Web): `https://<intranet-domen>/auth/callback`
   (lokalno: `http://localhost:3000/auth/callback`).
3. **Client secret**.
4. **Delegated permissions** (Microsoft Graph): `openid`, `profile`, `email`, `User.Read`. Admin consent nije obavezan za ove, ali je preporučen.
5. Opciono: „Assignment required" = Yes ako samo određena grupa sme da pristupi.

Zatim u `.env`:

```
ENTRA_TENANT_ID=<Directory (tenant) ID>
ENTRA_CLIENT_ID=<Application (client) ID>
ENTRA_CLIENT_SECRET=<secret>
APP_URL=https://<intranet-domen>
ENABLE_DEV_LOGIN=false
```

Prilikom prve Microsoft prijave kolega se povezuje sa postojećim zapisom po e-pošti (ili se kreira novi).

### Link sa statičnog sajta

Na statičnom sajtu firme dovoljan je običan link ili dugme ka `https://<intranet-domen>/`.
Neprijavljen korisnik se automatski šalje na Microsoft prijavu i vraća nazad.

## Produkcija (Docker)

```bash
docker compose up -d --build
```

- Podaci (SQLite + slike) su u volume-u `intranet-data` (`/app/data`). Backup = kopija tog volume-a.
- Migracije baze se izvršavaju automatski pri startu.
- Produkcijska baza kreće prazna; prve naloge pravi `npm run seed` (sa `NODE_ENV=production` i
  `DATABASE_URL` te baze) iz kopije repozitorijuma sa instaliranim paketima. Slika ne sadrži npm skripte.
- Postaviti iza internog reverse proxy-ja sa HTTPS-om; `APP_URL` mora biti javni HTTPS URL.

## Produkcija (Netlify + Supabase, besplatno)

Netlify nema trajni disk, pa SQLite i lokalne slike tamo ne rade. Umesto njih: PostgreSQL i
S3 skladište iz jednog besplatnog Supabase projekta. Podešavanje builda je u `../netlify.toml`.

1. **Supabase** (supabase.com, besplatan plan): napraviti projekat (region Frankfurt).
   - *Connect* → **Transaction pooler** URL (port 6543) → `DATABASE_URL`.
   - *Storage* → novi **privatni** bucket `media` → `S3_BUCKET=media`.
   - *Storage → S3 Connection*: `S3_ENDPOINT`, `S3_REGION`, pa *New access key* → `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
2. **Netlify**: sajt je povezan sa privatnim GitHub repozitorijumom (Netlify besplatno ne radi sa
   našim GitLab serverom). Svaki `git push github master` automatski gradi i objavljuje sajt.
   Base directory i build komanda se čitaju iz `netlify.toml`. Lokalni build na Windows-u ne radi
   bez Developer Mode-a (simbolički linkovi), zato se gradi samo na Netlify-ju.
3. **Environment variables** u Netlify-ju: `DATABASE_URL`, `PAYLOAD_SECRET`, `AUTH_SECRET`,
   `APP_URL=https://<sajt>.netlify.app`, `SUPERADMIN_EMAILS`, `ENABLE_DEV_LOGIN=false`, `S3_*`
   (`ENTRA_*` kasnije, kad IT napravi app registration i doda redirect URI `https://<sajt>.netlify.app/auth/callback`).
4. **Prvi nalozi**, jednom, sa svog računara (PowerShell, u `app/`):
   ```powershell
   $env:NODE_ENV='production'; $env:DATABASE_URL='<Supabase pooler URL>'; npm run seed
   ```
   Ispisuje privremene lozinke za Mijailović i Papić. `NODE_ENV=production` je obavezan: tako se
   izvršava migracija iz `src/migrations/postgres/` (umesto Payload-ovog „push" režima za razvoj).

Tabele se kreiraju migracijom pri prvom pokretanju (sajt ili seed, šta god dođe prvo).
Besplatan Supabase projekat se pauzira posle 7 dana bez ijednog zahteva; intranet koji se svakodnevno
koristi to ne dostiže, a pauziran projekat se ponovo pokreće iz Supabase konzole.

### PostgreSQL (opciono)

Postaviti `DATABASE_URL=postgres://user:pass@host:5432/intranet`. Početna migracija već postoji u
`src/migrations/postgres/` i izvršava se automatski pri startu.

## Promene šeme

Posle izmene kolekcija u `src/collections/`:

```bash
npm run generate:types
npm run payload migrate:create <ime>   # za produkciju (SQLite, sa podrazumevanim DATABASE_URL)
```

Za Postgres isto sa `DATABASE_URL=postgres://...` (može i nepostojeća baza; migracija se generiše bez konekcije).

U razvoju Payload sam usklađuje šemu lokalne baze.

## v2 (kad stignu Graph dozvole)

- Kolege iz Entra ID preko Graph-a (sinhronizacija u kolekciju **Kolege**).
- Kalendar iz deljenog Outlook kalendara.
- OSBEL Chat iz Teams kanala (RSC `ChannelMessage.Read.Group`, `ChannelMessage.Send`) umesto kolekcije `chat-messages`.
- Galerija iz SharePoint biblioteke.

## Struktura

```
src/
  app/(frontend)/(portal)/   stranice portala (zahtevaju prijavu)
  app/(frontend)/login/      prijava
  app/(frontend)/auth/       prijava lozinkom, Microsoft OIDC, dev prijava, odjava
  app/(frontend)/lozinka/    promena lozinke
  app/(frontend)/actions.ts  server actions (lajk, komentar, glas, chat, oglasi)
  app/(payload)/             Payload admin + REST/GraphQL API (generisano)
  collections/, globals/     CMS šema
  components/                UI komponente (port dizajna)
  i18n/dict.ts               UI tekstovi SR/EN/DE
  lib/                       sesija, prijava, podaci, datumi
  proxy.ts                   zaštita svih ruta
  seed/seed.ts               početni nalozi (i brisanje svega sa seed:reset)
```
