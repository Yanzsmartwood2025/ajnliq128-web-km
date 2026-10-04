'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import React from 'react'
import type { BubbleControlSettings } from './effect-settings'

export type ExtraBubbleEffectType =
  | 'softPulse'
  | 'orbitGlow'
  | 'magneticTilt'
  | 'neonRipple'
  | 'glassShine'
  | 'haloRing'

type Props = {
  variant: ExtraBubbleEffectType
  children: React.ReactNode
  className?: string
  controls: BubbleControlSettings
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const rgba = (hex: string, alpha: number) => {
  const raw = hex.replace('#', '').trim()
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return `rgba(255,255,255,${alpha})`
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${clamp(alpha, 0, 1)})`
}

export default function BubbleEffectFrame({ variant, children, className = '', controls }: Props) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 18 })
  const sy = useSpring(my, { stiffness: 180, damping: 18 })
  const tilt = clamp(controls.tilt, .25, 2)
  const rotateY = useTransform(sx, [-1, 1], [-8 * tilt, 8 * tilt])
  const rotateX = useTransform(sy, [-1, 1], [8 * tilt, -8 * tilt])
  const speed = clamp(controls.speed, .2, 3)
  const intensity = clamp(controls.intensity, .2, 2)
  const glow = clamp(controls.glow, 0, 2)
  const opacity = clamp(controls.opacity, .05, 1)

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (variant !== 'magneticTilt') return
    const rect = event.currentTarget.getBoundingClientRect()
    mx.set(((event.clientX - rect.left) / rect.width - .5) * 2)
    my.set(((event.clientY - rect.top) / rect.height - .5) * 2)
  }

  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  const common: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    opacity,
  }

  if (variant === 'softPulse') {
    return (
      <motion.div
        className={className}
        style={common}
        animate={{
          scale: [1, 1 + .035 * intensity, 1],
          boxShadow: [
            `0 0 0 ${rgba(controls.color1, 0)}`,
            `0 0 ${18 + 20 * glow}px ${rgba(controls.color1, .18 + .14 * intensity)}`,
            `0 0 0 ${rgba(controls.color1, 0)}`,
          ],
        }}
        transition={{ duration: 3.8 / speed, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    )
  }

  if (variant === 'orbitGlow') {
    return (
      <div className={className} style={common}>
        {children}
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-4%', borderRadius: '50%', border: `${1 + intensity}px solid transparent`,
            borderTopColor: rgba(controls.color1, .86), borderRightColor: rgba(controls.color2, .72),
            boxShadow: `0 0 ${10 + 12 * glow}px ${rgba(controls.color2, .2 + .1 * intensity)}`, pointerEvents: 'none',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7 / speed, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (variant === 'magneticTilt') {
    return (
      <motion.div className={className} style={{ ...common, rotateX, rotateY, transformPerspective: 700 }} onPointerMove={onMove} onPointerLeave={reset}>
        {children}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 1px 0 ${rgba(controls.color1, .3)}, 0 16px ${20 + 12 * glow}px rgba(0,0,0,.2)`, pointerEvents: 'none' }} />
      </motion.div>
    )
  }

  if (variant === 'neonRipple') {
    return (
      <div className={className} style={common}>
        {children}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            style={{ position: 'absolute', inset: '8%', borderRadius: '50%', border: `${Math.max(1, intensity)}px solid ${rgba(i ? controls.color2 : controls.color1, .68)}`, boxShadow: `0 0 ${8 + 10 * glow}px ${rgba(controls.color2, .2)}`, pointerEvents: 'none' }}
            animate={{ scale: [1, 1.35 + .2 * intensity], opacity: [.72 * opacity, 0] }}
            transition={{ duration: 2.4 / speed, repeat: Infinity, ease: 'easeOut', delay: (i * 1.2) / speed }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'glassShine') {
    return (
      <div className={className} style={common}>
        {children}
        <motion.div
          aria-hidden="true"
          style={{ position: 'absolute', top: '-24%', bottom: '-24%', width: `${24 + intensity * 12}%`, left: '-42%', transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, ${rgba(controls.color1, .34 + .18 * intensity)}, ${rgba(controls.color2, .18)}, transparent)`, filter: `blur(${3 + glow * 2}px)`, pointerEvents: 'none' }}
          animate={{ left: ['-42%', '118%'] }}
          transition={{ duration: 3.8 / speed, repeat: Infinity, repeatDelay: 1.8 / speed, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  return (
    <div className={className} style={common}>
      {children}
      <motion.div
        aria-hidden="true"
        style={{ position: 'absolute', inset: '-3%', borderRadius: '50%', border: `${Math.max(1, intensity)}px solid ${rgba(controls.color1, .58)}`, boxShadow: `0 0 ${10 + 12 * glow}px ${rgba(controls.color1, .2)}, inset 0 0 ${10 + 8 * glow}px ${rgba(controls.color2, .12)}`, pointerEvents: 'none' }}
        animate={{ opacity: [.35 * opacity, .9 * opacity, .35 * opacity], scale: [1, 1 + .025 * intensity, 1] }}
        transition={{ duration: 4.6 / speed, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
