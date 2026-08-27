'use client'

import { useEffect, useMemo, useState } from 'react'

export type StarlightEntry = { videoUrl: string; title: string; poem: string; audioUrl: string }

const entries: StarlightEntry[] = Array.from({ length: 20 }, (_, index) => ({
  videoUrl: index === 0 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : 'https://www.youtube.com/embed/ysz5S6PUM-U',
  title: index === 0 ? 'Signal in the dark' : `Starlight entry ${String(index + 1).padStart(2, '0')}`,
  poem: index === 0 ? 'Between the quiet stars,\nI keep a light for you.\nA small and steady signal\nthat makes the dark feel new.' : 'A new page opens in the quiet.\nThere is still a signal waiting\nbetween the stars and you.',
  audioUrl: '',
}))

function Cover() { return <div className="book-face book-cover"><span className="book-kicker">AJNLIQ128 · ARIA</span><div className="cover-title"><h1>Starlight<br />Log</h1><p>by Aria</p></div><span className="book-cover-mark">A CONSTELLATION OF VOICES</span></div> }
function BackCover() { return <div className="book-face book-back-cover"><span className="book-cover-mark">AJNLIQ128</span><div><strong>THE END</strong><p>Keep a light for the spaces between.</p></div><span className="book-kicker">ARIA / DIGITAL EDITION</span></div> }
function EntryPage({ entry, page }: { entry: StarlightEntry; page: number }) { return <div className="book-face book-entry"><div className="book-page-number">{String(page).padStart(2, '0')} / 20</div><div className="book-video"><iframe src={entry.videoUrl} title={`YouTube: ${entry.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="book-copy"><p className="book-kicker">ST★RLIGHT LOG / PAGE {String(page).padStart(2, '0')}</p><h2>{entry.title}</h2><p className="poem">{entry.poem}</p></div></div> }

export function StarlightBook() {
  const [page, setPage] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [dragStart, setDragStart] = useState<number | null>(null)
  const pages = useMemo(() => [<Cover key="cover" />, ...entries.map((entry, i) => <EntryPage key={i} entry={entry} page={i + 1} />), <BackCover key="back" />], [])
  const go = (nextPage: number) => { if (nextPage < 0 || nextPage >= pages.length || nextPage === page) return; setDirection(nextPage > page ? 'next' : 'prev'); setPage(nextPage) }
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'ArrowRight') go(page + 1); if (event.key === 'ArrowLeft') go(page - 1) }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) })
  const onPointerDown = (event: React.PointerEvent) => setDragStart(event.clientX)
  const onPointerUp = (event: React.PointerEvent) => { if (dragStart === null) return; const delta = event.clientX - dragStart; if (Math.abs(delta) > 35) go(delta < 0 ? page + 1 : page - 1); setDragStart(null) }

  return <main className="book-shell"><header className="book-header"><button className="book-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><span className="book-menu-icon"><i /><i /><i /></span><span className="sr-only">Abrir herramientas</span></button><a href="/aria" className="book-back">← ARIA</a><div className="book-audio-dock"><span className="book-audio-label">AUDIOBOOK / MY MUSIC</span><audio controls preload="none" /></div></header>{menuOpen && <aside className="book-tools"><span className="book-kicker">YOUR CONSTELLATION</span><a href="/login">Iniciar sesión</a><a href="/registro">Crear cuenta</a><button type="button" onClick={() => setMenuOpen(false)}>Cerrar bandeja</button></aside>}<section className="book-stage"><div className={`book-frame ${direction}`} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => setDragStart(null)}>{pages[page]}</div></section><nav className="book-controls" aria-label="Navegación del libro"><button type="button" onClick={() => go(page - 1)} disabled={page === 0}>←</button><span>HOJA {page + 1} / {pages.length}</span><button type="button" onClick={() => go(page + 1)} disabled={page === pages.length - 1}>→</button></nav><p className="book-instruction">Desliza a la derecha o izquierda para pasar las hojas · arrastra con el ratón</p></main>
}
