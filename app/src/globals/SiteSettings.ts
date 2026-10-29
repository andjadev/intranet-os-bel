import type { GlobalConfig } from 'payload'

import { editors, loggedIn, superadminsField } from '../access'

// Editors change the office and chat notes; the home page and links stay with the superadmin.
const superadminOnly = { update: superadminsField }

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { sr: 'Podešavanja portala', en: 'Portal settings', de: 'Portal-Einstellungen' },
  access: { read: loggedIn, update: editors },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { sr: 'Početna', en: 'Home', de: 'Startseite' },
          fields: [
            {
              name: 'homeTitle',
              access: superadminOnly,
              type: 'text',
              localized: true,
              label: { sr: 'Naslov', en: 'Title', de: 'Titel' },
            },
            {
              name: 'homeSubtitle',
              access: superadminOnly,
              type: 'textarea',
              localized: true,
              label: { sr: 'Podnaslov', en: 'Subtitle', de: 'Untertitel' },
            },
            {
              name: 'showNewcomers',
              access: superadminOnly,
              type: 'checkbox',
              defaultValue: true,
              label: { sr: 'Prikaži karticu „Nove kolege"', en: 'Show "New colleagues" card', de: 'Karte „Neue Kolleg:innen" zeigen' },
            },
          ],
        },
        {
          label: { sr: 'Kancelarija', en: 'Office', de: 'Büro' },
          fields: [
            {
              name: 'parkingNote',
              type: 'text',
              localized: true,
              label: { sr: 'Parking (jedna rečenica)', en: 'Parking (one sentence)', de: 'Parken (ein Satz)' },
            },
            {
              type: 'row',
              fields: [
                { name: 'handymanName', type: 'text', defaultValue: 'Majstor Žile', label: { sr: 'Majstor – ime', en: 'Handyman – name', de: 'Handwerker – Name' } },
                { name: 'handymanPhone', type: 'text', label: { sr: 'Majstor – telefon', en: 'Handyman – phone', de: 'Handwerker – Telefon' } },
              ],
            },
            {
              name: 'handymanDescription',
              type: 'text',
              localized: true,
              label: { sr: 'Majstor – opis', en: 'Handyman – description', de: 'Handwerker – Beschreibung' },
            },
          ],
        },
        {
          label: { sr: 'Linkovi i chat', en: 'Links & chat', de: 'Links & Chat' },
          fields: [
            { name: 'teamsUrl', type: 'text', defaultValue: '#', access: superadminOnly, label: { sr: 'Teams kanal URL', en: 'Teams channel URL', de: 'Teams-Kanal-URL' } },
            {
              name: 'chatSubtitle',
              type: 'text',
              localized: true,
              label: { sr: 'Chat podnaslov', en: 'Chat subtitle', de: 'Chat-Untertitel' },
            },
          ],
        },
      ],
    },
  ],
}
