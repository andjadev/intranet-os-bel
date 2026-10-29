# Handoff: OSBEL Intranet – početna strana + podstranice

## Overview
Interni portal za zaposlene OS BG (OPTIMAL SYSTEMS Beograd). Na jednoj početnoj strani su sve bitne informacije za nedelju: kalendar događaja, pretraga kolega, novi kolege, korisni linkovi, život u kancelariji, timski chat i preporuke. Iz nje se ide na podstranice: profil kolege, mali oglasi, galerija, preporuke, korisne informacije i otvorene pozicije. Portal je trojezičan: SR (podrazumevano), EN i DE.

## About the Design Files
Fajlovi u ovom paketu su **dizajn reference napravljene u HTML-u**. To su prototipovi koji pokazuju izgled i ponašanje, **ne produkcioni kod** za kopiranje. Zadatak je da se dizajn **ponovo izgradi u ciljnom okruženju**. Preporuka je Angular, prema stack-u opisanom ispod, sa njegovim uobičajenim obrascima i bibliotekama.

`Intranet.dc.html` se otvara direktno u browseru (uz `support.js` u istom folderu). Sav sadržaj (ljudi, događaji, linkovi) nalazi se kao konstante na početku logičke klase, u `<script data-dc-script>` delu fajla.

## Fidelity
**High-fidelity.** Boje, tipografija, razmaci i interakcije su finalni. Izuzeci:
- Sadržaj je placeholder: imena, telefoni, brojevi računa i linkovi.
- Fotografije su obojena polja sa ikonicom: avatari su inicijali, a galerija i preporuke koriste ikonice.
- Font i plava još nisu usklađeni sa zvaničnim OPTIMAL SYSTEMS vodičem. Vidi „Otvorena pitanja".

---

## Preporučeni stack i izvori podataka
| Sloj | Izbor |
|---|---|
| Frontend | Angular (isti stack kao enaio webclient) |
| CMS | Directus (ili Strapi) |
| Baza | PostgreSQL |
| Identitet / prijava | Microsoft Entra ID (SSO) |
| Integracije | Microsoft Graph (korisnici, Outlook kalendar, Teams kanal, SharePoint) |
| Hosting | Docker iza nginx-a; on-prem ili Azure; dostup samo interno/VPN |

| Blok | Izvor |
|---|---|
| Pronađi kolegu, profil, novi kolege, rođendani | Entra ID preko Graph-a |
| Kratak pogled (kalendar) | Deljeni Outlook kalendar; Outlook kategorije = tipovi događaja |
| Slave | CMS (ili prošireno polje u profilu) |
| OSBEL Chat | Jedan Teams **kanal**; Graph sa RSC dozvolama samo za taj tim (`ChannelMessage.Read.Group`, `ChannelMessage.Send`), delegirano u ime korisnika; change notifications za nove poruke; poruke se NE kopiraju u bazu |
| Korisne informacije, Boravak u kancelariji, parking, mali oglasi, majstor | CMS |
| Preporuke (objave, komentari, lajkovi, anketa) | CMS / PostgreSQL |
| Galerija | SharePoint biblioteka, folder = album |
| Prevodi | CMS (SR/EN/DE) |
| Sezonska tema | CMS podešavanje: `auto` / `winter` / `spring` / `summer` / `autumn` / `off` |

Uloge: admin, urednik (kancelarija/HR), zaposleni.

---

## Globalni layout
- Pozadina stranice: `#F5F6F8`. Sadržaj ima max-width **1320px**, centriran, sa paddingom `32px 32px 80px`.
- **Header** (sticky, top 0, z 30): pozadina `rgba(245,246,248,.86)`, `backdrop-filter: blur(10px)`, donja linija `1px #E2E5EA`. Unutra je flex sa wrap i gap-om `12px 24px`, padding `14px 32px`.
  - Logo: kvadrat 30×30, radius 9, `#4A7FB5`, tekst „os" bele boje, 14px/700. Pored je „Intranet" u Instrument Serif, 22px.
  - Nav pilule (Početna, Korisne informacije, Preporuke, Mali oglasi, Poslovi): visina 34, radius 999, 13px/600. Neaktivna: transparentna, tekst `#6B7178`. Aktivna: `#E4E8EE`, tekst `#1F2429`.
  - Prekidač jezika SR/EN/DE: segment sa belom pozadinom, okvirom `#DCE0E6` i radijusom 999. Aktivno dugme je `#4A7FB5`, belo slovo.
  - Dugme „OS BG portal ↗": visina 38, radius 999, `#4A7FB5`; hover `#3D6E9F`.
  - Avatar korisnika: 34×34, `#E4E8EE`.
