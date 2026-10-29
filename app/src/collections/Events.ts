import type { CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: { sr: 'Događaj', en: 'Event', de: 'Termin' },
    plural: { sr: 'Kalendar', en: 'Calendar', de: 'Kalender' },
  },
  admin: {
    hidden: hiddenForEditors,
    useAsTitle: 'title',
    defaultColumns: ['date', 'time', 'type', 'title'],
    description: {
      sr: 'Događaji za „Kratak pogled". Rođendani se dodaju automatski iz profila kolega.',
      en: 'Events for "Sneak a peek". Birthdays are added automatically from colleague profiles.',
      de: 'Termine für „Kurzer Blick". Geburtstage kommen automatisch aus den Profilen.',
    },
  },
  defaultSort: '-date',
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          index: true,
          label: { sr: 'Datum', en: 'Date', de: 'Datum' },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        {
          name: 'time',
          type: 'text',
          label: { sr: 'Vreme (prazno = ceo dan)', en: 'Time (empty = all day)', de: 'Uhrzeit (leer = ganztags)' },
          validate: (v: string | null | undefined) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v) || 'HH:MM',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'event',
          label: { sr: 'Tip', en: 'Type', de: 'Typ' },
          options: [
            { label: { sr: 'Rođendan / godišnjica', en: 'Birthday / anniversary', de: 'Geburtstag / Jubiläum' }, value: 'bday' },
            { label: { sr: 'Slava', en: 'Slava', de: 'Slava' }, value: 'slava' },
            { label: { sr: 'Događaj', en: 'Event', de: 'Termin' }, value: 'event' },
            { label: { sr: 'Hrana u kancelariji', en: 'Food in the office', de: 'Essen im Büro' }, value: 'food' },
            { label: { sr: 'Praznik', en: 'Holiday', de: 'Feiertag' }, value: 'holiday' },
          ],
        },
      ],
    },
    { name: 'title', type: 'text', required: true, localized: true, label: { sr: 'Naslov', en: 'Title', de: 'Titel' } },
    {
      name: 'description',
      type: 'text',
      localized: true,
      label: { sr: 'Kratak opis ili mesto', en: 'Short note or place', de: 'Kurze Notiz oder Ort' },
    },
  ],
}
