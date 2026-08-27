'use client'

import { useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

export type StarlightEntry = {
  videoUrl: string
  title: string
  poem: string
  audioUrl: string
}

const baseEntries: StarlightEntry[] = [
  { videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Signal in the dark', poem: 'Between the quiet stars,\nI keep a light for you.\nA small and steady signal\nthat makes the dark feel new.', audioUrl: '' },
  { videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U', title: 'Orbiting home', poem: 'I learned the shape of distance\nby tracing every blue.\nThe universe keeps turning,\nbut every road finds you.', audioUrl: '' },
]

export const starlightEntries: StarlightEntry[] = Array.from({ length: 20 }, (_, index) => ({
  ...baseEntries[index % baseEntries.length],
  title: index < 2 ? baseEntries[index].title : `Starlight entry ${String(index + 1).padStart(2, '0')}`,
  poem: index < 2 ? baseEntries[index].poem : `A new page opens in the quiet.\nThere is still a signal waiting\nbetween the stars and you.`,
}))

function MenuIcon() { return <span className="book-menu-icon" aria-hidden="true"><i /><i /><i /></span> }

function Cover() { return <article className="book-page book-cover"><span className="book-kicker">ARIA / DIGITAL EDITION</span><div className="cover-center"><h1>Starlight<br />Log</h1><p>by Aria</p></div><span className="book-cover-mark">AJNLIQ128</span></article> }

function BackCover() { return <article className="book-page book-back-cover"><span className="book-cover-mark">AJNLIQ128</span><div><strong>THE END</strong><p>Keep a light for the spaces between.</p></div><span className="book-kicker">ARIA / DIGITAL EDITION</span></article> }

function EntryPage({ entry, index }: { entry: StarlightEntry; index: number }) {
  return <article className="book-page book-entry"><div className="book-page-number">{String(index + 1).padStart(2, '0')} / 20</div><div className="book-video"><iframe src={entry.videoUrl} title={`YouTube: ${entry.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="book-copy"><p className="book-kicker">ST★RLIGHT LOG / PAGE {String(index + 1).padStart(2, '0')}</p><h2>{entry.title}</h2><p className="poem">{entry.poem}</p>{entry.audioUrl && <audio className="book-audio" controls preload="none" src={entry.audioUrl} />}</div></article>
}

export function StarlightBook() {
  const bookRef = useRef<unknown>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [bookSize, setBookSize] = useState({ width: 430, height: 600 })

  useEffect(() => {
    const updateBookSize = () => {
      const compact = window.innerWidth <= 600
      const width = compact ? Math.max(260, Math.min(window.innerWidth - 32, 360)) : 430
      const height = compact ? Math.max(360, Math.min(window.innerHeight - 148, width * 1.42)) : 600
      setBookSize({ width, height })
    }
    updateBookSize()
    window.addEventListener('resize', updateBookSize)
    return () => window.removeEventListener('resize', updateBookSize)
  }, [])

  return <main className="book-shell">
    <header className="book-header">
      <button className="book-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="book-tools"><MenuIcon /><span className="sr-only">Abrir herramientas</span></button>
      <a href="/aria" className="book-back">← ARIA</a>
      <div className="book-audio-dock"><span className="book-audio-label">AUDIOBOOK / MY MUSIC</span><audio controls preload="none" /></div>
      <span className="book-header-title">ST★RLIGHT LOG · 22 HOJAS</span>
    </header>
    {menuOpen && <aside id="book-tools" className="book-tools" aria-label="Herramientas del libro"><span className="book-kicker">YOUR CONSTELLATION</span><a href="/login">Iniciar sesión</a><a href="/registro">Crear cuenta</a><button type="button" onClick={() => setMenuOpen(false)}>Cerrar bandeja</button></aside>}
    <section className="book-stage"><HTMLFlipBook ref={bookRef} width={bookSize.width} height={bookSize.height} size="stretch" minWidth={260} maxWidth={520} minHeight={360} maxHeight={700} showCover mobileScrollSupport useMouseEvents className="starlight-flipbook" style={{ margin: '0 auto' }} startPage={currentPage} drawShadow flippingTime={720} usePortrait startZIndex={0} autoSize={false} maxShadowOpacity={0.32} showPageCorners disableFlipByClick={false} onFlip={(event) => setCurrentPage(event.data)}>{[<Cover key="cover" />, ...starlightEntries.map((entry, index) => <EntryPage key={`${entry.title}-${index}`} entry={entry} index={index} />), <BackCover key="back-cover" />]}</HTMLFlipBook></section>
    <p className="book-instruction">Desliza a la derecha o izquierda para cambiar de hoja · arrastra con el ratón en PC</p>
  </main>
}
