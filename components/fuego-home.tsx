'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { FlameMark, Wordmark } from './galaxy-background'
import { LoginHeader } from './auth-form'
import SideRays from './SideRays'
import { motion, AnimatePresence } from 'framer-motion'

export function FuegoHome() {
  const router = useRouter()
  const [splash, setSplash] = useState(true)
  const [selectedModule, setSelectedModule] = useState<'ARIA' | 'JOZIEL' | null>(null)
  const [naylaNotice, setNaylaNotice] = useState(false)

  // Audio refs
  const ariaAudioRef = useRef<HTMLAudioElement>(null)
  const jozielAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 3000)
    return () => window.clearTimeout(timer)
  }, [])

  const enterModule = (module: 'ARIA' | 'JOZIEL') => {
    if (selectedModule) return
    setSelectedModule(module)

    // Play sound and fade out
    const audio = module === 'ARIA' ? ariaAudioRef.current : jozielAudioRef.current
    if (audio) {
      audio.volume = 1
      audio.play().catch(e => console.error("Audio play failed", e))

      // Fade out logic
      let fadeTimer = 0
      const fadeInterval = setInterval(() => {
        fadeTimer += 50
        if (fadeTimer >= 1500 && audio.volume > 0.1) {
          audio.volume -= 0.1
        } else if (fadeTimer >= 2000) {
          audio.volume = 0
          clearInterval(fadeInterval)
        }
      }, 50)
    }

    window.setTimeout(() => {
      if (audio) audio.pause()
      router.push(module === 'ARIA' ? '/aria' : '/joziel')
    }, 2000)
  }

  // Organic floating animation variants
  const floatingAnimation = (delay: number, durationX: number, durationY: number) => ({
    y: ["-3vh", "3vh", "-3vh"],
    x: ["-2vw", "2vw", "-2vw"],
    transition: {
      y: {
        duration: durationY,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      },
      x: {
        duration: durationX,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay + 1
      }
    }
  } as any)

  return (
    <main className={`home ${splash ? 'is-splashing' : 'is-ready'} ${selectedModule ? 'is-transitioning' : ''}`}>
      {/* Audio elements */}
      <audio ref={ariaAudioRef} src="/audio/aria.mp3" preload="auto" />
      <audio ref={jozielAudioRef} src="/audio/joziel.mp3" preload="auto" />

      <section className="splash" aria-label="Fuego"><FlameMark /><span>FUEGO</span></section>

      <section className="home-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        {!splash && <div className="home-login"><LoginHeader /></div>}
        <p className="selection-wordmark" aria-label="AJNLIQ128">AJNLIQ128</p>
        <div style={{ position: 'relative', width: '100%', height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatePresence>
            {(!selectedModule || selectedModule === 'ARIA') && (
              <motion.button key="aria" className="floating-bubble" initial={{ opacity: 0, scale: 0 }} animate={selectedModule === 'ARIA' ? { scale: 1.5, opacity: 1, x: 0, y: 0, marginLeft: 0, marginTop: 0 } : { opacity: 1, scale: 1, marginLeft: '-20vw', marginTop: '-5vh', ...floatingAnimation(0, 6, 7) }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => enterModule('ARIA')} style={{ position: 'absolute' }}>
                <div className="bubble-video-container"><video src="/placeholder-video-1.mp4" autoPlay loop muted playsInline className="bubble-video" /></div><span className="bubble-label">ARIA</span>
              </motion.button>
            )}
            {(!selectedModule || selectedModule === 'JOZIEL') && (
              <motion.button key="joziel" className="floating-bubble" initial={{ opacity: 0, scale: 0 }} animate={selectedModule === 'JOZIEL' ? { scale: 1.5, opacity: 1, x: 0, y: 0, marginLeft: 0, marginTop: 0 } : { opacity: 1, scale: 1, marginLeft: '20vw', marginTop: '10vh', ...floatingAnimation(1.5, 7, 5) }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => enterModule('JOZIEL')} style={{ position: 'absolute' }}>
                <div className="bubble-video-container"><video src="/placeholder-video-2.mp4" autoPlay loop muted playsInline className="bubble-video" /></div><span className="bubble-label">JOZIEL</span>
              </motion.button>
            )}
            {!selectedModule && (
              <motion.button key="nayla" className={`floating-bubble is-disabled ${naylaNotice ? 'is-notice' : ''}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 0.8, ...floatingAnimation(3, 5, 8) }} exit={{ opacity: 0, scale: 0 }} onClick={() => setNaylaNotice(true)} style={{ position: 'absolute', marginTop: '-20vh', marginLeft: '0vw' }}>
                <div className="bubble-video-container"><video src="/placeholder-video-3.mp4" autoPlay loop muted playsInline className="bubble-video" /></div><span className="bubble-label">{naylaNotice ? 'PRÓXIMAMENTE' : 'NAYLA'}</span>
                <span className="nayla-side-rays" aria-hidden="true"><SideRays speed={1.35} rayColor1="#ffffff" rayColor2="#ffffff" intensity={1.4} spread={1.7} origin="top-right" opacity={0.72} /></span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="home-footer" style={{ marginTop: 'auto' }}>FUEGO / 001</p>
      </section>
    </main>
  )
}