- **Naslov strane:** iznad je datum, 12px/600, uppercase, letter-spacing 1.4, `#8A9098`. Naslov je H1 „Sve za ovu nedelju", Instrument Serif 44px/1.05, `#1F2429`. Desno je podnaslov 13px, `#6B7178`, max 340px.

### Početna – mreža
1. **Gornji red:** flex sa wrap, gap 20, `align-items: stretch`.
   - Levo **Kratak pogled**: `flex: 2 1 600px`.
   - Desno kolona: `flex: 1 1 300px`, sa gap-om 20 i sledećim redom:
     - Novi kolege (opciono)
     - Pronađi kolegu (prirodna visina)
     - Korisne informacije (`flex: 1 1 auto`, rasteže se do dna kalendara)
2. **Donji red:** grid `repeat(auto-fit, minmax(min(100%,280px),1fr))`, gap 20, `align-items: stretch`, sa tri kartice iste visine: **Boravak u kancelariji**, **OSBEL Chat**, **Preporuke**.

Standardna kartica: bela, `1px #E2E5EA`, radius 16, padding 18–20, senka `0 1px 2px rgba(20,20,20,.03)`.

Naslov kartice: ikonica 22×22 (radius 6, pozadina `#DCEAF6`, glif `#003366`, 13px) pa tekst 15px/700, `#1F2429`, gap 8.

---

## Ekrani / blokovi

### 1. Kratak pogled (mesečni kalendar)
- **Zaglavlje:**
  - Levo je naslov „Kratak pogled", Instrument Serif 26px.
  - Desno su strelice ‹ › (30×30, okvir `#DCE0E6`, radius 8), naziv meseca (14px/700, min-width 130, centriran) i dugme „Danas" (visina 30, tekst `#4A7FB5`).
- **Legenda:** ikonica 16×16 i labela 11px/600 `#6B7178`, za svaki tip. Na kraju je uzorak „Ova nedelja": pravougaonik 16×10 u `#003366`.
- **Mreža kalendara:** linije su 1px `#D5DAE1`, a spoljni okvir je 1px `#D5DAE1` sa radijusom 10.
  - Header dana (Pon–Ned): 11px/700, uppercase, `#474C53`, pozadina `#EEF1F5`, padding 8.
  - Polje dana: min-height 56, padding 6, gap 3, bez radijusa. Pozadina:
    - budući radni dan: `#FFFFFF`
    - vikend: `#E4EEF8`, broj `#3D73A8`
    - prošli dan: `#F6F7F9`, tekst `#989EA6`, broj `#B0B5BC`
    - dan iz drugog meseca: opacity .5
  - **Tekuća nedelja:** ceo red ima pozadinu `#003366`, padding 5 i gap 4. Polja u njemu imaju radius 6, okvir `1px #A3C6E6` i pozadinu `#D6E7F5` (vikend `#C9DEF0`). Tekst je `#1F2429/700`, pa su događaji podebljani.
  - **Danas:** broj u krugu 18px, `#4A7FB5`, beo broj.
  - **Izabran dan:** `box-shadow: inset 0 0 0 2px #003366` (u tekućoj nedelji `#001F40`). Hover: `inset 0 0 0 2px #A3C6E6`.
  - **Sadržaj polja:** broj (11px/700), pa **jedan** događaj (ikonica 16 + tekst 11px, ellipsis). Ako ih ima više, ispod je „+N" (10px/700, `#4A7FB5`).
- **Detalji dana** ispod mreže (gornja linija `1px #EAEDF1`, padding-top 12):
  - Labela „Danas · Sreda, 7. oktobar": 11px/700, uppercase, `#8A9098`.
  - Kartice događaja u flex-wrap redu, gap 8. Svaka kartica ima `flex: 1 1 calc(100%/min(n,4) - 8px)` i min-width 150, pa **najviše 4 staju u red**, a višak ide u sledeći red i rasteže se.
  - Kartica: pozadina `#F5F8FB`, okvir `1px #E2E5EA`, radius 10, padding 10×12. Grid je ikonica 16 i tekst: vreme 11px/700 `#003366`, naslov 13px/600, opis 12px `#80868E`. Opis je **kratak**, jedna ili dve reči ili mesto.
  - Događaji su sortirani po vremenu, a celodnevni idu na kraj.
