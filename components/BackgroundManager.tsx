'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Lazy load background components
const FloatingLines = dynamic(() => import('@/components/ui/floating-lines').then(mod => mod.FloatingLines), { ssr: false })
const GhostFibers = dynamic(() => import('@/components/GhostFibers'), { ssr: false })
const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const WebThreads = dynamic(() => import('@/components/WebThreads'), { ssr: false })
const MagicRings = dynamic(() => import('@/components/MagicRings'), { ssr: false })

export type BackgroundType = 'floatingLines' | 'ghostFibers' | 'rippleDistortion' | 'webThreads' | 'magicRings'
export type BubbleEffectType = 'none' | 'tiltedCard' | 'glareHover' | 'borderGlow' | 'splashCursor' | 'rippleDistortion'

export interface BackgroundSettings {
  type: BackgroundType
  ghostFibers: { lineColor: string; glowColor: string }
  rippleDistortion: { tint: string }
  webThreads: { color1: string; color2: string; color3: string }
  magicRings: { color: string; colorTwo: string }
  bubbleEffect: BubbleEffectType
}

const defaultSettings: BackgroundSettings = {
  type: 'floatingLines',
  ghostFibers: { lineColor: '#140E35', glowColor: '#3437A0' },
  rippleDistortion: { tint: '#a855f7' },
  webThreads: { color1: '#5227FF', color2: '#FF9FFC', color3: '#FFFFFF' },
  magicRings: { color: '#fc42ff', colorTwo: '#42fcff' },
  bubbleEffect: 'none'
}

interface BackgroundContextType {
  settings: BackgroundSettings
  updateSettings: (newSettings: Partial<BackgroundSettings>) => void
}

const BackgroundContext = createContext<BackgroundContextType>({
  settings: defaultSettings,
  updateSettings: () => {}
})

export function useBackground() {
  return useContext(BackgroundContext)
}

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fuego_bg_preferences')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (e) {
        console.error("Error parsing background settings", e)
      }
    }
    setMounted(true)
  }, [])

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('fuego_bg_preferences', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <BackgroundContext.Provider value={{ settings, updateSettings }}>
      <div style={{ position: 'fixed', zIndex: -1, inset: 0, width: '100%', height: '100%' }}>
        {mounted && (
          <>
            {settings.type === 'floatingLines' && <FloatingLines />}
            {settings.type === 'ghostFibers' && (
              <GhostFibers
                lineColor={settings.ghostFibers.lineColor}
                glowColor={settings.ghostFibers.glowColor}
              />
            )}
            {settings.type === 'rippleDistortion' && (
              <RippleDistortion
                tint={settings.rippleDistortion.tint}
              />
            )}
            {settings.type === 'webThreads' && (
              <WebThreads
                color1={settings.webThreads.color1}
                color2={settings.webThreads.color2}
                color3={settings.webThreads.color3}
              />
            )}
            {settings.type === 'magicRings' && (
              <MagicRings
                color={settings.magicRings.color}
                colorTwo={settings.magicRings.colorTwo}
              />
            )}
          </>
        )}
      </div>
      {children}
    </BackgroundContext.Provider>
  )
}
