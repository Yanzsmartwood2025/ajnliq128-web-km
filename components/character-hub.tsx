'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FlameMark, Wordmark } from './galaxy-background'
import { ProgramLauncher } from './program-launcher'
import { mediaUrl } from '@/lib/media-urls'
import { slugifyProgram } from '@/lib/module-flags'

const programs = {
  aria: ['Aria\'s Anthem', 'Synthetic Soul', 'Starlight Log', 'Code & Conscience', 'Real World Quests', 'Lyrical Resonance', 'arIA'],
  joziel: ['Midnight Mantras', 'Dark Siren', 'Night Strategy', 'Sonic Autopsy', 'Shadow Files', "Joziel's Grimoire", 'Lumenfall'],
}

const placeholderVideoUrl = 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-night-city-1573/1080p.mp4'

function programMediaPath(
  character: 'aria' | 'joziel',
  programSlug: string,
  filename: 'fondo.mp4' | 'fondo.png' | 'tarjeta.webp',
) {
  if (character === 'aria' && programSlug === 'aria') return `aria/aria/ui/${filename}`
  if (character === 'joziel' && programSlug === 'lumenfall') return `joziel/lumenfall/ui/${filename}`
  return `${character}/programas/${programSlug}/${filename}`
}

function LazyHubVideo({ character, programSlug }: { character: 'aria' | 'joziel', programSlug: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [hasError, setHasError] = useState(false)
  const poster = character === 'aria' ? '/aria-card.png' : '/joziel-card.png'

  // When the program changes, reset error state so we attempt to load the new R2 video
  useEffect(() => {
    setHasError(false)
  }, [programSlug])

  useEffect(() => {
    const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
    if (reducedData) return
    const node = videoRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const videoUrl = programSlug && !hasError
    ? mediaUrl(programMediaPath(character, programSlug, 'fondo.mp4'))
    : placeholderVideoUrl;

  return (
    <video
      key={videoUrl} // Force re-render of video element when URL changes
      ref={videoRef}
      className="hub-video"
      autoPlay={shouldLoad}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      onError={() => {
        if (!hasError && programSlug) {
          setHasError(true);
        }
      }}
    >
      {shouldLoad ? <source src={videoUrl} type="video/mp4" onError={() => {
        if (!hasError && programSlug) {
          setHasError(true);
        }
      }} /> : null}
    </video>
  )
}

export function CharacterHub({
  character,
  showMode = false,
  showDurationMs = 54_000,
  onShowComplete,
}: {
  character: 'aria' | 'joziel'
  showMode?: boolean
  showDurationMs?: number
  onShowComplete?: () => void
}) {
  const isAria = character === 'aria'
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [focusedProgramSlug, setFocusedProgramSlug] = useState<string | null>(null)
  const [bgImageError, setBgImageError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const activeCardIndexRef = useRef(-1)
  const backgrounds = ['/placeholder-01.png', '/placeholder-02.png', '/placeholder-03.png', '/placeholder-04.png', '/placeholder-05.png']

  useEffect(() => {
    setBgImageError(false)
  }, [focusedProgramSlug])

  useEffect(() => {
    if (showMode) return
    const grid = gridRef.current
    if (!grid) return

    let frame = 0

    const updateDepth = () => {
      frame = 0
      const gridRect = grid.getBoundingClientRect()
      const center = gridRect.left + gridRect.width / 2
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('.program-card'))
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const distancePx = cardCenter - center
        const normalized = Math.max(-1.35, Math.min(1.35, distancePx / Math.max(1, gridRect.width * 0.52)))
        const absolute = Math.min(1, Math.abs(normalized))

        card.style.setProperty('--card-offset', normalized.toFixed(4))
        card.style.setProperty('--card-depth', absolute.toFixed(4))
        card.classList.toggle('is-swipe-focus', absolute < 0.22)

        const rawDistance = Math.abs(distancePx)
        if (rawDistance < closestDistance) {
          closestDistance = rawDistance
          closestIndex = index
        }
      })

      if (closestIndex !== activeCardIndexRef.current) {
        activeCardIndexRef.current = closestIndex
        const programName = programs[character][closestIndex]
        if (programName) setFocusedProgramSlug(slugifyProgram(programName))
        setBackgroundIndex(closestIndex % backgrounds.length)
      }
    }

    const requestDepthUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateDepth)
    }

    const startDrag = () => grid.classList.add('is-user-dragging')
    const stopDrag = () => {
      grid.classList.remove('is-user-dragging')
      requestDepthUpdate()
    }

    updateDepth()
    grid.addEventListener('scroll', requestDepthUpdate, { passive: true })
    grid.addEventListener('pointerdown', startDrag, { passive: true })
    grid.addEventListener('pointerup', stopDrag, { passive: true })
    grid.addEventListener('pointercancel', stopDrag, { passive: true })
    window.addEventListener('resize', requestDepthUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      grid.removeEventListener('scroll', requestDepthUpdate)
      grid.removeEventListener('pointerdown', startDrag)
      grid.removeEventListener('pointerup', stopDrag)
      grid.removeEventListener('pointercancel', stopDrag)
      window.removeEventListener('resize', requestDepthUpdate)
    }
  }, [backgrounds.length, character, showMode])

  const changeBackgroundAndCenter = (programIndex: number, el: HTMLElement) => {
    const programName = programs[character][programIndex]
    if (programName) {
      setFocusedProgramSlug(slugifyProgram(programName))
    }
    const nextIndex = programIndex % backgrounds.length
    setBackgroundIndex(prev => prev === nextIndex ? prev : nextIndex)

    // Smooth scroll to center the element
    const grid = gridRef.current
    if (grid) {
      const elRect = el.getBoundingClientRect()
      const gridRect = grid.getBoundingClientRect()
      const centerOffset = elRect.left - gridRect.left - (gridRect.width / 2) + (elRect.width / 2)
      grid.scrollBy({ left: centerOffset, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!showMode) return
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.program-card'))
    if (!cards.length) return

    const introHoldMs = 2_800
    const outroHoldMs = 4_200
    const usableMs = Math.max(28_000, showDurationMs - introHoldMs - outroHoldMs)
    const stepMs = Math.max(4_500, Math.floor(usableMs / cards.length))
    let index = 0
    let interval: number | null = null
    let finishTimer: number | null = null

    const focusCard = (nextIndex: number) => {
      const card = cards[nextIndex]
      if (!card) return
      cards.forEach((item, itemIndex) => {
        item.classList.toggle('is-show-focus', itemIndex === nextIndex)
      })

      const programName = programs[character][nextIndex]
      if (programName) setFocusedProgramSlug(slugifyProgram(programName))
      setBackgroundIndex(nextIndex % backgrounds.length)

      const left = card.offsetLeft - (grid.clientWidth - card.clientWidth) / 2
      grid.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }

    const firstTimer = window.setTimeout(() => {
      focusCard(0)
      interval = window.setInterval(() => {
        index += 1
        if (index >= cards.length) {
          if (interval) window.clearInterval(interval)
          interval = null
          return
        }
        focusCard(index)
      }, stepMs)
    }, introHoldMs)

    finishTimer = window.setTimeout(() => {
      cards.forEach((item) => item.classList.remove('is-show-focus'))
      onShowComplete?.()
    }, showDurationMs)

    return () => {
      window.clearTimeout(firstTimer)
      if (finishTimer) window.clearTimeout(finishTimer)
      if (interval) window.clearInterval(interval)
      cards.forEach((item) => item.classList.remove('is-show-focus'))
    }
  }, [backgrounds.length, character, onShowComplete, showDurationMs, showMode])


  const name = isAria ? 'ARIA' : 'JOZIEL'
  const activeBackgroundUrl = focusedProgramSlug && !bgImageError
    ? mediaUrl(programMediaPath(character, focusedProgramSlug, 'fondo.png'))
    : backgrounds[backgroundIndex]
  const [backgroundLayers, setBackgroundLayers] = useState({
    previous: backgrounds[0],
    current: backgrounds[0],
    version: 0,
  })

  useEffect(() => {
    setBackgroundLayers((layers) => {
      if (layers.current === activeBackgroundUrl) return layers
      return {
        previous: layers.current,
        current: activeBackgroundUrl,
        version: layers.version + 1,
      }
    })
  }, [activeBackgroundUrl])

  return (
    <main className={`hub hub-with-video hub-${character}${showMode ? ' hub-show-tour' : ''}`}>
      <div
        className="hub-carousel-bg is-previous"
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.previous})` }}
      />
      <div
        key={`${backgroundLayers.version}:${backgroundLayers.current}`}
        className="hub-carousel-bg is-current"
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.current})` }}
      />
      {/* Hidden image to trigger onError for background fallback */}
      {focusedProgramSlug && !bgImageError && (
        <img
          src={mediaUrl(programMediaPath(character, focusedProgramSlug, 'fondo.png'))}
          style={{ display: 'none' }}
          onError={() => setBgImageError(true)}
          alt=""
        />
      )}
      <LazyHubVideo character={character} programSlug={focusedProgramSlug} />
      <div className="hub-video-wash" aria-hidden="true" />
      {!showMode && <header className="hub-header">
        <Link href="/" className="back-link"><FlameMark /> <span>FUEGO</span></Link>
        <div className="hub-actions">
          <button type="button" className="options-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir opciones">▣</button>
          <span className="hub-index">{isAria ? '01' : '02'} / 02</span>
        </div>
      </header>}
      {!showMode && menuOpen && <aside className="hub-menu" aria-label="Opciones"><Link href="/">Regresar a FUEGO</Link><Link href="/login">Iniciar sesión</Link><button type="button" onClick={() => setMenuOpen(false)}>Cerrar</button></aside>}
      <section className="hub-intro"><Wordmark name={name} /></section>
      {showMode && <div className="show-camera-vignette" aria-hidden="true" />}
      <div className={`program-grid${showMode ? ' is-show-tour' : ''}`} ref={gridRef}>
        {programs[character].map((program, index) => (
          <ProgramLauncher
            character={character}
            showMode={showMode}
            program={program}
            index={index}
            photoUrl={mediaUrl(programMediaPath(character, slugifyProgram(program), 'tarjeta.webp'))}
            fallbackPhoto={isAria ? '/aria-card.png' : '/joziel-card.png'}
            key={program}
            destination={
              isAria && program === 'Starlight Log'
                ? '/aria/starlight-log'
                : isAria && program === 'arIA'
                  ? '/aria/aria'
                  : !isAria && program === 'Lumenfall'
                    ? '/joziel/lumenfall'
                    : undefined
            }
            onActivate={(el) => changeBackgroundAndCenter(index, el)}
          />
        ))}
      </div>
    </main>
  )
}
