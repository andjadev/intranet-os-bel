import type { CollectionConfig } from 'payload'

import { hiddenForEditors, isEditorReq, isSuperadminReq, loggedIn, superadmins, superadminsField } from '../access'
import { readCookie, SESSION_COOKIE, verifySessionToken } from '../lib/session'

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

/**
 * Users double as the colleague directory: every employee who signs in with
 * Microsoft gets a record here, and editors fill in the profile fields.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { sr: 'Kolega', en: 'Colleague', de: 'Kolleg:in' },
    plural: { sr: 'Kolege', en: 'Colleagues', de: 'Kolleg:innen' },
  },
  admin: {
    // Editors still reach their own profile via the account page.
    hidden: hiddenForEditors,
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'department', 'role'],
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [
      {
        name: 'osbel-session',
        authenticate: async ({ headers, payload }) => {
          const uid = await verifySessionToken(readCookie(headers.get('cookie'), SESSION_COOKIE))
          if (!uid) return { user: null }
          const user = await payload
            .findByID({ collection: 'users', id: uid, depth: 0, overrideAccess: true })
            .catch(() => null)
          if (!user || user.active === false) return { user: null }
          return { user: { ...user, collection: 'users', _strategy: 'osbel-session' } }
        },
      },
    ],
  },
  access: {
    admin: ({ req }) => isEditorReq(req),
    read: loggedIn,
    create: superadmins,
    delete: superadmins,
    update: ({ req }) => {
      if (!req.user) return false
      if (isSuperadminReq(req)) return true
      return { id: { equals: req.user.id } }
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.name) {
          if (!data.initials) data.initials = initialsOf(data.name)
          if (!data.firstName) data.firstName = String(data.name).split(/\s+/)[0]
        }
        if (data?.email) data.email = String(data.email).toLowerCase()
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: { sr: 'Ime i prezime', en: 'Full name', de: 'Name' } },
        { name: 'email', type: 'email', required: true, unique: true, index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: { sr: 'Ime (za pozdrav)', en: 'First name', de: 'Vorname' } },
        { name: 'initials', type: 'text', label: { sr: 'Inicijali', en: 'Initials', de: 'Initialen' } },
      ],
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'employee',
      saveToJWT: true,
      access: { create: superadminsField, update: superadminsField },
      options: [
        { label: { sr: 'Superadmin', en: 'Superadmin', de: 'Superadmin' }, value: 'superadmin' },
        { label: { sr: 'Urednik', en: 'Editor', de: 'Redakteur' }, value: 'editor' },
        { label: { sr: 'Zaposleni', en: 'Employee', de: 'Mitarbeiter' }, value: 'employee' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: { sr: 'Aktivan (vidljiv u imeniku)', en: 'Active (shown in directory)', de: 'Aktiv' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'entraId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Microsoft Entra object ID' },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'jobTitle', type: 'text', localized: true, label: { sr: 'Pozicija', en: 'Job title', de: 'Position' } },
        { name: 'department', type: 'relationship', relationTo: 'departments', label: { sr: 'Tim', en: 'Team', de: 'Team' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'office', type: 'text', defaultValue: 'Beograd', label: { sr: 'Lokacija', en: 'Office', de: 'Standort' } },
        { name: 'phone', type: 'text', label: { sr: 'Telefon', en: 'Phone', de: 'Telefon' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: { sr: 'Sa nama od', en: 'With us since', de: 'Dabei seit' },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        {
          name: 'birthday',
          type: 'date',
          label: { sr: 'Rođendan (prikazuje se u kalendaru)', en: 'Birthday (shown in calendar)', de: 'Geburtstag' },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.' } },
        },
      ],
    },
    {
      name: 'skills',
      type: 'text',
      hasMany: true,
      localized: true,
      label: { sr: 'Pitaj me o', en: 'Ask me about', de: 'Frag mich zu' },
    },
    {
      type: 'collapsible',
      label: { sr: 'Novi kolega', en: 'Newcomer', de: 'Neu im Team' },
      fields: [
        {
          name: 'isNewcomer',
          type: 'checkbox',
          label: { sr: 'Prikaži u „Nove kolege" na početnoj', en: 'Show in "New colleagues"', de: 'In „Neue Kolleg:innen" zeigen' },
        },
        { name: 'newcomerNote', type: 'textarea', localized: true, label: { sr: 'Kratka napomena', en: 'Short note', de: 'Kurze Notiz' } },
      ],
    },
  ],
}
