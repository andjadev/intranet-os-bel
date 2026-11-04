import path from 'path'
import type { CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'

/** Files behind "Korisne informacije" (forms, rulebooks, instructions). Only signed-in colleagues can open them. */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: { sr: 'Dokument', en: 'Document', de: 'Dokument' },
    plural: { sr: 'Dokumenti', en: 'Documents', de: 'Dokumente' },
  },
  admin: {
    hidden: hiddenForEditors,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
    components: { beforeListTable: ['/components/admin/UploadDropzone#DocumentsDropzone'] },
  },
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  fields: [],
  upload: {
    staticDir: path.join(process.env.MEDIA_DIR || 'media', 'documents'),
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'text/plain',
      'text/csv',
      'application/zip',
      'image/*',
    ],
  },
}
