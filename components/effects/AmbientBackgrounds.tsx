'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { BackgroundControlSettings } from './effect-settings'

export type AmbientBackgroundType =
  | 'auroraWaves'
  | 'nebulaFlow'
  | 'liquidLight'
  | 'prismTunnel'
  | 'particleVeil'
  | 'starPulse'

type Props = {
  variant: AmbientBackgroundType
  controls: BackgroundControlSettings
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const duration = (base: number, speed: number) => base / clamp(speed, .2, 3)

const rgba = (hex: string, alpha: number) => {
  const raw = hex.replace('#', '').trim()
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return `rgba(255,255,255,${alpha})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(alpha, 0, 1)})`
}

const shell: CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  background: '#050507',
}

const particles = Array.from({ length: 52 }, (_, i) => ({
  left: `${(i * 37) % 97}%`,
  top: `${(i * 53) % 91}%`,
  size: 1.5 + (i % 4) * .8,
  delay: (i % 9) * .22,
}))

export default function AmbientBackground({ variant, controls }: Props) {
  const speed = clamp(controls.speed, .2, 3)
  const intensity = clamp(controls.intensity, .2, 2)
  const scale = clamp(controls.scale, .55, 1.8)
  const opacity = clamp(controls.opacity, .05, 1)
  const density = clamp(controls.density, .4, 2)
  const glow = clamp(controls.glow, 0, 2)
  const blurBase = 26 + glow * 18
  const particleCount = clamp(Math.round(26 * density), 8, particles.length)

  if (variant === 'auroraWaves') {
    return (
      <div style={shell}>
        <motion.div
          style={{
            position: 'absolute', inset: '-18%', borderRadius: '42%', mixBlendMode: 'screen',
            background: `radial-gradient(ellipse at 28% 42%, ${rgba(controls.color1, .74 * intensity)}, transparent 46%), radial-gradient(ellipse at 72% 58%, ${rgba(controls.color2, .64 * intensity)}, transparent 48%)`,
            opacity,
          }}
          animate={{ x: ['-6%', '5%', '-2%'], y: ['2%', '-5%', '3%'], rotate: [-6, 5, -3], scale: [scale, scale * 1.12, scale * 1.04], filter: [`blur(${blurBase}px)`, `blur(${blurBase + 6}px)`, `blur(${blurBase + 2}px)`] }}
          transition={{ duration: duration(16, speed), repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{
            position: 'absolute', inset: '-18%', borderRadius: '42%', mixBlendMode: 'screen',
            background: `radial-gradient(ellipse at 50% 72%, ${rgba(controls.color3, .38 * intensity)}, transparent 42%), radial-gradient(ellipse at 45% 28%, ${rgba(controls.color2, .48 * intensity)}, transparent 46%)`,
            opacity: opacity * .78,
          }}
          animate={{ x: ['4%', '-4%', '3%'], y: ['-4%', '3%', '-2%'], rotate: [4, -4, 2], scale: [scale * 1.08, scale * .98, scale * 1.1], filter: [`blur(${blurBase + 4}px)`, `blur(${blurBase + 10}px)`, `blur(${blurBase + 5}px)`] }}
          transition={{ duration: duration(20, speed), repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  if (variant === 'nebulaFlow') {
    return (
      <div style={shell}>
        <motion.div
          style={{
            position: 'absolute', inset: '-18%', borderRadius: '42%', mixBlendMode: 'screen',
            background: `radial-gradient(circle at 30% 45%, ${rgba(controls.color1, .72 * intensity)}, transparent 34%), radial-gradient(circle at 66% 48%, ${rgba(controls.color2, .58 * intensity)}, transparent 33%), radial-gradient(circle at 50% 72%, ${rgba(controls.color3, .42 * intensity)}, transparent 32%)`,
            opacity,
          }}
          animate={{ rotate: [0, 16, -10, 0], scale: [scale, scale * 1.16, scale * 1.03, scale], x: ['-3%', '4%', '-2%', '-3%'], filter: [`blur(${blurBase + 8}px)`, `blur(${blurBase + 15}px)`, `blur(${blurBase + 6}px)`, `blur(${blurBase + 8}px)`] }}
          transition={{ duration: duration(22, speed), repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  if (variant === 'liquidLight') {
    const count = clamp(Math.round(3 * density), 2, 5)
    return (
      <div style={{ ...shell, background: 'linear-gradient(145deg,#07070a,#111126)' }}>
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${66 - i * 7}%`,
              height: `${124 - i * 11}%`,
              left: `${-2 + i * (88 / Math.max(count - 1, 1))}%`,
              top: '-12%',
              borderRadius: '50%',
              background: rgba([controls.color1, controls.color2, controls.color3][i % 3], (.24 + (i % 2) * .05) * intensity),
              filter: `blur(${blurBase}px)`,
              mixBlendMode: 'screen',
              opacity,
            }}
            animate={{ x: ['-14%', '12%', '-8%'], y: ['2%', '-5%', '4%'], rotate: [-18 + i * 8, 14 - i * 7, -18 + i * 8], scaleX: [scale, scale * 1.28, scale * .94], scaleY: [scale * 1.08, scale * .92, scale * 1.12] }}
            transition={{ duration: duration(13 + i * 3, speed), repeat: Infinity, ease: 'easeInOut', delay: i * .35 }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'prismTunnel') {
    const count = clamp(Math.round(5 * density), 3, 9)
    const direction = controls.rotation < 0 ? -1 : 1
    const offset = Math.abs(controls.rotation) * 22
    return (
      <div style={shell}>
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              inset: `${6 + i * (36 / Math.max(count - 1, 1))}%`,
              borderRadius: '50%',
              border: `1px solid ${rgba(i % 2 ? controls.color1 : controls.color2, clamp((.54 - i * .04) * intensity, .08, .8))}`,
              boxShadow: `0 0 ${16 + glow * 18}px ${rgba(controls.color3, .12 * glow)}`,
              transformOrigin: '50% 50%',
              opacity,
            }}
            animate={{ rotate: [i * 7 + offset, direction * 360 + i * 7 + offset], scale: [scale, scale * 1.06, scale] }}
            transition={{ rotate: { duration: duration(28 + i * 3, speed), repeat: Infinity, ease: 'linear' }, scale: { duration: duration(5 + i * .4, speed), repeat: Infinity, ease: 'easeInOut' } }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${rgba(controls.color3, .14 * intensity)}, transparent 48%)`, opacity }} />
      </div>
    )
  }

  if (variant === 'particleVeil') {
    return (
      <div style={{ ...shell, background: `radial-gradient(circle at 50% 45%, ${rgba(controls.color2, .14)}, #050507 72%)` }}>
        {particles.slice(0, particleCount).map((p, i) => {
          const color = [controls.color1, controls.color2, controls.color3][i % 3]
          return (
            <motion.span
              key={i}
              style={{ position: 'absolute', left: p.left, top: p.top, width: p.size * scale, height: p.size * scale, borderRadius: '50%', background: color, boxShadow: `0 0 ${5 + glow * 9}px ${rgba(color, .8)}`, opacity }}
              animate={{ y: [0, -32 - (i % 5) * 8, 0], x: [0, i % 2 ? 12 : -12, 0], opacity: [.12 * opacity, clamp(.72 * intensity * opacity, .2, 1), .12 * opacity], scale: [.7, 1.35, .7] }}
              transition={{ duration: duration(7 + (i % 6), speed), repeat: Infinity, ease: 'easeInOut', delay: p.delay / speed }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ ...shell, background: `radial-gradient(circle at 50% 50%, ${rgba(controls.color3, .16)}, #050507 68%)` }}>
      {particles.slice(0, clamp(Math.round(18 * density), 6, particles.length)).map((p, i) => {
        const color = i % 3 === 0 ? controls.color1 : i % 3 === 1 ? controls.color2 : controls.color3
        return (
          <motion.span
            key={i}
            style={{ position: 'absolute', left: p.left, top: p.top, width: (p.size + 1) * scale, height: (p.size + 1) * scale, borderRadius: '50%', background: color, boxShadow: `0 0 ${8 + glow * 12}px ${rgba(color, .82)}` }}
            animate={{ opacity: [.1 * opacity, clamp(intensity * opacity, .25, 1), .1 * opacity], scale: [.5, 1.6, .5] }}
            transition={{ duration: duration(2.6 + (i % 5) * .65, speed), repeat: Infinity, ease: 'easeInOut', delay: p.delay / speed }}
          />
        )
      })}
      <motion.div
        style={{ position: 'absolute', inset: '22%', borderRadius: '50%', background: `radial-gradient(circle, ${rgba(controls.color2, .3 * intensity)}, transparent 62%)`, filter: `blur(${18 + glow * 12}px)`, opacity }}
        animate={{ scale: [scale * .86, scale * 1.18, scale * .86], opacity: [.2 * opacity, .62 * opacity, .2 * opacity] }}
        transition={{ duration: duration(6.5, speed), repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
