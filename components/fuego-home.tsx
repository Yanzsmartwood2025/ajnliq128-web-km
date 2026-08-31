'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { FlameMark, Wordmark } from './galaxy-background'
import { LoginHeader } from './auth-form'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundSettings } from './BackgroundSettings'
import { mediaUrl } from '@/lib/media-urls'
import { BubbleWrapper } from './BubbleWrapper'
import { AuthForm } from './auth-form'
import dynamic from 'next/dynamic'
const PhysicsBubbles = dynamic(() => import('./PhysicsBubbles'), { ssr: false })


export function FuegoHome() {
  const router = useRouter()
  const [splash, setSplash] = useState(true)
  const [selectedModule, setSelectedModule] = useState<'ARIA' | 'JOZIEL' | 'NAYLA' | null>(null)
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null)

  // Audio refs
  const ariaAudioRef = useRef<HTMLAudioElement>(null)
  const jozielAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSplash(false)
    }, 6000) // 6 second max fallback if video onEnded doesn't fire
    return () => window.clearTimeout(timer)
  }, [])

  const handleSplashVideoEnded = () => {
    setSplash(false)
  }

  const handleBubbleClick = (e: React.MouseEvent, module: 'ARIA' | 'JOZIEL' | 'NAYLA') => {
    e.stopPropagation() // Prevent click from triggering "touch outside"
    if (selectedModule === module) {
      // Second touch -> Enter module
      enterModule(module)
    } else {
      // First touch -> Focus bubble and play sound
      setSelectedModule(module)
      const audio = module === 'ARIA' ? ariaAudioRef.current : (module === 'JOZIEL' ? jozielAudioRef.current : null)
      if (audio) {
        audio.currentTime = 0
        audio.volume = 1
        audio.play().catch(e => console.error("Audio play failed", e))
      }
    }
  }

  const enterModule = (module: 'ARIA' | 'JOZIEL' | 'NAYLA') => {
    // Fade out logic and navigate
    const audio = module === 'ARIA' ? ariaAudioRef.current : (module === 'JOZIEL' ? jozielAudioRef.current : null)
    if (audio) {
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
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      router.push(module === 'ARIA' ? '/aria' : (module === 'JOZIEL' ? '/joziel' : '/nayla'))
    }, 2000)
  }

  const handleTouchOutside = () => {
    if (selectedModule) {
      setSelectedModule(null)
      const ariaAudio = ariaAudioRef.current
      const jozielAudio = jozielAudioRef.current
      if (ariaAudio) {
        ariaAudio.pause()
        ariaAudio.currentTime = 0
      }
      if (jozielAudio) {
        jozielAudio.pause()
        jozielAudio.currentTime = 0
      }
    }
  }

  // Organic floating animation variants
  const floatingAnimation = (delay: number, durationX: number, durationY: number) => ({
    y: ["-5vh", "5vh", "-5vh"],
    x: ["-4vw", "4vw", "-4vw"],
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

      <section className="splash" aria-label="Fuego" style={{ backgroundColor: 'black', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <video
          src={mediaUrl('fuego/videos/fuego-intro.mp4')}
          autoPlay
          muted
          playsInline
          onEnded={handleSplashVideoEnded}
          style={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain' }}
        />
      </section>

      <section className="home-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        {!splash && (
          <div className="home-login" style={{ display: 'flex', alignItems: 'center' }}>
            <BackgroundSettings />
            <LoginHeader onLoginClick={() => setShowAuthModal('login')} />
          </div>
        )}
        <p className="selection-wordmark" aria-label="AJNLIQ128">AJNLIQ128</p>

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                padding: '1.25rem'
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '430px' }}>
                <AuthForm
                  mode={showAuthModal}
                  onClose={() => setShowAuthModal(null)}
                  onSwitchMode={(mode) => setShowAuthModal(mode)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedModule && (
          <div
            onClick={handleTouchOutside}
            style={{ position: 'fixed', inset: 0, zIndex: 5, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          />
        )}
        <div style={{ position: 'relative', width: '100%', height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* If a module is selected, show the full screen focused view */}
          <AnimatePresence>
            {selectedModule === 'ARIA' && (
              <motion.div
                key="aria-focused"
                className="floating-bubble-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ scale: 1.5, opacity: 1, x: 0, y: 0, zIndex: 10, marginLeft: 0, marginTop: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ position: 'absolute' }}
              >
                <BubbleWrapper className="floating-bubble" onClick={(e) => handleBubbleClick(e, 'ARIA')}>
                  <div className="bubble-video-container" style={{ opacity: 0.6, transition: 'opacity 0.5s ease' }}>
                    <video
                      src={mediaUrl('fuego/botones/aria-preview.mp4')}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bubble-video"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-video-1.mp4";
                      }}
                    />
                  </div>
                  <span className="bubble-label">ARIA</span>
                </BubbleWrapper>
              </motion.div>
            )}

            {selectedModule === 'JOZIEL' && (
              <motion.div
                key="joziel-focused"
                className="floating-bubble-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ scale: 1.5, opacity: 1, x: 0, y: 0, zIndex: 10, marginLeft: 0, marginTop: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ position: 'absolute' }}
              >
                <BubbleWrapper className="floating-bubble" onClick={(e) => handleBubbleClick(e, 'JOZIEL')}>
                  <div className="bubble-video-container" style={{ opacity: 0.6, transition: 'opacity 0.5s ease' }}>
                    <video
                      src={mediaUrl('fuego/botones/joziel-preview.mp4')}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bubble-video"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-video-2.mp4";
                      }}
                    />
                  </div>
                  <span className="bubble-label">JOZIEL</span>
                </BubbleWrapper>
              </motion.div>
            )}

            {selectedModule === 'NAYLA' && (
              <motion.div
                key="nayla-focused"
                className="floating-bubble-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ scale: 1.5, opacity: 1, x: 0, y: 0, zIndex: 10, marginLeft: 0, marginTop: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ position: 'absolute' }}
              >
                <BubbleWrapper className="floating-bubble" onClick={(e) => handleBubbleClick(e, 'NAYLA')}>
                  <div className="bubble-video-container" style={{ opacity: 0.6, transition: 'opacity 0.5s ease' }}>
                    <video
                      src={mediaUrl('fuego/botones/nayla-preview.mp4')}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bubble-video"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-video-3.mp4";
                      }}
                    />
                  </div>
                  <span className="bubble-label">NAYLA</span>
                </BubbleWrapper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* If NO module is selected, render Physics system */}
          {!selectedModule && (
            <PhysicsBubbles
              onSelectModule={(module) => {
                // Synthesize an event object or pass null if possible,
                // handleBubbleClick expects React.MouseEvent but we can make it optional or cast it.
                handleBubbleClick({ stopPropagation: () => {} } as any, module);
              }}
            />
          )}
        </div>
      </section>
    </main>
  )
}
