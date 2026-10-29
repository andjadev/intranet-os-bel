import type { CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'
import { iconOptions } from '../lib/constants'

export const Links: CollectionConfig = {
  slug: 'links',
  labels: {
    singular: { sr: 'Link', en: 'Link', de: 'Link' },
    plural: { sr: 'Korisne informacije', en: 'Useful information', de: 'Nützliche Infos' },
  },
  admin: { hidden: hiddenForEditors, useAsTitle: 'title', defaultColumns: ['title', 'group', 'tile', 'order'] },
  defaultSort: 'order',
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { sr: 'Naslov', en: 'Title', de: 'Titel' } },
    { name: 'description', type: 'text', localized: true, label: { sr: 'Opis', en: 'Description', de: 'Beschreibung' } },
    { name: 'url', type: 'text', required: true, label: 'URL', defaultValue: '#' },
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          type: 'select',
          required: true,
          label: { sr: 'Grupa', en: 'Group', de: 'Gruppe' },
          options: [
            { label: { sr: 'Prvi koraci', en: 'Getting started', de: 'Erste Schritte' }, value: 'start' },
            { label: { sr: 'Zaposleni i beneficije', en: 'People & benefits', de: 'Personal & Benefits' }, value: 'people' },
            { label: { sr: 'Svakodnevna administracija', en: 'Everyday admin', de: 'Alltag & Verwaltung' }, value: 'admin' },
          ],
        },
        { name: 'order', type: 'number', defaultValue: 0, label: { sr: 'Redosled', en: 'Order', de: 'Reihenfolge' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tile',
          type: 'select',
          label: { sr: 'Pločica na početnoj (max 4)', en: 'Home tile (max 4)', de: 'Kachel auf Startseite (max. 4)' },
          options: [
            { label: { sr: 'OS plava', en: 'OS Blue', de: 'OS-Blau' }, value: 'navy' },
            { label: { sr: 'Svetla plava', en: 'Bright blue', de: 'Hellblau' }, value: 'mid' },
            { label: { sr: 'Siva', en: 'Grey', de: 'Grau' }, value: 'sky' },
            { label: { sr: 'Crna', en: 'Black', de: 'Schwarz' }, value: 'sand' },
          ],
        },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'doc',
          label: { sr: 'Ikonica', en: 'Icon', de: 'Symbol' },
          options: iconOptions(['vpn', 'health', 'vacation', 'alert', 'card', 'doc']),
        },
      ],
    },
  ],
}