- **Tipovi događaja** (ikonica = kvadrat 16, radius 5, glif 10px):
  | Tip | Glif | Boja glifa | Pozadina |
  |---|---|---|---|
  | bday (rođendan/godišnjica) | torta | `#A2502A` | `#F7E6DA` |
  | slava | sveća | `#8A6134` | `#F3EADF` |
  | event | kalendar | `#003366` | `#DCEAF6` |
  | food (hrana u kancelariji) | viljuška | `#7A5429` | `#F3EADF` |
  | holiday (praznik) | zastavica | `#9A3B3B` | `#F5E3E3` |

### 2. Novi kolege (karusel, opciono)
- Uključuje se ako ima novih kolega (prop `showNewcomer`).
- Kartica: pozadina `#EEF5FB`, okvir `1px #CFE1F2`, radius 16, padding 14×16.
- **Red 1:** ikonica raketice (22×22, pozadina `#DCEAF6`), labela „Nove kolege" (11px/700, uppercase, `#3D73A8`) i desno tačkice. Aktivna tačkica je 18×7 `#003366`, ostale 7×7 `#A3C6E6`, a širina se animira 200ms.
- **Red 2:**
  - Avatar 42 (beli, okvir `#CFE1F2`, Instrument Serif 17).
  - „Zdravo, Nikola!" (Instrument Serif 20, `#003366`), a ispod pozicija (12px, `#3D73A8`).
  - Desno strelice ‹ › 28×28.
  - Klik na ime otvara profil.
- Sa jednim kolegom nema strelica ni tačkica, a naslov je „Novi kolega".

### 3. Pronađi kolegu
- Naslov sa ikonicom osobe i lupe.
- Input: visina 42, radius 10, pozadina `#FAFBFC`, okvir `#DCE0E6`; u fokusu okvir `#003366`. Kad ima teksta, desno je dugme × za brisanje. Ispod je hint „Unesi bar dva slova, pa pritisni Enter." (12px).
- **Predlozi:** posle 2 slova otvara se dropdown **apsolutno pozicioniran** (top 46, z 20, bela pozadina, radius 10, senka `0 8px 24px rgba(20,30,50,.12)`), pa se layout ne pomera. Prikazuje do 5 imena, a prvi red je označen i ima hint „↵ Enter".
- **Pretraga:** po početku imena ili prezimena, bez dijakritika (đ = dj).
- **Enter ili klik** otvara **stranicu profila** i briše input. Esc briše input.
- Bez pogotka prikazuje se „Nema kolege sa tim imenom."

### 4. Korisne informacije (pločice 2×2)
- Kartica: pozadina `#DCEAF6`, okvir `1px #A3C6E6`, radius 16. Naslovna ikonica je `#003366` sa belim glifom. Desno je „Svi linkovi →" (`#003366/700`).
- Grid je 2 kolone, `grid-auto-rows: 1fr`, gap 8, i rasteže se do dna.
- Pločica: min-height 76, padding 12, radius 12. Gore je ikonica 30×30 (`rgba(255,255,255,.22)`, glif `currentColor`), a dole naslov 13px/700. Hover: `translateY(-2px)` i senka `0 6px 16px rgba(0,51,102,.22)`.
- **Svaka pločica ima svoju boju:**
  1. IT i VPN: `#003366`, beli tekst
  2. Zdravstveno osiguranje: `#2F6DA8`, beli tekst
  3. Godišnji odmor: `#A3C6E6`, tekst `#003366`
  4. Prijavi IT problem: `#E9D9C2`, tekst `#5C4020`

### 5. Boravak u kancelariji
Odozgo nadole:
1. **Sledeća hrana**: red sa pozadinom `#F8F2EA`, okvirom `1px #EADFCF` i radijusom 10. Ikonica viljuške je bela na `#8A6134`.
   - Podatak se vuče iz kalendara: prvi događaj tipa `food` posle današnjeg dana.
   - U redu su naslov (13px/700), mesto i desno „Sutra · 09:00" (`#7A5429/700`).
   - Klik izabere taj dan u kalendaru.
   - Ako nema događaja, piše „Još ništa nije planirano".
