'use client'

import { motion } from 'framer-motion'

export type AmbientBackgroundType =
  | 'auroraWaves'
  | 'nebulaFlow'
  | 'liquidLight'
  | 'prismTunnel'
  | 'particleVeil'
  | 'starPulse'

type Props = { variant: AmbientBackgroundType }

const shell: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  background: '#050507',
}

const layer: React.CSSProperties = {
  position: 'absolute',
  inset: '-18%',
  borderRadius: '42%',
  filter: 'blur(42px)',
  mixBlendMode: 'screen',
}

const particles = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 97}%`,
  top: `${(i * 53) % 91}%`,
  size: 1.5 + (i % 4) * 0.8,
  delay: (i % 9) * 0.22,
}))

export default function AmbientBackground({ variant }: Props) {
  if (variant === 'auroraWaves') {
    return (
      <div style={shell}>
        <motion.div
          style={{ ...layer, background: 'radial-gradient(ellipse at 28% 42%, rgba(174,255,244,.78), transparent 46%), radial-gradient(ellipse at 72% 58%, rgba(152,116,255,.66), transparent 48%)' }}
          animate={{ x: ['-6%', '5%', '-2%'], y: ['2%', '-5%', '3%'], rotate: [-6, 5, -3], scale: [1, 1.12, 1.04], filter: ['blur(42px) hue-rotate(0deg)', 'blur(48px) hue-rotate(34deg)', 'blur(44px) hue-rotate(-18deg)'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{ ...layer, background: 'radial-gradient(ellipse at 50% 72%, rgba(255,255,255,.44), transparent 42%), radial-gradient(ellipse at 45% 28%, rgba(81,188,255,.52), transparent 46%)', opacity: .76 }}
          animate={{ x: ['4%', '-4%', '3%'], y: ['-4%', '3%', '-2%'], rotate: [4, -4, 2], scale: [1.08, .98, 1.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  if (variant === 'nebulaFlow') {
    return (
      <div style={shell}>
        <motion.div
          style={{ ...layer, background: 'radial-gradient(circle at 30% 45%, rgba(128,72,255,.76), transparent 34%), radial-gradient(circle at 66% 48%, rgba(45,198,255,.6), transparent 33%), radial-gradient(circle at 50% 72%, rgba(255,102,206,.42), transparent 32%)', filter: 'blur(55px)' }}
          animate={{ rotate: [0, 16, -10, 0], scale: [1, 1.16, 1.03, 1], x: ['-3%', '4%', '-2%', '-3%'], opacity: [.7, .92, .74, .7] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  if (variant === 'liquidLight') {
    return (
      <div style={{ ...shell, background: 'linear-gradient(145deg,#07070a,#111126)' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${62 - i * 7}%`,
              height: `${120 - i * 12}%`,
              left: `${4 + i * 30}%`,
              top: '-10%',
              borderRadius: '50%',
              background: i === 0 ? 'rgba(255,255,255,.28)' : i === 1 ? 'rgba(106,181,255,.32)' : 'rgba(213,116,255,.3)',
              filter: 'blur(34px)',
              mixBlendMode: 'screen',
            }}
            animate={{ x: ['-14%', '12%', '-8%'], y: ['2%', '-5%', '4%'], rotate: [-18 + i * 8, 14 - i * 7, -18 + i * 8], scaleX: [1, 1.28, .94], scaleY: [1.08, .92, 1.12] }}
            transition={{ duration: 13 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * .8 }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'prismTunnel') {
    return (
      <div style={shell}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', inset: `${8 + i * 8}%`, borderRadius: '50%', border: `1px solid rgba(${i % 2 ? '120,215,255' : '255,130,245'},${.44 - i * .055})`, boxShadow: '0 0 28px rgba(160,175,255,.16)', transformOrigin: '50% 50%' }}
            animate={{ rotate: [i * 7, 360 + i * 7], scale: [1, 1.06, 1] }}
            transition={{ rotate: { duration: 28 + i * 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,.16), transparent 48%)' }} />
      </div>
    )
  }

  if (variant === 'particleVeil') {
    return (
      <div style={{ ...shell, background: 'radial-gradient(circle at 50% 45%, #15152a, #050507 72%)' }}>
        {particles.map((p, i) => (
          <motion.span
            key={i}
            style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: '50%', background: i % 3 === 0 ? '#d9f8ff' : i % 3 === 1 ? '#c0a7ff' : '#ffffff', boxShadow: '0 0 10px currentColor' }}
            animate={{ y: [0, -32 - (i % 5) * 8, 0], x: [0, (i % 2 ? 12 : -12), 0], opacity: [.18, .9, .18], scale: [.7, 1.35, .7] }}
            transition={{ duration: 7 + (i % 6), repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ ...shell, background: 'radial-gradient(circle at 50% 50%, #17172f 0%, #050507 68%)' }}>
      {particles.slice(0, 18).map((p, i) => (
        <motion.span
          key={i}
          style={{ position: 'absolute', left: p.left, top: p.top, width: p.size + 1, height: p.size + 1, borderRadius: '50%', background: '#fff', boxShadow: '0 0 16px rgba(190,220,255,.88)' }}
          animate={{ opacity: [.12, 1, .12], scale: [.5, 1.6, .5] }}
          transition={{ duration: 2.6 + (i % 5) * .65, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
      <motion.div
        style={{ position: 'absolute', inset: '22%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(205,220,255,.34), transparent 62%)', filter: 'blur(24px)' }}
        animate={{ scale: [.86, 1.18, .86], opacity: [.24, .64, .24] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
