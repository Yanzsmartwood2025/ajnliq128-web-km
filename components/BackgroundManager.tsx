'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AmbientBackgroundType } from '@/components/effects/AmbientBackgrounds'
import type { ExtraBubbleEffectType } from '@/components/effects/BubbleEffects'
import { BackgroundEffectRenderer } from '@/components/effects/BackgroundEffectRenderer'
import {
  defaultBackgroundControls,
  defaultBubbleControls,
  mergeBackgroundControls,
  mergeBubbleControls,
  type BackgroundControlSettings,
  type BubbleControlSettings,
} from '@/components/effects/effect-settings'

export type BackgroundType =
  | 'floatingLines'
  | 'ghostFibers'
  | 'rippleDistortion'
  | 'webThreads'
  | 'magicRings'
  | AmbientBackgroundType

export type BubbleEffectType =
  | 'none'
  | 'tiltedCard'
  | 'glareHover'
  | 'borderGlow'
  | 'splashCursor'
  | 'rippleDistortion'
  | ExtraBubbleEffectType

export interface BackgroundSettings {
  type: BackgroundType
  bubbleEffect: BubbleEffectType
  backgroundControls: Record<string, BackgroundControlSettings>
  bubbleControls: Record<string, BubbleControlSettings>
}

export const defaultSettings: BackgroundSettings = {
  type: 'floatingLines',
  bubbleEffect: 'none',
  backgroundControls: mergeBackgroundControls(),
  bubbleControls: mergeBubbleControls(),
}

function migrateStoredSettings(raw: unknown): BackgroundSettings {
  if (!raw || typeof raw !== 'object') return defaultSettings
  const saved = raw as Record<string, any>
  const backgroundControls = mergeBackgroundControls(saved.backgroundControls)
  const bubbleControls = mergeBubbleControls(saved.bubbleControls)

  // Compatibility with preferences saved by the first version of the panel.
  if (!saved.backgroundControls?.ghostFibers && saved.ghostFibers) {
    backgroundControls.ghostFibers = {
      ...backgroundControls.ghostFibers,
      color1: saved.ghostFibers.lineColor ?? backgroundControls.ghostFibers.color1,
      color2: saved.ghostFibers.glowColor ?? backgroundControls.ghostFibers.color2,
    }
  }
  if (!saved.backgroundControls?.rippleDistortion && saved.rippleDistortion) {
    backgroundControls.rippleDistortion = {
      ...backgroundControls.rippleDistortion,
      color1: saved.rippleDistortion.tint ?? backgroundControls.rippleDistortion.color1,
    }
  }
  if (!saved.backgroundControls?.webThreads && saved.webThreads) {
    backgroundControls.webThreads = {
      ...backgroundControls.webThreads,
      color1: saved.webThreads.color1 ?? backgroundControls.webThreads.color1,
      color2: saved.webThreads.color2 ?? backgroundControls.webThreads.color2,
      color3: saved.webThreads.color3 ?? backgroundControls.webThreads.color3,
    }
  }
  if (!saved.backgroundControls?.magicRings && saved.magicRings) {
    backgroundControls.magicRings = {
      ...backgroundControls.magicRings,
      color1: saved.magicRings.color ?? backgroundControls.magicRings.color1,
      color2: saved.magicRings.colorTwo ?? backgroundControls.magicRings.color2,
    }
  }

  const type = Object.prototype.hasOwnProperty.call(defaultBackgroundControls, saved.type) ? saved.type as BackgroundType : defaultSettings.type
  const bubbleEffect = Object.prototype.hasOwnProperty.call(defaultBubbleControls, saved.bubbleEffect) ? saved.bubbleEffect as BubbleEffectType : defaultSettings.bubbleEffect

  return { type, bubbleEffect, backgroundControls, bubbleControls }
}

interface BackgroundContextType {
  settings: BackgroundSettings
  updateSettings: (newSettings: Partial<BackgroundSettings>) => void
}

const BackgroundContext = createContext<BackgroundContextType>({ settings: defaultSettings, updateSettings: () => {} })

export function useBackground() {
  return useContext(BackgroundContext)
}

export function BackgroundProvider({ children, renderBackground = true }: { children: React.ReactNode; renderBackground?: boolean }) {
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fuego_bg_preferences')
    if (saved) {
      try {
        setSettings(migrateStoredSettings(JSON.parse(saved)))
      } catch (error) {
        console.error('Error parsing background settings', error)
        setSettings(defaultSettings)
      }
    }
    setMounted(true)
  }, [])

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings((prev) => {
      const updated: BackgroundSettings = {
        ...prev,
        ...newSettings,
        backgroundControls: newSettings.backgroundControls ?? prev.backgroundControls,
        bubbleControls: newSettings.bubbleControls ?? prev.bubbleControls,
      }
      localStorage.setItem('fuego_bg_preferences', JSON.stringify(updated))
      return updated
    })
  }

  const activeControls = useMemo(
    () => settings.backgroundControls[settings.type] ?? defaultBackgroundControls[settings.type],
    [settings.backgroundControls, settings.type]
  )

  return (
    <BackgroundContext.Provider value={{ settings, updateSettings }}>
      {renderBackground && (
        <div style={{ position: 'fixed', zIndex: -1, inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          {mounted && activeControls && <BackgroundEffectRenderer type={settings.type} controls={activeControls} />}
        </div>
      )}
      {children}
    </BackgroundContext.Provider>
  )
}
