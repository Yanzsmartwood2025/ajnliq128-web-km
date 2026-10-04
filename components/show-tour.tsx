'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CharacterHub } from './character-hub'
import PhysicsBubbles from './PhysicsBubbles'
import { mediaUrl } from '@/lib/media-urls'

type ShowPhase = 'intro' | 'home-aria' | 'aria' | 'home-joziel' | 'joziel' | 'finale' | 'done'
type BubbleModule = 'ARIA' | 'JOZIEL'

const INTRO_MS = 6_000
const HOME_TRAVEL_MS = 7_500
const CHARACTER_TOUR_MS = 54_000
const FINALE_MS = 7_000
const FOCUS_DELAY_MS = 2_200

export const AJN_SHOW_TOTAL_MS =
  INTRO_MS + HOME_TRAVEL_MS + CHARACTER_TOUR_MS + HOME_TRAVEL_MS + CHARACTER_TOUR_MS + FINALE_MS

export function ShowTour() {
  const [phase, setPhase] = useState<ShowPhase>('intro')
  const [focusModule, setFocusModule] = useState<BubbleModule | null>(null)
  const completedRef = useRef(false)

  const completeShow = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setPhase('done')

    const payload = {
      type: 'AJNLIQ_SHOW_INTRO_COMPLETE',
      source: 'ajnliq128',
      durationMs: AJN_SHOW_TOTAL_MS,
      finishedAt: Date.now(),
    }

    window.dispatchEvent(new CustomEvent('ajnliq-show-intro-complete', { detail: payload }))
    try {
      window.parent?.postMessage(payload, '*')
    } catch {}
    try {
      window.opener?.postMessage(payload, '*')
    } catch {}
  }, [])

  useEffect(() => {
    let phaseTimer: number | null = null
    let focusTimer: number | null = null

    if (phase === 'intro') {
      phaseTimer = window.setTimeout(() => setPhase('home-aria'), INTRO_MS)
    }

    if (phase === 'home-aria' || phase === 'home-joziel') {
      setFocusModule(null)
      const target: BubbleModule = phase === 'home-aria' ? 'ARIA' : 'JOZIEL'
      focusTimer = window.setTimeout(() => setFocusModule(target), FOCUS_DELAY_MS)
      phaseTimer = window.setTimeout(
        () => setPhase(target === 'ARIA' ? 'aria' : 'joziel'),
        HOME_TRAVEL_MS,
      )
    }

    if (phase === 'finale') {
      setFocusModule(null)
      phaseTimer = window.setTimeout(completeShow, FINALE_MS)
    }

    return () => {
      if (phaseTimer) window.clearTimeout(phaseTimer)
      if (focusTimer) window.clearTimeout(focusTimer)
    }
  }, [completeShow, phase])

  const showHome = phase === 'home-aria' || phase === 'home-joziel' || phase === 'finale' || phase === 'done'

  return (
    <main className="show-tour-shell" data-phase={phase}>
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.section
            key="show-intro"
            className="show-intro-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(5px)' }}
            transition={{ duration: 1.1 }}
          >
            <video
              className="show-intro-video"
              src={mediaUrl('fuego/videos/fuego-intro.mp4')}
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </motion.section>
        )}

        {showHome && (
          <motion.section
            key={phase}
            className="show-home-stage"
            initial={{ opacity: 0, scale: 1.08, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.18, filter: 'blur(8px)' }}
            transition={{ duration: 1.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="show-home-wordmark">AJNLIQ128</div>
            <PhysicsBubbles
              interactive={false}
              focusModule={focusModule}
              onSelectModule={() => undefined}
            />
            {focusModule && (
              <motion.div
                className="show-travel-portal"
                initial={{ opacity: 0, scale: 0.22 }}
                animate={{ opacity: [0, 0.42, 0.08], scale: [0.22, 0.78, 1.72] }}
                transition={{ duration: 4.8, ease: 'easeInOut' }}
                aria-hidden="true"
              />
            )}
            {(phase === 'finale' || phase === 'done') && (
              <motion.div
                className="show-finale-mark"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: phase === 'done' ? 0.6 : 0.3, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                FUEGO
              </motion.div>
            )}
          </motion.section>
        )}

        {phase === 'aria' && (
          <motion.section
            key="aria-tour"
            className="show-character-stage"
            initial={{ opacity: 0, scale: 1.16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(7px)' }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <CharacterHub
              character="aria"
              showMode
              showDurationMs={CHARACTER_TOUR_MS}
              onShowComplete={() => setPhase('home-joziel')}
            />
          </motion.section>
        )}

        {phase === 'joziel' && (
          <motion.section
            key="joziel-tour"
            className="show-character-stage"
            initial={{ opacity: 0, scale: 1.16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(7px)' }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <CharacterHub
              character="joziel"
              showMode
              showDurationMs={CHARACTER_TOUR_MS}
              onShowComplete={() => setPhase('finale')}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
