'use client'

import { useEffect } from 'react'

type CharacterAssetPreloaderProps = {
  critical: readonly string[]
  deferred?: readonly string[]
  onCriticalReady?: () => void
}

function preloadImage(src: string, priority: 'high' | 'auto' = 'auto') {
  return new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    try {
      image.fetchPriority = priority
    } catch {}

    const finish = () => resolve()
    image.onload = finish
    image.onerror = finish
    image.src = src

    if (image.complete) finish()
  })
}

export function CharacterAssetPreloader({
  critical,
  deferred = [],
  onCriticalReady,
}: CharacterAssetPreloaderProps) {
  useEffect(() => {
    let cancelled = false
    let idleHandle: number | null = null
    let timeoutHandle: number | null = null

    Promise.allSettled(critical.map((src) => preloadImage(src, 'high'))).then(() => {
      if (!cancelled) onCriticalReady?.()
    })

    const loadDeferred = () => {
      if (cancelled) return
      deferred.forEach((src) => {
        void preloadImage(src)
      })
    }

    const requestIdle = (window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    }).requestIdleCallback

    if (requestIdle) {
      idleHandle = requestIdle(loadDeferred, { timeout: 1800 })
    } else {
      timeoutHandle = window.setTimeout(loadDeferred, 450)
    }

    return () => {
      cancelled = true
      if (idleHandle !== null) {
        const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
        cancelIdle?.(idleHandle)
      }
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle)
    }
  }, [critical, deferred, onCriticalReady])

  return null
}
