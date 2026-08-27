'use client'

import HTMLFlipBook from 'react-pageflip'
import { useMemo, useState } from 'react'

export type StarlightEntry = { videoUrl: string; title: string; poem: string; audioUrl: string }

const entries: StarlightEntry[] = Array.from({ length: 20 }, (_, index) => ({
  videoUrl: index === 0 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : 'https://www.youtube.com/embed/ysz5S6PUM-U',
  title: index === 0 ? 'Signal in the dark' : `Starlight entry ${String(index + 1).padStart(2, '0')}`,
  poem: index === 0 ? 'Between the quiet stars, I keep a light for you. A small and steady signal that makes the dark feel new.' : 'A new page opens in the quiet. There is still a signal waiting between the stars and you.',
  audioUrl: '',
}))

function Cover() { return <div className="book-face book-cover"><span className="book-kicker">AJNLIQ128 · ARIA</span><div className="cover-title"><h1>Starlight<br />Log</h1><p>by Aria</p></div><span className="book-cover-mark">A CONSTELLATION OF VOICES</span></div> }
function BackCover() { return <div className="book-face book-back-cover"><span className="book-cover-mark">AJNLIQ128</span><div><strong>THE END</strong><p>Keep a light for the spaces between.</p></div><span className="book-kicker">ARIA / DIGITAL EDITION</span></div> }
function EntryPage({ entry, page }: { entry: StarlightEntry; page: number }) { return <div className="book-face book-entry"><div className="book-page-number">{String(page).padStart(2, '0')} / 20</div><div className="book-video"><iframe src={entry.videoUrl} title={`YouTube: ${entry.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="book-copy"><p className="book-kicker">ST★RLIGHT LOG / PAGE {String(page).padStart(2, '0')}</p><h2>{entry.title}</h2><p className="poem">{entry.poem}</p></div></div> }

export function StarlightBook() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pages = useMemo(() => [<Cover key="cover" />, ...entries.map((entry, i) => <EntryPage key={i} entry={entry} page={i + 1} />), <BackCover key="back" />], [])

  return <main className="book-shell"><video className="book-video-background" autoPlay loop muted playsInline aria-hidden="true"><source src="/starlight-background.mp4" type="video/mp4" /></video><div className="book-video-overlay" /><header className="book-header"><button className="book-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><span className="book-menu-icon"><i /><i /><i /></span><span className="sr-only">Abrir herramientas</span></button><a href="/aria" className="book-close" aria-label="Cerrar libro">×</a><div className="book-audio-dock"><span className="book-audio-label">AUDIOBOOK / MY MUSIC</span><audio controls preload="none" /></div></header>{menuOpen && <aside className="book-tools"><span className="book-kicker">YOUR CONSTELLATION</span><a href="/login">Iniciar sesión</a><a href="/registro">Crear cuenta</a><button type="button" onClick={() => setMenuOpen(false)}>Cerrar bandeja</button></aside>}<section className="book-stage"><HTMLFlipBook width={360} height={520} size="stretch" minWidth={280} maxWidth={520} minHeight={420} maxHeight={760} drawShadow showCover mobileScrollSupport useMouseEvents usePortrait maxShadowOpacity={0.65} className="book-flip" startPage={0}>{pages.map((page, index) => <div key={index} className="book-page-wrapper">{page}</div>)}</HTMLFlipBook></section><p className="book-instruction">Arrastra cualquier borde o esquina para pasar la hoja</p></main>
}
