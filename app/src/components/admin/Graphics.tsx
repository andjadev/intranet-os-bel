import React from 'react'

// Company marks in the Payload admin instead of the Payload logo.

/** Top of the admin; links to the admin home (dashboard). */
export function AdminIcon() {
  return <img src="/logos/site-icon.png" alt="OSBEL admin" width={30} height={30} style={{ display: 'block' }} />
}

/** Admin login screen. */
export function AdminLogo() {
  return <img src="/logos/os-logo-dark.svg" alt="Optimal Systems" style={{ display: 'block', width: 220, maxWidth: '100%' }} />
}
