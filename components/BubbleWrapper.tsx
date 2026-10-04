'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import React from 'react'
import { useBackground, type BubbleEffectType } from './BackgroundManager'
import TiltedCard from './TiltedCard'
import GlareHover from './GlareHover'
import BorderGlow from './BorderGlow'
import SplashCursor from './SplashCursor'
import BubbleEffectFrame, { type ExtraBubbleEffectType } from './effects/BubbleEffects'
import { defaultBubbleControls, type BubbleControlSettings } from './effects/effect-settings'

const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })

const extraEffects = new Set<ExtraBubbleEffectType>(['softPulse', 'orbitGlow', 'magneticTilt', 'neonRipple', 'glassShine', 'haloRing'])

interface BubbleWrapperProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<any>) => void
  simple?: boolean
  effectOverride?: BubbleEffectType
  controlsOverride?: BubbleControlSettings
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const rgba = (hex: string, alpha: number) => {
  const raw = hex.replace('#', '').trim()
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return `rgba(255,255,255,${alpha})`
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${clamp(alpha, 0, 1)})`
}

export function BubbleWrapper({ children, className = '', style, onClick, simple = false, effectOverride, controlsOverride }: BubbleWrapperProps) {
  const { settings } = useBackground()
  const effect = simple ? 'none' : effectOverride ?? settings.bubbleEffect
  const controls = controlsOverride ?? settings.bubbleControls?.[effect] ?? defaultBubbleControls[effect] ?? defaultBubbleControls.none
  const innerClasses = 'w-full h-full rounded-full absolute inset-0 overflow-hidden'
  const speed = clamp(controls.speed, .2, 3)
  const intensity = clamp(controls.intensity, .2, 2)
  const glow = clamp(controls.glow, 0, 2)
  const opacity = clamp(controls.opacity, .05, 1)

  // The Home button settings preview historically used the placeholder text "AJ".
  // Keep the preview structure intact, but render the official transparent brand PNG instead.
  const bubbleContent = React.isValidElement<{ children?: React.ReactNode }>(children) && children.props.children === 'AJ'
    ? React.cloneElement(
        children,
        {},
        <img
          src="/assets/home/ajnliq128.png"
          alt="AJNLIQ128"
          style={{ width: '72%', height: '72%', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.28))' }}
        />,
      )
    : children

  const renderEffect = () => {
    if (effect === 'none') return <div className={innerClasses}>{bubbleContent}</div>
    if (effect === 'tiltedCard') return <TiltedCard className={innerClasses} rotationIntensity={15 * clamp(controls.tilt, .25, 2)}>{bubbleContent}</TiltedCard>
    if (effect === 'glareHover') return <GlareHover className={innerClasses}>{bubbleContent}</GlareHover>
    if (effect === 'borderGlow') return <BorderGlow className={innerClasses} glowColor={controls.color1}>{bubbleContent}</BorderGlow>
    if (effect === 'splashCursor') return <SplashCursor className={innerClasses}>{bubbleContent}</SplashCursor>
    if (effect === 'rippleDistortion') {
      return (
        <div className={innerClasses}>
          {bubbleContent}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity }}>
            <RippleDistortion tint={controls.color1} highlightColor={controls.color2} strength={.1 + .2 * intensity} glint={glow} tintAmount={.12 + .12 * intensity} quality="low" />
          </div>
        </div>
      )
    }
    if (extraEffects.has(effect as ExtraBubbleEffectType)) {
      return <BubbleEffectFrame variant={effect as ExtraBubbleEffectType} className={innerClasses} controls={controls}>{bubbleContent}</BubbleEffectFrame>
    }
    return <div className={innerClasses}>{bubbleContent}</div>
  }

  return (
    <div className={`relative ${className}`} onClick={onClick} style={{ width: '100%', height: '100%', ...style }}>
      {renderEffect()}
      {effect !== 'none' && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-1px', borderRadius: '50%', pointerEvents: 'none', zIndex: 30,
            border: `1px solid ${rgba(controls.color1, .12 + .12 * intensity)}`,
          }}
          animate={{
            opacity: [.42 * opacity, .82 * opacity, .42 * opacity],
            boxShadow: [
              `0 0 ${4 + glow * 6}px ${rgba(controls.color1, .06 * glow)}`,
              `0 0 ${10 + glow * 13}px ${rgba(controls.color2, .13 * glow * intensity)}`,
              `0 0 ${4 + glow * 6}px ${rgba(controls.color1, .06 * glow)}`,
            ],
          }}
          transition={{ duration: 3.4 / speed, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
