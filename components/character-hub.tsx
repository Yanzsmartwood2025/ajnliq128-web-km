'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FlameMark, Wordmark } from './galaxy-background'
import { ProgramLauncher } from './program-launcher'
import { mediaUrl } from '@/lib/media-urls'
import { slugifyProgram } from '@/lib/module-flags'

const programs = {
  aria: ['Aria\'s Anthem', 'Synthetic Soul', 'Starlight Log', 'Code & Conscience', 'Real World Quests', 'Lyrical Resonance'],
  joziel: ['Midnight Mantras', 'Dark Siren', 'Night Strategy', 'Sonic Autopsy', 'Shadow Files', "Joziel's Grimoire"],
}

const placeholderVideoUrl = 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-night-city-1573/1080p.mp4'

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
    ? mediaUrl(`${character}/programas/${programSlug}/fondo.mp4`)
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

export function CharacterHub({ character }: { character: 'aria' | 'joziel' }) {
  const isAria = character === 'aria'
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [focusedProgramSlug, setFocusedProgramSlug] = useState<string | null>(null)
  const [bgImageError, setBgImageError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const backgrounds = ['/placeholder-01.png', '/placeholder-02.png', '/placeholder-03.png', '/placeholder-04.png', '/placeholder-05.png']

  useEffect(() => {
    setBgImageError(false)
  }, [focusedProgramSlug])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const observer = new IntersectionObserver((entries) => {
      // Find the card that is closest to the center (has the highest intersection ratio)
      // or simply the one that is intersecting our center-line rootMargin.
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'))
          if (!isNaN(idx)) {
            const programName = programs[character][idx]
            if (programName) {
              setFocusedProgramSlug(slugifyProgram(programName))
            }
            setBackgroundIndex(prev => {
              const nextIndex = idx % backgrounds.length
              return prev === nextIndex ? prev : nextIndex
            })
          }
        }
      })
    }, {
      root: grid,
      rootMargin: '0px -49% 0px -49%',
      threshold: 0
    })

    const cards = grid.querySelectorAll('.program-card')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [backgrounds.length])

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

  const name = isAria ? 'ARIA' : 'JOZIEL'
  const backgroundImage = focusedProgramSlug && !bgImageError
    ? `url(${mediaUrl(`${character}/programas/${focusedProgramSlug}/fondo.png`)})`
    : `url(${backgrounds[backgroundIndex]})`;

  return (
    <main className={`hub hub-with-video hub-${character}`}>
      <div
        className="hub-placeholder-bg"
        aria-hidden="true"
        style={{ backgroundImage }}
        // Note: we can't easily catch background-image load errors on a div directly in React without an Image object.
        // For now, if R2 fails, it might just show a broken bg or transparent depending on browser.
        // A better robust way is an invisible <img> but since it's an interim state, this might suffice.
      />
      {/* Hidden image to trigger onError for background fallback */}
      {focusedProgramSlug && !bgImageError && (
        <img
          src={mediaUrl(`${character}/programas/${focusedProgramSlug}/fondo.png`)}
          style={{ display: 'none' }}
          onError={() => setBgImageError(true)}
          alt=""
        />
      )}
      <LazyHubVideo character={character} programSlug={focusedProgramSlug} />
      <div className="hub-video-wash" aria-hidden="true" />
      <header className="hub-header">
        <Link href="/" className="back-link"><FlameMark /> <span>FUEGO</span></Link>
        <div className="hub-actions">
          <button type="button" className="options-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir opciones">▣</button>
          <span className="hub-index">{isAria ? '01' : '02'} / 02</span>
        </div>
      </header>
      {menuOpen && <aside className="hub-menu" aria-label="Opciones"><Link href="/">Regresar a FUEGO</Link><Link href="/login">Iniciar sesión</Link><button type="button" onClick={() => setMenuOpen(false)}>Cerrar</button></aside>}
      <section className="hub-intro"><Wordmark name={name} /></section>
      <div className="program-grid" ref={gridRef}>
        {programs[character].map((program, index) => (
          <ProgramLauncher
            character={character}
            program={program}
            index={index}
            key={program}
            destination={isAria && program === 'Starlight Log' ? '/aria/starlight-log' : undefined}
            onActivate={(el) => changeBackgroundAndCenter(index, el)}
          />
        ))}
      </div>
    </main>
  )
}
