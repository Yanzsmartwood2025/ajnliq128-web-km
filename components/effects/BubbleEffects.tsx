'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import React from 'react'

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
}

export default function BubbleEffectFrame({ variant, children, className = '' }: Props) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 18 })
  const sy = useSpring(my, { stiffness: 180, damping: 18 })
  const rotateY = useTransform(sx, [-1, 1], [-8, 8])
  const rotateX = useTransform(sy, [-1, 1], [8, -8])

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
  }

  if (variant === 'softPulse') {
    return (
      <motion.div className={className} style={common} animate={{ scale: [1, 1.035, 1], boxShadow: ['0 0 0 rgba(255,255,255,0)', '0 0 34px rgba(215,230,255,.28)', '0 0 0 rgba(255,255,255,0)'] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>
        {children}
      </motion.div>
    )
  }

  if (variant === 'orbitGlow') {
    return (
      <div className={className} style={common}>
        {children}
        <motion.div aria-hidden="true" style={{ position: 'absolute', inset: '-4%', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,.86)', borderRightColor: 'rgba(126,208,255,.66)', boxShadow: '0 0 18px rgba(128,190,255,.25)', pointerEvents: 'none' }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  if (variant === 'magneticTilt') {
    return (
      <motion.div className={className} style={{ ...common, rotateX, rotateY, transformPerspective: 700 }} onPointerMove={onMove} onPointerLeave={reset}>
        {children}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.34), 0 16px 32px rgba(0,0,0,.2)', pointerEvents: 'none' }} />
      </motion.div>
    )
  }

  if (variant === 'neonRipple') {
    return (
      <div className={className} style={common}>
        {children}
        {[0, 1].map((i) => (
          <motion.div key={i} aria-hidden="true" style={{ position: 'absolute', inset: '8%', borderRadius: '50%', border: '1px solid rgba(170,210,255,.7)', pointerEvents: 'none' }} animate={{ scale: [1, 1.55], opacity: [.72, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: i * 1.2 }} />
        ))}
      </div>
    )
  }

  if (variant === 'glassShine') {
    return (
      <div className={className} style={common}>
        {children}
        <motion.div aria-hidden="true" style={{ position: 'absolute', top: '-24%', bottom: '-24%', width: '34%', left: '-42%', transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)', filter: 'blur(5px)', pointerEvents: 'none' }} animate={{ left: ['-42%', '118%'] }} transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }} />
      </div>
    )
  }

  return (
    <div className={className} style={common}>
      {children}
      <motion.div aria-hidden="true" style={{ position: 'absolute', inset: '-3%', borderRadius: '50%', border: '1px solid rgba(255,255,255,.58)', boxShadow: '0 0 18px rgba(255,255,255,.2), inset 0 0 16px rgba(145,183,255,.12)', pointerEvents: 'none' }} animate={{ opacity: [.35, .9, .35], scale: [1, 1.025, 1] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  )
}
