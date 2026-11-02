import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * superadmin - everything, including roles and the upper half of the home page
 *              (calendar, colleagues, useful info, jobs, portal settings).
 * editor     - the lower half: recommendations & polls, classifieds, gallery, chat, office notes.
 * employee   - reads the portal and adds their own posts, comments, ads, votes and chat messages.
 */
export type Role = 'superadmin' | 'editor' | 'employee'

const roleOf = (req: PayloadRequest): Role | null =>
  ((req.user as { role?: Role } | null)?.role ?? null)

export const isSuperadminReq = (req: PayloadRequest) => roleOf(req) === 'superadmin'
export const isEditorReq = (req: PayloadRequest) => {
  const r = roleOf(req)
  return r === 'superadmin' || r === 'editor'
}

export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const editors: Access = ({ req }) => isEditorReq(req)
export const superadmins: Access = ({ req }) => isSuperadminReq(req)
export const superadminsField: FieldAccess = ({ req }) => isSuperadminReq(req)

/** `admin.hidden` for collections only a superadmin manages. */
export const hiddenForEditors = ({ user }: { user: unknown }) => (user as { role?: Role } | null)?.role !== 'superadmin'

/** Editors can touch everything; employees only documents they authored. */
export const authorOrEditors =
  (field = 'author'): Access =>
  ({ req }) => {
    if (!req.user) return false
    if (isEditorReq(req)) return true
    return { [field]: { equals: req.user.id } }
  }
