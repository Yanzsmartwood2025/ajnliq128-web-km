'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FlameMark, Wordmark } from './galaxy-background'

export function FuegoHome() {
  const [splash, setSplash] = useState(true)
  useEffect(() => { const timer = window.setTimeout(() => setSplash(false), 1800); return () => window.clearTimeout(timer) }, [])
  return <main className={`home ${splash ? 'is-splashing' : 'is-ready'}`}>
    <section className="splash" aria-label="Fuego">
      <FlameMark /><span>FUEGO</span>
    </section>
    <section className="home-content">
      <p className="selection-wordmark" aria-label="AJNLIQ128">AJNLIQ128</p>
      <div className="module-list" aria-label="Choose a module">
        <Link className="module-card module-aria" href="/aria">
          <img src="/aria-card.png" alt="Aria, a synthetic heart" />
          <span className="module-card-content"><Wordmark name="ARIA" /><span className="module-caption">a synthetic heart</span><span className="module-arrow" aria-hidden="true">↗</span></span>
        </Link>
        <Link className="module-card module-joziel" href="/joziel">
          <img src="/joziel-card.png" alt="Joziel, the midnight mind" />
          <span className="module-card-content"><Wordmark name="JOZIEL" /><span className="module-caption">the midnight mind</span><span className="module-arrow" aria-hidden="true">↗</span></span>
        </Link>
        <button className="module-card module-nayla" disabled aria-label="Nayla, coming soon">
          <img src="/nayla-card.png" alt="Nayla, coming soon" />
          <span className="module-card-content"><Wordmark name="NAYLA" /><span className="module-caption">coming soon</span><span className="module-arrow" aria-hidden="true">—</span></span>
        </button>
      </div>
      <p className="home-footer">FUEGO / 001</p>
    </section>
  </main>
}
