import { Forbidden, ValidationError, type CollectionConfig } from 'payload'

import { hiddenForEditors, isEditorReq, isSuperadminReq, loggedIn, superadmins, superadminsField } from '../access'
import { MIN_PASSWORD_LENGTH } from '../lib/constants'
import { readCookie, readSession, SESSION_COOKIE } from '../lib/session'

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

/**
 * Users double as the colleague directory: a superadmin creates each colleague
 * (with a temporary password) or they appear on first Microsoft sign-in, and
 * editors fill in the profile fields.
 *
 * Passwords use Payload's local strategy (hashing, lockout) only to check
 * credentials; the session itself is always the osbel_session cookie.
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
    useSessions: false,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    strategies: [
      {
        name: 'osbel-session',
        authenticate: async ({ headers, payload }) => {
          const session = await readSession(readCookie(headers.get('cookie'), SESSION_COOKIE))
          if (!session) return { user: null }
          const user = await payload
            .findByID({ collection: 'users', id: session.uid, depth: 0, overrideAccess: true })
            .catch(() => null)
          if (!user || user.active === false) return { user: null }
          // A password change signs out every session issued before it.
          if (user.sessionsValidAfter && session.issuedAt < new Date(user.sessionsValidAfter).getTime()) {
            return { user: null }
          }
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
    beforeOperation: [
      ({ args, operation, req }) => {
        // No e-mail is sent, so password resets go through a superadmin instead.
        if (operation === 'forgotPassword' || operation === 'resetPassword') throw new Forbidden(req.t)
        if (operation !== 'create' && operation !== 'update') return args

        const data = args.data as { password?: unknown; mustChangePassword?: boolean; sessionsValidAfter?: string } | undefined
        if (!data) return args
        // Only superadmins and trusted server code may set these directly; the hook sets them below.
        if (!args.overrideAccess && !isSuperadminReq(req)) delete data.mustChangePassword
        if (!args.overrideAccess) delete data.sessionsValidAfter

        if (typeof data.password !== 'string' || !data.password) return args
        // Colleagues change their own password on /lozinka, which checks the current one first.
        if (!args.overrideAccess && !isSuperadminReq(req)) throw new Forbidden(req.t)
        if (data.password.length < MIN_PASSWORD_LENGTH) {
          throw new ValidationError({
            collection: 'users',
            errors: [{ path: 'password', message: `Lozinka mora imati najmanje ${MIN_PASSWORD_LENGTH} znakova.` }],
            req,
          })
        }
        // A password set by someone else is temporary; your own choice is not.
        const id = (args as { id?: number | string }).id
        const own = operation === 'update' && req.user && id !== undefined && String(req.user.id) === String(id)
        // Accounts created on Microsoft sign-in get a random, never-used password (context.randomPassword).
        if (!req.context?.randomPassword) data.mustChangePassword = !own
        if (operation === 'update') data.sessionsValidAfter = new Date().toISOString()
        return args
      },
    ],
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
      name: 'mustChangePassword',
      type: 'checkbox',
      // false for existing rows; beforeOperation sets it whenever someone else sets the password.
      // Write access is also enforced there, so the hook's own value survives.
      defaultValue: false,
      label: { sr: 'Mora da promeni lozinku', en: 'Must change password', de: 'Muss Passwort ändern' },
      admin: {
        position: 'sidebar',
        description: {
          sr: 'Uključuje se automatski kad superadmin postavi lozinku.',
          en: 'Set automatically when a superadmin sets the password.',
          de: 'Wird automatisch gesetzt, wenn ein Superadmin das Passwort setzt.',
        },
      },
    },
    {
      name: 'sessionsValidAfter',
      type: 'date',
      admin: { hidden: true },
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
      type: 'row',
      fields: [
        {
          name: 'slavaName',
          type: 'text',
          label: { sr: 'Slava', en: 'Slava (patron saint)', de: 'Slava (Familienpatron)' },
          admin: { placeholder: 'npr. Sveti Nikola' },
        },
        {
          name: 'slavaDate',
          type: 'date',
          label: { sr: 'Datum slave (prikazuje se u kalendaru)', en: 'Slava date (shown in calendar)', de: 'Slava-Datum' },
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
