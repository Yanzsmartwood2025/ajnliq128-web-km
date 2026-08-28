'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FlameMark, Wordmark } from './galaxy-background'
import { ProgramLauncher } from './program-launcher'

const programs = {
  aria: ['Aria\'s Anthem', 'Synthetic Soul', 'Starlight Log', 'Code & Conscience', 'Real World Quests', 'Lyrical Resonance'],
  joziel: ['Midnight Mantras', 'Dark Siren', 'Night Strategy', 'Sonic Autopsy', 'Shadow Files', "Joziel's Grimoire"],
}

const videoUrl = 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-night-city-1573/1080p.mp4'

function LazyHubVideo({ character }: { character: 'aria' | 'joziel' }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const poster = character === 'aria' ? '/aria-card.png' : '/joziel-card.png'

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

  return (
    <video ref={videoRef} className="hub-video" autoPlay={shouldLoad} muted loop playsInline preload="none" poster={poster} aria-hidden="true">
      {shouldLoad ? <source src={videoUrl} type="video/mp4" /> : null}
    </video>
  )
}

export function CharacterHub({ character }: { character: 'aria' | 'joziel' }) {
  const isAria = character === 'aria'
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const backgrounds = ['/placeholder-01.png', '/placeholder-02.png', '/placeholder-03.png', '/placeholder-04.png', '/placeholder-05.png']
  const changeBackground = () => setBackgroundIndex((index) => (index + 1) % backgrounds.length)
  const name = isAria ? 'ARIA' : 'JOZIEL'
  return (
    <main className={`hub hub-with-video hub-${character}`}>
      <div className="hub-placeholder-bg" aria-hidden="true" style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }} />
      <LazyHubVideo character={character} />
      <div className="hub-video-wash" aria-hidden="true" />
      <header className="hub-header">
        <Link href="/" className="back-link"><FlameMark /> <span>FUEGO</span></Link>
        <div className="hub-actions">
          <button type="button" className="options-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir opciones">◌</button>
          <span className="hub-index">{isAria ? '01' : '02'} / 02</span>
        </div>
      </header>
      {menuOpen && <aside className="hub-menu" aria-label="Opciones"><Link href="/">Regresar a FUEGO</Link><Link href="/login">Iniciar sesión</Link><button type="button" onClick={() => setMenuOpen(false)}>Cerrar</button></aside>}
      <section className="hub-intro"><p className="eyebrow">FUEGO / MODULE {isAria ? '01' : '02'}</p><Wordmark name={name} /><p className="hub-description">{isAria ? 'A synthetic heart exploring the space between code, conscience, and feeling.' : 'A midnight mind for the strange hours, the sharp questions, and the beautiful unknown.'}</p></section>
      <div className="program-grid">{programs[character].map((program, index) => <ProgramLauncher character={character} program={program} index={index} key={program} destination={isAria && program === 'Starlight Log' ? '/aria/starlight-log' : undefined} onActivate={changeBackground} />)}</div>
    </main>
  )
}