2. **Mali oglasi**: ikonica etikete, oznake Prodajem · Kupujem · Poklanjam (11px, `#3D73A8` na `#EEF5FB`) i broj oglasa ›. Otvara stranicu Mali oglasi.
3. **Galerija**: zelena ikonica slike (`#2F6B47` na `#E3EFE7`), oznake prva 3 albuma i broj albuma. Otvara stranicu Galerija.
4. **Majstor Žile**: `tel:` link, ikonica ključa (`#8A6134` na `#F3EADF`), opis i broj telefona.
5. **Parking**: ikonica rampe sa katancem i **samo jedna rečenica** iz CMS-a. Primer: „Četvrtak: garaža puna od 09:00. Mesto 12 ostaje slobodno za gosta." Bez brojača mesta.

Redovi su odvojeni linijom `1px #EAEDF1`, a ikonice su 32×32 sa radijusom 8.

### 6. OSBEL Chat (Teams kanal)
- **Zaglavlje:** ikonica oblačića (beli glif na `#8A6134`), naslov „OSBEL Chat", podnaslov „Teams grupa · Ručak" i desno pilula „Otvori u Teams-u ↗" (`#F8F2EA`, okvir `#E6D5C0`, tekst `#7A5429`).
- **Lista poruka:** `flex: 1 1 0`, min-height 260, scroll; pozadina `#F8F2EA`, okvir `#EADFCF`, radius 12. Posle slanja auto-scroll na dno.
  - **Tuđa poruka:** levo, avatar 26 i beo oblačić (radius `12 12 12 4`) sa imenom („Ivan J.", 11px/700 `#7A5429`), vremenom i tekstom 13px.
  - **Moja poruka:** desno, oblačić `#003366` sa belim tekstom, radius `12 12 4 12`, vreme `#A3C6E6`.
  - **Sistemska poruka:** centrirana pilula `#EADFCF`, tekst `#5C4020`, 11px.
- **Unos:** input visine 40 (u fokusu okvir `#8A6134`) i dugme „Pošalji →" (`#8A6134`, hover `#6E4C27`). Enter šalje.

### 7. Preporuke (početna)
- Zaglavlje sa ikonicom zvezde i „Više →" desno (nowrap).
- Grid 2×2, `grid-auto-rows: 1fr`:
  - **3 kartice kategorija**: pozadina `#FAFBFC`, okvir `#E2E5EA`, radius 12, padding 12; hover okvir `#003366`. Svaka ima ikonicu kategorije 28 i broj objava, naziv (14/700), podkategorije (11px `#80868E`) i naslov najnovije objave ispod linije. Klik otvara stranicu Preporuke na toj kategoriji.
  - **Anketa**: pozadina `#EEF5FB`, okvir `#CFE1F2`. Sadrži ikonicu stubića, broj glasova, pitanje (13/700) i opcije.
- **Opcija ankete:** dugme sa trakom procenta u pozadini (`#E6F0F9`; izabrana `#BFD7EE` sa okvirom `#003366`) i procentom desno. Klik glasa, ponovni klik povlači glas. Širina trake se animira 400ms.

**Kategorije:**
| Ključ | Naziv | fg / bg | Podkategorije (ikonica) |
|---|---|---|---|
| culture | Kultura | `#003366` / `#DCEAF6` | Pozorište (dve maske), Bioskop (kokice), Koncerti (nota), Knjige (knjiga) |
| weekend | Gde za vikend | `#2F6B47` / `#E3EFE7` | Salaši (kuća), Wellness (kap), Izleti (kompas), Planine (planina) |
| gastro | Gastro kutak | `#7A5429` / `#F3EADF` | Recepti (šerpa), Restorani (pribor), Kafa i slatko (šolja) |
| poll | Anketa | `#3D73A8` / `#E6F0F9` | — |

---

## Podstranice
Sve podstranice imaju link „← Nazad na početnu" (13px/600, `#003366`) i naslov H1 u Instrument Serif 40px.

- **Profil kolege:**
  - Leva kartica: avatar 84, ime (Serif 34), pozicija, tim · lokacija. Ispod su 4 podatka (E-pošta, Telefon, Lokacija, Sa nama od) i oznake „Pitaj me o".
  - Desna kartica: „Isti tim", lista kolega koje se mogu kliknuti.
- **Preporuke:**
  - Tabovi su pilule visine 40, sa ikonicom u krugu 26; aktivna pilula ima fg boju kategorije. Redom: Kultura · Gde za vikend · Gastro kutak · **Anketa**.
  - Ispod tabova su filteri podkategorija („Sve" + podkategorije).
  - Objave su **lista odozgo nadole**, sa razmakom 14. Objava je kartica sa gridom `76px | 1fr`:
    - Levo je kvadrat 76×76 (radius 14, bg kategorije) sa ikonicom podkategorije 34px.
    - Desno su oznaka podkategorije, autor · vreme (nowrap) i sasvim desno srce i broj komentara. Lajkovano srce je `#4A7FB5` i popunjeno.
    - Ispod su naslov 16/700, tekst 13/1.5, meta 12px i komentari („**Ime P.** tekst · vreme").
    - Na dnu je input „Dodaj komentar…" sa dugmetom „Objavi" (`#003366`). Enter objavljuje.
  - Tab Anketa prikazuje samo anketu (max 640, pitanje 22px).
- **Galerija:**
  - Mreža albuma `auto-fill minmax(260px,1fr)`. Kartica albuma ima mozaik 2fr|1fr × 2 reda (aspect 4/3, radius 10), pa ikonicu foldera, naziv i „N fotografija · datum".
  - Klik otvara album: mreža fotografija `minmax(170px,1fr)`, kvadrati sa radijusom 10, i link „← Svi albumi".
  - Predlog: dodati lightbox sa strelicama.
- **Mali oglasi:** mreža 3 kolone. Kartica ima oznaku, naslov, opis, prodavca (klik otvara profil) i cenu.
- **Korisne informacije:** 3 grupe (Prvi koraci, Zaposleni i beneficije, Svakodnevna administracija), po 4 linka.
- **Otvorene pozicije:** filteri po timu i lista pozicija sa bonusom za preporuku (pilula `#F3EADF`/`#8A6134`) i dugmetom „Preporuči nekoga".

---

## Sezonski efekat
- Full-screen `<canvas>`: `position: fixed`, `inset: 0`, `pointer-events: none`, z-index 40.
- Pokreće ga `requestAnimationFrame`; broj čestica i boje zavise od sezone.
  - **zima:** 90 pahuljica, 6 krakova, linija 1.7, boje `#7FA9D6` `#5F93C9` `#9DC0E3`, padaju sa njihanjem (sinus)
  - **jesen:** 34 lista (elipsa sa žilom), `#C98A4B` `#B5652E` `#D9A441` `#8A6134`
  - **proleće:** 45 latica, `#EFA9BA` `#F4C2CE` `#E8B07E` `#9CC47F`
  - **leto:** 32 mehurića koji se penju, `#6FA6DA` `#E2B54D`
- Opacity čestica je 0.7–1.
- `auto` bira sezonu po mesecu: XII–II zima, III–V proleće, VI–VIII leto, IX–XI jesen.
- **Pristupačnost:** za produkciju poštovati `prefers-reduced-motion`. Kod tih korisnika iscrtati jedan statičan frame bez animacije. U prototipu je to prop `animateAlways = false`.

---

## Interakcije i stanje
- **Easing:** svuda `cubic-bezier(.19,1,.22,1)`, 200ms (trake ankete 400ms).
- **Stanje stranice:**
  - `lang` (sr|en|de)
  - `page` (home|person|homemade|jobs|useful|recs|gallery)
  - `personId`
  - kalendar: `calY`, `calM`, `selDate`
  - pretraga: `sq`
  - novi kolege: `newIdx`
  - preporuke: `recCat`, `recSub`, `recLikes{}`, `recComments{}`, `recDrafts{}`, `pollVote`
  - galerija: `galFolder`
  - chat: `chat[]`, `chatDraft`
- **Rutiranje** (predlog): `/`, `/kolega/:id`, `/preporuke/:kategorija`, `/galerija`, `/galerija/:album`, `/oglasi`, `/linkovi`, `/poslovi`.
- **Responzivnost:** kolone se prelamaju (flex-wrap ili grid auto-fit). Desna kolona pada ispod kalendara, a donje kartice jedna ispod druge. Mobilna verzija nije posebno dizajnirana.
- **Prazna stanja:**
  - dan bez događaja: „Ništa nije zakazano."
  - nema hrane: „Još ništa nije planirano"
  - pretraga bez pogotka: „Nema kolege sa tim imenom."

---

## Design tokens
**Plave (glavne):**
| Boja | Upotreba |
|---|---|
| `#003366` | navy, primarna |
| `#001F40` | hover za navy |
| `#2F6DA8` | srednja |
| `#3D73A8` | tekst-plava |
| `#4A7FB5` | akcent, ranije magenta |
| `#3D6E9F` | hover za akcent |
| `#A3C6E6` | nebo plava |
| `#BFD7EE` | svetla plava |
| `#C9DEF0` | svetla plava |
| `#CFE1F2` | svetla plava |
| `#D6E7F5` | svetla plava |
| `#DCEAF6` | svetla plava |
| `#E4EEF8` | svetla plava |
| `#E6F0F9` | svetla plava |
| `#EEF5FB` | svetla plava |
| `#F5F8FB` | svetla plava |

**Neutralne:**
| Boja | Upotreba |
|---|---|
| `#F5F6F8` | pozadina stranice |
| `#FAFBFC` | input/podloga |
| `#FFFFFF` | kartica |
| `#EEF1F5` | sitne površine |
| `#E4E8EE` | sitne površine |
| `#EAEDF1` | linija |
| `#E2E5EA` | okvir |
| `#DCE0E6` | okvir |
| `#D5DAE1` | linija kalendara |
| `#1F2429` | naslov |
| `#2A2F35` | tekst |
| `#474C53` | tekst |
| `#6B7178` | sekundarni tekst |
| `#80868E` | sekundarni tekst |
| `#8A9098` | prigušeno |
| `#989EA6` | prigušeno |

**Bež (hrana / chat / topli akcenat):** `#F8F2EA` `#F3EADF` `#EADFCF` `#E6D5C0` `#E9D9C2` `#C9B496` `#8A6134` `#7A5429` `#6E4C27` `#5C4020`

**Zelena (vikend / galerija):** `#2F6B47` `#D3E6DA` `#E3EFE7` `#EEF5F0`

**Tipografija:**
- Naslovi: Instrument Serif 400, veličine 44 / 40 / 34 / 30 / 26 / 22 / 20.
- UI: Manrope, debljine 400 / 500 / 600 / 700, veličine 18 / 16 / 15 / 14 / 13 / 12 / 11 / 10.
- Labele: 11px/700, uppercase, letter-spacing 1.1–1.4.

**Razmaci:** 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32

**Radijusi:** 5–6 (male ikonice), 7–8 (dugmad, ikonice 32), 10 (input, polja), 12 (pod-kartice), 14 (kvadrat objave), 16 (kartice), 999 (pilule)

**Senke:**
- kartica: `0 1px 2px rgba(20,20,20,.03)`
- dropdown: `0 8px 24px rgba(20,30,50,.12)`
- hover pločice: `0 6px 16px rgba(0,51,102,.22)`
- hover albuma: `0 6px 18px rgba(0,51,102,.10)`

## Assets
- Sve ikonice su inline SVG, 16×16 viewBox, sa stroke 1.5–1.6 i round cap/join. U implementaciji ih zameniti odgovarajućim iz izabranog seta (npr. Fluent, koji koristi enaio) ili izvesti iz HTML-a.
- Logotip „os" je privremen; zameniti zvaničnim OPTIMAL SYSTEMS logom.
- Avatari, fotografije galerije i slike preporuka su placeholderi.

## Otvorena pitanja
1. **Brend:** uskladiti font i plavu sa zvaničnim OPTIMAL SYSTEMS vodičem (designguide.optimal-systems.de). enaio dizajn sistem koristi **Poppins 400/700** i plavu **#0092e1** / **#005873**; potvrditi.
2. Pravi linkovi: OS BG portal, Teams kanal, korisni linkovi.
3. Mobilni prikaz: da li je potreban.

## Files
- `Intranet.dc.html`: kompletan prototip (sve strane, stanja i podaci). Otvoriti u browseru.
- `support.js`: runtime potreban za otvaranje prototipa.
- Tweaks/props u prototipu:
  - `defaultLanguage`
  - `startPage`
  - `showNewcomer`
  - `season`
  - `animateAlways`
