import type { CollectionConfig } from 'payload'

import { authorOrEditors, editors, hiddenForEditors, loggedIn } from '../access'
import { iconOptions } from '../lib/constants'

const group = { sr: 'Preporuke', en: 'Recommendations', de: 'Empfehlungen' }

const setAuthor: NonNullable<CollectionConfig['hooks']>['beforeChange'] = [
  ({ data, req, operation }) => {
    if (operation === 'create' && !data.author && req.user) data.author = req.user.id
    return data
  },
]

export const RecCategories: CollectionConfig = {
  slug: 'rec-categories',
  labels: {
    singular: { sr: 'Kategorija', en: 'Category', de: 'Kategorie' },
    plural: { sr: 'Kategorije preporuka', en: 'Recommendation categories', de: 'Empfehlungskategorien' },
  },
  admin: { useAsTitle: 'label', group, defaultColumns: ['label', 'slug', 'order'] },
  defaultSort: 'order',
  access: { read: loggedIn, create: editors, update: editors, delete: editors },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Name', de: 'Name' } },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          label: { sr: 'Oznaka', en: 'Short name', de: 'Kürzel' },
          admin: {
            description: {
              sr: 'Mala slova, bez razmaka i kvačica, npr. kultura → /preporuke/kultura. Ne menjati kad je u upotrebi.',
              en: 'Lowercase, no spaces, e.g. culture → /preporuke/culture. Do not change once in use.',
              de: 'Kleinbuchstaben, ohne Leerzeichen, z. B. kultur → /preporuke/kultur. Nach Verwendung nicht ändern.',
            },
          },
        },
        { name: 'order', type: 'number', defaultValue: 0, label: { sr: 'Redosled', en: 'Order', de: 'Reihenfolge' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'icon', type: 'select', defaultValue: 'culture', options: iconOptions(['culture', 'weekend', 'gastro']) },
        { name: 'fg', type: 'text', defaultValue: '#003768', label: { sr: 'Boja (tekst)', en: 'Color (text)', de: 'Farbe (Text)' } },
        { name: 'bg', type: 'text', defaultValue: '#E8EEF2', label: { sr: 'Boja (pozadina)', en: 'Color (background)', de: 'Farbe (Hintergrund)' } },
      ],
    },
    {
      name: 'subs',
      type: 'array',
      label: { sr: 'Podkategorije', en: 'Sub-categories', de: 'Unterkategorien' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Name', de: 'Name' } },
            { name: 'slug', type: 'text', required: true, label: { sr: 'Oznaka', en: 'Short name', de: 'Kürzel' } },
            {
              name: 'icon',
              type: 'select',
              defaultValue: 'books',
              options: iconOptions([
                'theater', 'cinema', 'concerts', 'books', 'salas', 'wellness',
                'trips', 'mountains', 'recipes', 'restaurants', 'coffee',
              ]),
            },
          ],
        },
      ],
    },
  ],
}

export const RecPosts: CollectionConfig = {
  slug: 'rec-posts',
  labels: {
    singular: { sr: 'Objava', en: 'Post', de: 'Beitrag' },
    plural: { sr: 'Objave', en: 'Posts', de: 'Beiträge' },
  },
  admin: { useAsTitle: 'title', group, defaultColumns: ['title', 'category', 'author', 'createdAt'] },
  defaultSort: '-createdAt',
  access: { read: loggedIn, create: loggedIn, update: authorOrEditors(), delete: authorOrEditors() },
  hooks: { beforeChange: setAuthor },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'relationship', relationTo: 'rec-categories', required: true, label: { sr: 'Kategorija', en: 'Category', de: 'Kategorie' } },
        { name: 'sub', type: 'text', label: { sr: 'Podkategorija (oznaka)', en: 'Sub-category (short name)', de: 'Unterkategorie (Kürzel)' } },
      ],
    },
    { name: 'title', type: 'text', required: true, label: { sr: 'Naslov', en: 'Title', de: 'Titel' } },
    { name: 'text', type: 'textarea', label: { sr: 'Tekst', en: 'Text', de: 'Text' } },
    { name: 'meta', type: 'text', label: { sr: 'Mesto · vreme', en: 'Place · time', de: 'Ort · Zeit' } },
    { name: 'image', type: 'upload', relationTo: 'media', label: { sr: 'Slika', en: 'Image', de: 'Bild' } },
    { name: 'author', type: 'relationship', relationTo: 'users', label: { sr: 'Autor', en: 'Author', de: 'Autor' } },
    {
      name: 'likes',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      label: { sr: 'Lajkovi', en: 'Likes', de: 'Likes' },
      admin: { readOnly: true },
    },
  ],
}

export const RecComments: CollectionConfig = {
  slug: 'rec-comments',
  labels: {
    singular: { sr: 'Komentar', en: 'Comment', de: 'Kommentar' },
    plural: { sr: 'Komentari', en: 'Comments', de: 'Kommentare' },
  },
  admin: { useAsTitle: 'text', group, defaultColumns: ['text', 'post', 'author', 'createdAt'] },
  defaultSort: 'createdAt',
  access: { read: loggedIn, create: loggedIn, update: authorOrEditors(), delete: authorOrEditors() },
  hooks: { beforeChange: setAuthor },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'rec-posts', required: true, index: true },
    { name: 'text', type: 'textarea', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
}

export const Polls: CollectionConfig = {
  slug: 'polls',
  labels: {
    singular: { sr: 'Anketa', en: 'Poll', de: 'Umfrage' },
    plural: { sr: 'Ankete', en: 'Polls', de: 'Umfragen' },
  },
  admin: {
    useAsTitle: 'question',
    group,
    description: {
      sr: 'Na početnoj se prikazuje poslednja aktivna anketa.',
      en: 'The latest active poll is shown on the home page.',
      de: 'Die neueste aktive Umfrage erscheint auf der Startseite.',
    },
  },
  defaultSort: '-createdAt',
  access: { read: loggedIn, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, label: { sr: 'Pitanje', en: 'Question', de: 'Frage' } },
    {
      name: 'options',
      type: 'array',
      minRows: 2,
      label: { sr: 'Opcije', en: 'Options', de: 'Optionen' },
      fields: [{ name: 'label', type: 'text', required: true, localized: true }],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'until',
          type: 'date',
          label: { sr: 'Glasanje do', en: 'Voting until', de: 'Abstimmung bis' },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        { name: 'active', type: 'checkbox', defaultValue: true, label: { sr: 'Aktivna', en: 'Active', de: 'Aktiv' } },
      ],
    },
  ],
}

export const PollVotes: CollectionConfig = {
  slug: 'poll-votes',
  labels: {
    singular: { sr: 'Glas', en: 'Vote', de: 'Stimme' },
    plural: { sr: 'Glasovi', en: 'Votes', de: 'Stimmen' },
  },
  admin: { group, hidden: hiddenForEditors },
  // Votes are written only through the server action, which checks the user.
  access: { read: loggedIn, create: () => false, update: () => false, delete: editors },
  fields: [
    { name: 'poll', type: 'relationship', relationTo: 'polls', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'option', type: 'text', required: true },
  ],
}
