'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { LoginHeader } from './auth-form'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundSettings } from './BackgroundSettings'
import { mediaUrl } from '@/lib/media-urls'
import { BubbleWrapper } from './BubbleWrapper'
import { AuthForm } from './auth-form'
import dynamic from 'next/dynamic'

const PhysicsBubbles = dynamic(() => import('./PhysicsBubbles'), { ssr: false })

type HomeModule = 'ARIA' | 'JOZIEL' | 'NAYLA'

export function FuegoHome() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [splash, setSplash] = useState(() => searchParams.get('skipIntro') !== '1')
  const [selectedModule, setSelectedModule] = useState<HomeModule | null>(null)
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (searchParams.get('skipIntro') !== '1' || typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.delete('skipIntro')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('login') === 'true' && !user) {
      setShowAuthModal('login')

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('login')
        window.history.replaceState({}, '', url)
      }
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!user || typeof window === 'undefined') return

    const pendingRedirect = localStorage.getItem('pendingEditorRedirect')
    if (!pendingRedirect) return
    localStorage.removeItem('pendingEditorRedirect')

    const getAuthTokenAndRedirect = async () => {
      try {
        const idToken = await user.getIdToken()
        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!res.ok) return

        const data = await res.json()
        if (!data.customToken) return

        const editorUrl = process.env.NEXT_PUBLIC_EDITOR_URL || 'https://editor.vercel.app'
        window.location.href = `${editorUrl}/#authToken=${data.customToken}`
      } catch (error) {
        console.error('Error in pending redirect:', error)
      }
    }

    void getAuthTokenAndRedirect()
  }, [user])

  useEffect(() => {
    if (!splash) return
    const timer = window.setTimeout(() => setSplash(false), 6000)
    return () => window.clearTimeout(timer)
  }, [splash])

  const enterModule = useCallback((module: HomeModule) => {
    window.setTimeout(() => {
      router.push(module === 'ARIA' ? '/aria' : module === 'JOZIEL' ? '/joziel' : '/nayla')
    }, 900)
  }, [router])

  const handleModuleSelect = useCallback((module: HomeModule) => {
    setSelectedModule((current) => {
      if (current === module) {
        enterModule(module)
        return current
      }
      return module
    })
  }, [enterModule])

  const handleFocusedBubbleClick = useCallback((event: React.MouseEvent, module: HomeModule) => {
    event.stopPropagation()
    handleModuleSelect(module)
  }, [handleModuleSelect])

  const handleTouchOutside = useCallback(() => {
    setSelectedModule(null)
  }, [])

  return (
    <main className={`home ${splash ? 'is-splashing' : 'is-ready'} ${selectedModule ? 'is-transitioning' : ''}`}>
      {splash && (
        <section className="splash" aria-label="Fuego" style={{ backgroundColor: 'black', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video
            src={mediaUrl('fuego/videos/fuego-intro.mp4')}
            autoPlay
            muted
            playsInline
            onEnded={() => setSplash(false)}
            style={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain' }}
          />
        </section>
      )}

      <section className="home-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        {!splash && (
          <div className="home-login" style={{ display: 'flex', alignItems: 'center' }}>
            <BackgroundSettings open={settingsOpen} onOpenChange={setSettingsOpen} hideTrigger />
            {user ? (
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Abrir opciones"
                title="Opciones"
                style={{
                  width: '3rem',
                  height: '3rem',
                  padding: '0.2rem',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,.34)',
                  background: 'linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.06))',
                  backdropFilter: 'blur(20px) saturate(135%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(135%)',
                  boxShadow: '0 12px 34px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.3)',
                  cursor: 'pointer',
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '1.35rem', height: '1.35rem', fill: 'none', stroke: 'white', strokeWidth: '1.5' }}>
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5.5 20c.65-3.15 2.85-5 6.5-5s5.85 1.85 6.5 5" />
                  </svg>
                )}
              </button>
            ) : (
              <LoginHeader onLoginClick={() => setShowAuthModal('login')} />
            )}
          </div>
        )}

        <img
          src="/assets/home/ajnliq128.png"
          alt="AJNLIQ128"
          style={{
            width: 'clamp(190px, 32vw, 260px)',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            position: 'relative',
            zIndex: 4,
          }}
        />

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
                padding: '1.25rem',
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '430px' }}>
                <AuthForm
                  mode={showAuthModal}
                  onClose={() => {
                    setShowAuthModal(null)
                    localStorage.removeItem('pendingEditorRedirect')
                  }}
                  onSwitchMode={setShowAuthModal}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedModule && (
          <div
            onClick={handleTouchOutside}
            style={{ position: 'fixed', inset: 0, zIndex: 5, background: 'rgba(0,0,0,0.27)', backdropFilter: 'blur(2px)' }}
          />
        )}

        <div style={{ position: 'relative', width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                <BubbleWrapper className="floating-bubble" onClick={(event) => handleFocusedBubbleClick(event, 'ARIA')}>
                  <div className="bubble-video-container" style={{ opacity: 0.82, transition: 'opacity 0.5s ease' }}>
                    <video src={mediaUrl('fuego/botones/aria-preview.mp4')} autoPlay loop muted playsInline className="bubble-video" />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16%', zIndex: 20 }}>
                    <img src={mediaUrl('aria/imagenes/aria-logo.png')} alt="Aria logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
                  </div>
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
                <BubbleWrapper className="floating-bubble" onClick={(event) => handleFocusedBubbleClick(event, 'JOZIEL')}>
                  <div className="bubble-video-container" style={{ opacity: 0.82, transition: 'opacity 0.5s ease' }}>
                    <video src={mediaUrl('fuego/botones/joziel-preview.mp4')} autoPlay loop muted playsInline className="bubble-video" />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16%', paddingBottom: '28%', zIndex: 20 }}>
                    <img src={mediaUrl('joziel/imagenes/joziel-logo.png')} alt="Joziel logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
                  </div>
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
                <BubbleWrapper className="floating-bubble" onClick={(event) => handleFocusedBubbleClick(event, 'NAYLA')}>
                  <div className="bubble-video-container" style={{ opacity: 0.82, transition: 'opacity 0.5s ease' }}>
                    <video src={mediaUrl('fuego/botones/nayla-preview.mp4')} autoPlay loop muted playsInline className="bubble-video" />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16%', zIndex: 20 }}>
                    <img src={mediaUrl('nayla/imagenes/nayla-logo.png')} alt="Nayla logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
                  </div>
                </BubbleWrapper>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedModule && <PhysicsBubbles onSelectModule={handleModuleSelect} />}
        </div>
      </section>
    </main>
  )
}
