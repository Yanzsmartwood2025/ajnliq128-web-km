'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ProgramLauncher } from './program-launcher'
import { slugifyProgram } from '@/lib/module-flags'

const programs = {
  aria: ['Aria\'s Anthem', 'Synthetic Soul', 'Starlight Log', 'Code & Conscience', 'Real World Quests', 'Lyrical Resonance', 'arIA'],
  joziel: ['Midnight Mantras', 'Dark Siren', 'Night Strategy', 'Sonic Autopsy', 'Shadow Files', "Joziel's Grimoire", 'Lumenfall'],
}

const programCardImages: Record<'aria' | 'joziel', Record<string, string>> = {
  aria: {
    'arias-anthem': '/assets/characters/aria/cards/arias-anthem.jpg',
    'synthetic-soul': '/assets/characters/aria/cards/synthetic-soul.jpg',
    'starlight-log': '/assets/characters/aria/cards/starlight-log.jpg',
    'code-and-conscience': '/assets/characters/aria/cards/code-and-conscience.jpg',
    'real-world-quests': '/assets/characters/aria/cards/real-world-quests.jpg',
    'lyrical-resonance': '/assets/characters/aria/cards/lyrical-resonance.jpg',
    aria: '/assets/characters/aria/cards/aria-main.jpg',
  },
  joziel: {
    'midnight-mantras': '/assets/characters/joziel/cards/midnight-mantras.jpg',
    'dark-siren': '/assets/characters/joziel/cards/dark-siren.jpg',
    'night-strategy': '/assets/characters/joziel/cards/night-strategy.png',
    'sonic-autopsy': '/assets/characters/joziel/cards/sonic-autopsy.jpg',
    'shadow-files': '/assets/characters/joziel/cards/shadow-files.jpg',
    'joziels-grimoire': '/assets/characters/joziel/cards/joziels-grimoire.jpg',
    lumenfall: '/assets/characters/joziel/cards/lumenfall.jpg',
  },
}

const characterBackgrounds: Record<'aria' | 'joziel', string[]> = {
  aria: [
    '/assets/characters/aria/carousel/01-noir-rain-portrait.jpg',
    '/assets/characters/aria/carousel/02-noir-rain-standing.jpg',
    '/assets/characters/aria/carousel/03-noir-window-closeup.jpg',
    '/assets/characters/aria/carousel/04-purple-braid-train-window.jpg',
    '/assets/characters/aria/carousel/05-lavender-braid-train.jpg',
    '/assets/characters/aria/carousel/06-lavender-sunset-mountains.jpg',
    '/assets/characters/aria/carousel/07-cyber-noir-led-city.jpg',
    '/assets/characters/aria/carousel/08-silver-cyber-grid-seated.jpg',
    '/assets/characters/aria/carousel/09-silver-cyber-grid-standing.jpg',
  ],
  joziel: [
    '/assets/characters/joziel/carousel/01-tattooed-studio-portrait.jpg',
    '/assets/characters/joziel/carousel/02-rainy-forest-crouch.jpg',
    '/assets/characters/joziel/carousel/03-moonlit-hooded-walk.jpg',
    '/assets/characters/joziel/carousel/04-snowy-window-seat.jpg',
    '/assets/characters/joziel/carousel/05-graveyard-witch-walk.jpg',
    '/assets/characters/joziel/carousel/06-graveyard-witch-profile.jpg',
    '/assets/characters/joziel/carousel/07-moonlit-hooded-portrait.jpg',
    '/assets/characters/joziel/carousel/08-moonlit-hooded-closeup.jpg',
    '/assets/characters/joziel/carousel/09-graveyard-witch-fullbody.jpg',
    '/assets/characters/joziel/carousel/10-snowy-studio-window.jpg',
    '/assets/characters/joziel/carousel/11-empty-theater-leather-jacket.jpg',
    '/assets/characters/joziel/carousel/12-lumenfall-wordmark.jpg',
  ],
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
  const backgrounds = characterBackgrounds[character]
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBackgroundIndex(0)
  }, [character])

  useEffect(() => {
    if (backgrounds.length < 2) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % backgrounds.length)
    }, 5_000)

    return () => window.clearInterval(interval)
  }, [backgrounds.length, character])

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

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const distancePx = cardCenter - center
        const normalized = Math.max(-1.35, Math.min(1.35, distancePx / Math.max(1, gridRect.width * 0.52)))
        const absolute = Math.min(1, Math.abs(normalized))

        card.style.setProperty('--card-offset', normalized.toFixed(4))
        card.style.setProperty('--card-depth', absolute.toFixed(4))
        card.classList.toggle('is-swipe-focus', absolute < 0.22)
      })
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
  }, [character, showMode])

  const centerProgram = (el: HTMLElement) => {
    const grid = gridRef.current
    if (!grid) return

    const elRect = el.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const centerOffset = elRect.left - gridRect.left - (gridRect.width / 2) + (elRect.width / 2)
    grid.scrollBy({ left: centerOffset, behavior: 'smooth' })
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
  }, [character, onShowComplete, showDurationMs, showMode])

  const activeBackgroundUrl = backgrounds[backgroundIndex % backgrounds.length]
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

  const fallbackPhoto = isAria
    ? '/assets/characters/aria/cards/aria-main.jpg'
    : '/assets/characters/joziel/cards/lumenfall.jpg'

  return (
    <main className={`hub hub-with-video hub-${character}${showMode ? ' hub-show-tour' : ''}`}>
      <div
        className="hub-carousel-bg is-previous"
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.previous})` }}
      />
      <div
        key={`${backgroundLayers.version}:${backgroundLayers.current}`}
        className={`hub-carousel-bg is-current hub-bg-effect-${backgroundLayers.version % 3}`}
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.current})` }}
      />
      <div className="hub-video-wash" aria-hidden="true" />

      {!showMode && (
        <header className="hub-header hub-header-clean">
          <button
            type="button"
            className="fuego-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Abrir opciones"
          >
            <img src="/assets/home/fuego.png" alt="" aria-hidden="true" />
          </button>
        </header>
      )}

      {!showMode && menuOpen && (
        <>
          <button className="hub-menu-scrim" type="button" aria-label="Cerrar opciones" onClick={() => setMenuOpen(false)} />
          <aside className="hub-menu hub-menu-crystal" aria-label="Opciones">
            <div className="hub-menu-brand" aria-hidden="true">
              <img src="/assets/home/fuego.png" alt="" />
            </div>
            <Link href="/">Inicio</Link>
            <Link href={isAria ? '/joziel' : '/aria'}>{isAria ? 'Abrir JOZIEL' : 'Abrir ARIA'}</Link>
            <Link href="/?login=true">Iniciar sesión</Link>
            <button type="button" onClick={() => setMenuOpen(false)}>Cerrar</button>
          </aside>
        </>
      )}

      {showMode && <div className="show-camera-vignette" aria-hidden="true" />}

      <div className={`program-grid${showMode ? ' is-show-tour' : ''}`} ref={gridRef}>
        {programs[character].map((program, index) => {
          const slug = slugifyProgram(program)
          const photoUrl = programCardImages[character][slug] ?? fallbackPhoto

          return (
            <ProgramLauncher
              character={character}
              showMode={showMode}
              program={program}
              index={index}
              photoUrl={photoUrl}
              fallbackPhoto={fallbackPhoto}
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
              onActivate={centerProgram}
            />
          )
        })}
      </div>
    </main>
  )
}
