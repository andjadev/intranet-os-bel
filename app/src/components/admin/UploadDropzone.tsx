'use client'

import { useBulkUpload, useModal, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const LABELS = {
  rs: { images: '+ Dodaj slike', files: '+ Dodaj fajlove', hint: 'Prevucite ovde ili kliknite. Može više odjednom; u prozoru koji se otvori kliknite Sačuvaj.' },
  en: { images: '+ Add photos', files: '+ Add files', hint: 'Drop them here or click. Several at once is fine; then click Save in the panel that opens.' },
  de: { images: '+ Bilder hinzufügen', files: '+ Dateien hinzufügen', hint: 'Hierher ziehen oder klicken. Mehrere auf einmal möglich; dann im Fenster auf Speichern klicken.' },
}

/** Above the media and documents lists: a large drop area that opens Payload's bulk upload with the chosen files. */
export function UploadDropzone({ collectionSlug, accept }: { collectionSlug: string; accept?: string }) {
  const { i18n } = useTranslation()
  const l = LABELS[i18n.language as keyof typeof LABELS] ?? LABELS.rs
  const { drawerSlug, setCollectionSlug, setInitialFiles, setOnSuccess } = useBulkUpload()
  const { openModal } = useModal()
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const start = (files: FileList | null) => {
    if (!files?.length) return
    // Copy: the input's own FileList empties when the input is reset for the next pick.
    const copy = new DataTransfer()
    for (const f of Array.from(files)) copy.items.add(f)
    setCollectionSlug(collectionSlug)
    setInitialFiles(copy.files)
    setOnSuccess(() => router.refresh())
    openModal(drawerSlug)
  }

  return (
    <button
      type="button"
      className={`osbel-dropzone${over ? ' over' : ''}`}
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        start(e.dataTransfer.files)
      }}
    >
      <span className="osbel-dropzone-title">{accept === 'image/*' ? l.images : l.files}</span>
      <span className="osbel-dropzone-hint">{l.hint}</span>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={(e) => {
          start(e.target.files)
          e.target.value = ''
        }}
      />
    </button>
  )
}

export const MediaDropzone = () => <UploadDropzone collectionSlug="media" accept="image/*" />
export const DocumentsDropzone = () => <UploadDropzone collectionSlug="documents" />
