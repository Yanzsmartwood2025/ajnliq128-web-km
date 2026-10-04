'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export function UserPhotoBridge() {
  const { user } = useAuth()

  useEffect(() => {
    const root = document.documentElement
    const photoUrl = user?.photoURL

    if (!photoUrl) {
      delete root.dataset.userPhoto
      root.style.removeProperty('--user-photo-url')
      return
    }

    const safeUrl = encodeURI(photoUrl).replace(/"/g, '%22')
    root.dataset.userPhoto = '1'
    root.style.setProperty('--user-photo-url', `url("${safeUrl}")`)

    return () => {
      delete root.dataset.userPhoto
      root.style.removeProperty('--user-photo-url')
    }
  }, [user?.photoURL])

  return (
    <style>{`
      html[data-user-photo='1'] .hub-menu [aria-live='polite'] > span:first-child {
        background-image: var(--user-photo-url) !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-size: cover !important;
        overflow: hidden !important;
      }
      html[data-user-photo='1'] .hub-menu [aria-live='polite'] > span:first-child > * {
        display: none !important;
      }
    `}</style>
  )
}
