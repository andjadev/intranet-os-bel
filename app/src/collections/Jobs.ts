import type { CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: {
    singular: { sr: 'Pozicija', en: 'Position', de: 'Stelle' },
    plural: { sr: 'Otvorene pozicije', en: 'Open positions', de: 'Offene Stellen' },
  },
  admin: { hidden: hiddenForEditors, useAsTitle: 'title', defaultColumns: ['title', 'department', 'bonus', 'open'] },
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Title', de: 'Titel' } },
    { name: 'meta', type: 'text', localized: true, label: { sr: 'Lokacija · tip', en: 'Location · type', de: 'Ort · Art' } },
    {
      type: 'row',
      fields: [
        { name: 'department', type: 'relationship', relationTo: 'departments', label: { sr: 'Tim', en: 'Team', de: 'Team' } },
        { name: 'bonus', type: 'text', label: { sr: 'Bonus za preporuku', en: 'Referral bonus', de: 'Empfehlungsbonus' } },
      ],
    },
    {
      name: 'referUrl',
      type: 'text',
      label: { sr: 'Link „Preporuči nekoga" (mailto: ili URL)', en: '"Refer someone" link', de: 'Link „Empfehlen"' },
    },
    { name: 'open', type: 'checkbox', defaultValue: true, label: { sr: 'Otvorena', en: 'Open', de: 'Offen' } },
  ],
}
