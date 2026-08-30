import SideRays from '@/components/SideRays'
import { Wordmark } from '@/components/galaxy-background'
import Link from 'next/link'
import { FlameMark } from '@/components/galaxy-background'

export default function NaylaPage() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100svh', backgroundColor: '#000000', overflow: 'hidden' }}>

      <main className="hub hub-with-video" style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
        <header className="hub-header" style={{ padding: 'clamp(1.25rem, 5vw, 2.5rem) clamp(1.25rem, 5vw, 5rem)', position: 'relative', zIndex: 10 }}>
          <Link href="/" className="back-link"><FlameMark /> <span>FUEGO</span></Link>
          <div className="hub-actions">
            {/* Keeping it aligned with other pages */}
          </div>
        </header>

        {/* Side Rays Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <SideRays
            speed={2.5}
            rayColor1="#ffffff"
            rayColor2="#ffffff"
            intensity={2}
            spread={2}
            origin="top-right"
            tilt={0}
            saturation={0}
            blend={0.5}
            falloff={2.0}
            opacity={1.0}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <section className="hub-intro" style={{ padding: 0, margin: 0, textAlign: 'center', marginTop: '-10vh' }}>
            <Wordmark name="NAYLA" />
          </section>
        </div>
      </main>
    </div>
  )
}
