'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useBackground } from './BackgroundManager'
import TiltedCard from './TiltedCard'
import GlareHover from './GlareHover'
import BorderGlow from './BorderGlow'
import SplashCursor from './SplashCursor'
import type { ExtraBubbleEffectType } from './effects/BubbleEffects'

const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const BubbleEffectFrame = dynamic(() => import('@/components/effects/BubbleEffects'), { ssr: false })

const extraEffects = new Set<ExtraBubbleEffectType>([
  'softPulse',
  'orbitGlow',
  'magneticTilt',
  'neonRipple',
  'glassShine',
  'haloRing',
])

interface BubbleWrapperProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<any>) => void
  simple?: boolean
}

export function BubbleWrapper({ children, className = '', style, onClick, simple = false }: BubbleWrapperProps) {
  const { settings } = useBackground()
  const effect = simple ? 'none' : settings.bubbleEffect
  const innerClasses = 'w-full h-full rounded-full absolute inset-0'

  return (
    <div className={`relative ${className}`} onClick={onClick} style={{ width: '100%', height: '100%', ...style }}>
      {effect === 'none' && <div className={innerClasses}>{children}</div>}
      {effect === 'tiltedCard' && <TiltedCard className={innerClasses}>{children}</TiltedCard>}
      {effect === 'glareHover' && <GlareHover className={innerClasses}>{children}</GlareHover>}
      {effect === 'borderGlow' && <BorderGlow className={innerClasses} glowColor="#a855f7">{children}</BorderGlow>}
      {effect === 'splashCursor' && <SplashCursor className={innerClasses}>{children}</SplashCursor>}
      {effect === 'rippleDistortion' && (
        <div className={`${innerClasses} overflow-hidden`}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            <RippleDistortion tint="#ffffff" />
          </div>
          {children}
        </div>
      )}
      {extraEffects.has(effect as ExtraBubbleEffectType) && (
        <BubbleEffectFrame variant={effect as ExtraBubbleEffectType} className={innerClasses}>
          {children}
        </BubbleEffectFrame>
      )}
      {!['none', 'tiltedCard', 'glareHover', 'borderGlow', 'splashCursor', 'rippleDistortion'].includes(effect) && !extraEffects.has(effect as ExtraBubbleEffectType) && (
        <div className={innerClasses}>{children}</div>
      )}
    </div>
  )
}
