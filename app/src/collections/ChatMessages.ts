import type { CollectionConfig } from 'payload'

import { editors, loggedIn } from '../access'

/**
 * v1 chat lives in our own database. v2 replaces it with the Teams channel
 * via Microsoft Graph (see README), at which point this collection goes away.
 */
export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  labels: {
    singular: { sr: 'Poruka', en: 'Message', de: 'Nachricht' },
    plural: { sr: 'OSBEL Chat', en: 'OSBEL Chat', de: 'OSBEL Chat' },
  },
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['text', 'author', 'system', 'createdAt'],
    description: {
      sr: 'Sistemska poruka (npr. „Ručak · danas") se prikazuje kao pilula u sredini.',
      en: 'A system message (e.g. "Lunch · today") is shown as a centered pill.',
      de: 'Eine Systemnachricht (z. B. „Mittagessen · heute") erscheint als Pille.',
    },
  },
  defaultSort: '-createdAt',
  access: { read: loggedIn, create: loggedIn, update: editors, delete: editors },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !data.author && req.user) data.author = req.user.id
        return data
      },
    ],
  },
  fields: [
    { name: 'text', type: 'text', required: true, maxLength: 1000 },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'system', type: 'checkbox', defaultValue: false, label: { sr: 'Sistemska poruka', en: 'System message', de: 'Systemnachricht' } },
  ],
}
