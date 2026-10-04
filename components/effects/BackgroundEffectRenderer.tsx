'use client'

import dynamic from 'next/dynamic'
import type { BackgroundControlSettings } from './effect-settings'
import type { AmbientBackgroundType } from './AmbientBackgrounds'

const FloatingLines = dynamic(() => import('@/components/ui/floating-lines').then((mod) => mod.FloatingLines), { ssr: false })
const GhostFibers = dynamic(() => import('@/components/GhostFibers'), { ssr: false })
const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const WebThreads = dynamic(() => import('@/components/WebThreads'), { ssr: false })
const MagicRings = dynamic(() => import('@/components/MagicRings'), { ssr: false })
const AmbientBackground = dynamic(() => import('@/components/effects/AmbientBackgrounds'), { ssr: false })

const ambientTypes = new Set<AmbientBackgroundType>([
  'auroraWaves',
  'nebulaFlow',
  'liquidLight',
  'prismTunnel',
  'particleVeil',
  'starPulse',
])

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function BackgroundEffectRenderer({ type, controls }: { type: string; controls: BackgroundControlSettings }) {
  if (type === 'floatingLines') {
    return (
      <FloatingLines
        color={controls.color1}
        color2={controls.color2}
        speed={controls.speed}
        density={controls.density}
        length={controls.scale}
        thickness={controls.thickness}
        opacity={controls.opacity}
      />
    )
  }

  if (type === 'ghostFibers') {
    return (
      <GhostFibers
        lineColor={controls.color1}
        glowColor={controls.color2}
        speed={0.2 * clamp(controls.speed, 0.2, 3)}
        scale={2 * clamp(controls.scale, 0.5, 2)}
        rotationSpeed={clamp(controls.rotation, -1, 1)}
        layers={clamp(Math.round(4 * controls.density), 1, 10)}
        glowIntensity={1.6 * controls.glow * controls.intensity}
        brightness={2 * controls.intensity}
        grain={clamp(controls.noise, 0, 1) * 0.12}
      />
    )
  }

  if (type === 'rippleDistortion') {
    return (
      <RippleDistortion
        tint={controls.color1}
        highlightColor={controls.color2}
        strength={0.08 + 0.24 * controls.intensity}
        swirl={1 + controls.rotation * 2}
        rings={clamp(Math.round(4 * controls.density), 1, 10)}
        spread={clamp(5 * controls.scale, 2, 10)}
        fade={clamp(3 / Math.max(controls.speed, .2), .8, 8)}
        dispersion={clamp(controls.noise * .8, 0, 1)}
        glint={clamp(controls.glow, 0, 2)}
        tintAmount={clamp(.08 + controls.intensity * .18, 0, .75)}
        clickStrength={1 + controls.interaction * 2.5}
        trigger={controls.interaction > .65 ? 'both' : controls.interaction > .15 ? 'hover' : 'click'}
      />
    )
  }

  if (type === 'webThreads') {
    return (
      <WebThreads
        color1={controls.color1}
        color2={controls.color2}
        color3={controls.color3}
        speed={0.2 * clamp(controls.speed, .2, 3)}
        threadCount={clamp(Math.round(6 * controls.density), 1, 10)}
        spread={clamp(.18 * controls.scale, .05, .5)}
        glow={clamp(.02 * controls.glow, .003, .08)}
        thickness={clamp(1.1 * controls.thickness, .35, 3)}
        brightness={clamp(.6 * controls.intensity, .15, 1.8)}
        opacity={clamp(controls.opacity, 0, 1)}
        shimmer={controls.glow > 1.15}
        grain={controls.noise > .02}
        grainIntensity={clamp(controls.noise * .12, 0, .18)}
        mouseInteraction={controls.interaction > .03}
        mouseStrength={clamp(controls.interaction, 0, 1)}
      />
    )
  }

  if (type === 'magicRings') {
    return (
      <MagicRings
        color={controls.color1}
        colorTwo={controls.color2}
        speed={clamp(controls.speed, .2, 3)}
        ringCount={clamp(Math.round(6 * controls.density), 1, 10)}
        attenuation={clamp(13 - controls.glow * 3.5, 5, 14)}
        lineThickness={clamp(2 * controls.thickness, .5, 5)}
        scaleRate={0}
        opacity={clamp(controls.opacity * controls.intensity, .08, 1)}
        noiseAmount={clamp(.035 * controls.noise, 0, .06)}
        rotation={controls.rotation * 180}
        followMouse={controls.interaction > .03}
        mouseInfluence={clamp(.24 * controls.interaction, 0, .3)}
        parallax={clamp(.08 * controls.interaction, 0, .1)}
        hoverScale={1 + .12 * controls.interaction}
      />
    )
  }

  if (ambientTypes.has(type as AmbientBackgroundType)) {
    return <AmbientBackground variant={type as AmbientBackgroundType} controls={controls} />
  }

  return null
}
