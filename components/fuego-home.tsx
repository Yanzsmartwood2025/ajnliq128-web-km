'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FlameMark, Wordmark } from './galaxy-background'

const particles = Array.from({ length: 18 }, (_, index) => index)

export function FuegoHome() {
  const router = useRouter()
  const [splash, setSplash] = useState(true)
  const [selectedModule, setSelectedModule] = useState<'ARIA' | 'JOZIEL' | null>(null)
  const [naylaNotice, setNaylaNotice] = useState(false)
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const backgrounds = ['/placeholder-01.png', '/placeholder-02.png', '/placeholder-03.png', '/placeholder-04.png', '/placeholder-05.png']

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 1800)
    const rotation = window.setInterval(() => setBackgroundIndex((index) => (index + 1) % backgrounds.length), 5000)
    return () => { window.clearTimeout(timer); window.clearInterval(rotation) }
  }, [backgrounds.length])

  const enterModule = (module: 'ARIA' | 'JOZIEL') => {
    if (selectedModule) return
    setSelectedModule(module)
    window.setTimeout(() => router.push(module === 'ARIA' ? '/aria' : '/joziel'), 2000)
  }

  return (
    <main className={`home ${splash ? 'is-splashing' : 'is-ready'} ${selectedModule ? 'is-transitioning' : ''}`}>
      <div className="home-placeholder-bg" aria-hidden="true" style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }} />
      <div className="home-placeholder-wash" aria-hidden="true" />
      <section className="splash" aria-label="Fuego"><FlameMark /><span>FUEGO</span></section>
      <section className="home-content">
        <p className="selection-wordmark" aria-label="AJNLIQ128">AJNLIQ128</p>
        <div className="module-list" aria-label="Choose a module">
          <button className={`module-card module-aria ${selectedModule === 'ARIA' ? 'is-selected' : ''}`} onClick={() => enterModule('ARIA')} aria-label="Enter Aria">
            <img src="/aria-card.png" alt="Aria, a synthetic heart" />
            <span className="module-card-content"><Wordmark name="ARIA" /><span className="module-caption">a synthetic heart</span><span className="module-arrow" aria-hidden="true">↗</span></span>
            {selectedModule === 'ARIA' && <span className="particle-field" aria-hidden="true">{particles.map((particle) => <i key={particle} style={{ '--i': particle } as React.CSSProperties} />)}</span>}
          </button>
          <button className={`module-card module-joziel ${selectedModule === 'JOZIEL' ? 'is-selected' : ''}`} onClick={() => enterModule('JOZIEL')} aria-label="Enter Joziel">
            <img src="/joziel-card.png" alt="Joziel, the midnight mind" />
            <span className="module-card-content"><Wordmark name="JOZIEL" /><span className="module-caption">the midnight mind</span><span className="module-arrow" aria-hidden="true">↗</span></span>
            {selectedModule === 'JOZIEL' && <span className="particle-field" aria-hidden="true">{particles.map((particle) => <i key={particle} style={{ '--i': particle } as React.CSSProperties} />)}</span>}
          </button>
          <button className={`module-card module-nayla ${naylaNotice ? 'is-notice' : ''}`} disabled={selectedModule !== null} onClick={() => setNaylaNotice(true)} aria-label="Nayla, coming soon">
            <img src="/nayla-card.png" alt="Nayla, coming soon" />
            <span className="module-card-content"><Wordmark name="NAYLA" /><span className="module-caption">{naylaNotice ? 'coming soon' : 'coming soon'}</span><span className="module-arrow" aria-hidden="true">—</span></span>
          </button>
        </div>
        {selectedModule && <div className="module-seal" role="status" aria-live="polite">{selectedModule}</div>}
        <p className="home-footer">FUEGO / 001</p>
      </section>
    </main>
  )
}

