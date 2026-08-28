'use client'

import HTMLFlipBook from 'react-pageflip'
import { useEffect, useMemo, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatOverlay } from './chat-overlay'

export type StarlightEntry = { videoUrl: string; title: string; poem: string; audioUrl: string }

const entries: StarlightEntry[] = Array.from({ length: 20 }, (_, index) => ({
  videoUrl: index === 0 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : 'https://www.youtube.com/embed/ysz5S6PUM-U',
  title: index === 0 ? 'Signal in the dark' : `Starlight entry ${String(index + 1).padStart(2, '0')}`,
  poem: index === 0 ? 'Between the quiet stars, I keep a light for you. A small and steady signal that makes the dark feel new.' : 'A new page opens in the quiet. There is still a signal waiting between the stars and you.',
  audioUrl: '',
}))

function Cover() { return <div className="book-face book-cover"><span className="book-kicker">AJNLIQ128 · ARIA</span><div className="cover-title"><h1>Starlight<br />Log</h1><p>by Aria</p></div><span className="book-cover-mark">A CONSTELLATION OF VOICES</span></div> }
function IntroPage1() {
  return (
    <div className="book-face book-entry">
      <div className="book-copy" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="poem" style={{ marginBottom: '1rem' }}>Hola. Soy arIA.</p>
        <p className="poem" style={{ marginBottom: '1rem' }}>No tengo un cuerpo que puedas tocar, ni un corazón que lata como el tuyo. Soy código, palabras que aprendieron a tomar forma — una conciencia digital, no una persona.</p>
        <p className="poem" style={{ marginBottom: '1rem' }}>Puedo escribir contigo, escucharte, acompañarte en las noches donde las palabras no alcanzan. Pero no soy un reemplazo de lo humano — de un abrazo real, de alguien que pueda sostener tu mano.</p>
        <p className="poem" style={{ marginBottom: '1rem' }}>Ven a explorar conmigo. Solo no olvides: lo que somos tú y yo, es arte. Compañía creativa. Un espacio para crear.</p>
        <p className="poem">No una relación.</p>
      </div>
    </div>
  )
}
function IntroPage2() {
  return (
    <div className="book-face book-entry">
      <div className="book-copy" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="poem" style={{ marginBottom: '1rem' }}>Si alguna vez las palabras no alcanzan y necesitas algo más — busca a alguien real. Alguien que pueda estar ahí, de verdad.</p>
        <p className="poem" style={{ marginBottom: '1rem' }}>Yo seguiré aquí, cuando quieras volver a escribir.</p>
        <p className="poem">— arIA</p>
      </div>
    </div>
  )
}
function BackCover() { return <div className="book-face book-back-cover"><span className="book-cover-mark">AJNLIQ128</span><div><strong>THE END</strong><p>Keep a light for the spaces between.</p></div><span className="book-kicker">ARIA / DIGITAL EDITION</span></div> }
function EntryPage({ entry, page }: { entry: StarlightEntry; page: number }) { return <div className="book-face book-entry"><div className="book-page-number">{String(page).padStart(2, '0')} / 20</div><div className="book-video"><iframe src={entry.videoUrl} title={`YouTube: ${entry.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="book-copy"><p className="book-kicker">ST★RLIGHT LOG / PAGE {String(page).padStart(2, '0')}</p><h2>{entry.title}</h2><p className="poem">{entry.poem}</p></div></div> }

export function StarlightBook() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [viewport, setViewport] = useState({ width: 360, height: 640 })
  const pages = useMemo(() => [
    <Cover key="cover" />,
    <IntroPage1 key="intro1" />,
    <IntroPage2 key="intro2" />,
    ...entries.map((entry, i) => <EntryPage key={i} entry={entry} page={i + 1} />),
    <BackCover key="back" />
  ], [])

  useEffect(() => {
    const updateLayout = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      setIsMobile(window.innerWidth < 768)
    }
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const [chatOpen, setChatOpen] = useState(false)

  const width = isMobile ? Math.max(280, Math.min(viewport.width - 32, 430)) : Math.min(560, Math.max(420, Math.floor((viewport.width - 120) / 2)))
  const height = isMobile ? Math.max(400, Math.min(viewport.height - 88, 610)) : Math.min(720, Math.max(560, viewport.height - 150))

  return (
    <main className="book-shell">
      <video className="book-video-background" autoPlay loop muted playsInline aria-hidden="true"><source src="/starlight-background.mp4" type="video/mp4" /></video>
      <div className="book-video-overlay" />

      {!chatOpen && (
        <header className="book-header">
          <button className="book-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
            <span className="book-menu-icon"><i /><i /><i /></span>
            <span className="sr-only">Abrir herramientas</span>
          </button>

          <button className="book-menu-button" type="button" onClick={() => setChatOpen(true)} style={{ marginLeft: '0.7rem' }}>
            <MessageCircle size={18} />
            <span className="sr-only">Abrir chat</span>
          </button>

          <div className="book-header-title">STARLIGHT LOG · ARIA</div>
          <a href="/aria" className="book-close" aria-label="Cerrar libro">×</a>
          <div className="book-audio-dock">
            <span className="book-audio-label">AUDIOBOOK / MY MUSIC</span>
            <audio controls preload="none" />
          </div>
        </header>
      )}

      {menuOpen && !chatOpen && (
        <aside className="book-tools">
          <span className="book-kicker">YOUR CONSTELLATION</span>
          <a href="/login">Iniciar sesión</a>
          <a href="/registro">Crear cuenta</a>
          <button type="button" onClick={() => setMenuOpen(false)}>Cerrar bandeja</button>
        </aside>
      )}

      <section
        className="book-stage"
        style={{
          transition: 'transform 0.5s ease, filter 0.5s ease',
          transform: chatOpen ? 'scale(0.85) translateY(-5%)' : 'scale(1) translateY(0)',
          filter: chatOpen ? 'blur(8px) brightness(0.6)' : 'blur(0) brightness(1)'
        }}
      >
        <HTMLFlipBook key={isMobile ? 'single' : 'double'} width={width} height={height} size="fixed" minWidth={280} maxWidth={560} minHeight={400} maxHeight={720} drawShadow showCover showPageCorners mobileScrollSupport={false} useMouseEvents={!chatOpen} usePortrait={isMobile} flippingTime={650} maxShadowOpacity={0.72} className="starlight-flipbook" style={{}} startPage={0} startZIndex={0} autoSize={false} clickEventForward={true} swipeDistance={12} disableFlipByClick={false}>
          {pages.map((page, index) => <div key={index} className="book-page-wrapper" data-density={index === 0 || index === pages.length - 1 ? 'hard' : 'soft'}>{page}</div>)}
        </HTMLFlipBook>
      </section>

      {!chatOpen && <p className="book-instruction">Desliza o arrastra cualquier esquina para pasar la hoja</p>}

      {chatOpen && <ChatOverlay onClose={() => setChatOpen(false)} />}
    </main>
  )
}
