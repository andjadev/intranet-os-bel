import React from 'react'

// Links from the Payload admin back to the portal home page.
const LABELS: Record<string, string> = {
  rs: 'Početna intraneta',
  en: 'Intranet home',
  de: 'Intranet-Startseite',
}

type Props = { i18n?: { language?: string } }

const labelFor = ({ i18n }: Props) => LABELS[i18n?.language ?? 'rs'] ?? LABELS.rs

/** Top of the left navigation. */
export function BackToIntranetNav(props: Props) {
  return (
    <a className="nav__link osbel-home-link" href="/">
      <span className="nav__link-label">← {labelFor(props)}</span>
    </a>
  )
}

/** Header, next to the account button – visible even when the navigation is collapsed. */
export function BackToIntranetAction(props: Props) {
  return (
    <a className="osbel-home-action" href="/">
      ← {labelFor(props)}
    </a>
  )
}
