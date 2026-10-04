'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { moduleFlags, slugifyProgram, type Character } from '@/lib/module-flags'

export function ProgramLauncher({
  character,
  program,
  index,
  destination,
  onActivate,
  showMode = false,
  photoUrl,
  fallbackPhoto,
}: {
  character: Character
  program: string
  index: number
  destination?: string
  onActivate?: (el: HTMLElement) => void
  showMode?: boolean
  photoUrl?: string
  fallbackPhoto?: string
}) {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const slug = slugifyProgram(program)
  const enabled = moduleFlags[character].enabled && moduleFlags[character].programs[slug] !== false
  const visiblePhoto = photoFailed ? fallbackPhoto : photoUrl

  useEffect(() => {
    setPhotoFailed(false)
  }, [photoUrl])

  function openProgram(e: React.MouseEvent<HTMLButtonElement>) {
    if (showMode || !enabled || launching) return
    setLaunching(true)
    onActivate?.(e.currentTarget)
    window.setTimeout(() => router.push(destination ?? `/${character}/${slug}`), 1200)
  }

  return (
    <button
      type="button"
      data-index={index}
      className={`program-card program-card-button${launching ? ' is-launching' : ''}${showMode ? ' is-show-card' : ''}`}
      onClick={openProgram}
      disabled={!enabled || launching || showMode}
      aria-label={showMode ? program : `Abrir ${program}`}
    >
      <span className="program-card-photo" aria-hidden="true">
        {visiblePhoto ? (
          <img
            src={visiblePhoto}
            alt=""
            loading={showMode ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => {
              if (!photoFailed && fallbackPhoto) setPhotoFailed(true)
            }}
          />
        ) : null}
      </span>
    </button>
  )
}
