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
      <p className="eyebrow">A constellation of voices</p>
      <h1>Choose your frequency.</h1>
      <div className="module-list">
        <Link className="module-card module-aria" href="/aria"><Wordmark name="ARIA" /><span className="module-caption">a synthetic heart</span><span className="module-arrow">↗</span></Link>
        <Link className="module-card module-joziel" href="/joziel"><Wordmark name="JOZIEL" /><span className="module-caption">the midnight mind</span><span className="module-arrow">↗</span></Link>
        <button className="module-card module-nayla" disabled><Wordmark name="NAYLA" /><span className="module-caption">coming soon</span><span className="module-arrow">—</span></button>
      </div>
      <p className="home-footer">FUEGO / 001</p>
    </section>
  </main>
}
