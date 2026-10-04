'use client'

export type BackgroundControlKey =
  | 'color1'
  | 'color2'
  | 'color3'
  | 'speed'
  | 'intensity'
  | 'scale'
  | 'opacity'
  | 'density'
  | 'glow'
  | 'thickness'
  | 'rotation'
  | 'noise'
  | 'interaction'

export type BubbleControlKey =
  | 'color1'
  | 'color2'
  | 'speed'
  | 'intensity'
  | 'glow'
  | 'tilt'
  | 'opacity'

export interface BackgroundControlSettings {
  color1: string
  color2: string
  color3: string
  speed: number
  intensity: number
  scale: number
  opacity: number
  density: number
  glow: number
  thickness: number
  rotation: number
  noise: number
  interaction: number
}

export interface BubbleControlSettings {
  color1: string
  color2: string
  speed: number
  intensity: number
  glow: number
  tilt: number
  opacity: number
}

const backgroundBase: BackgroundControlSettings = {
  color1: '#ffffff',
  color2: '#7fd8ff',
  color3: '#c79cff',
  speed: 1,
  intensity: 1,
  scale: 1,
  opacity: 1,
  density: 1,
  glow: 1,
  thickness: 1,
  rotation: 0,
  noise: 0,
  interaction: 0,
}

const bubbleBase: BubbleControlSettings = {
  color1: '#ffffff',
  color2: '#7fd8ff',
  speed: 1,
  intensity: 1,
  glow: 1,
  tilt: 1,
  opacity: 1,
}

const bg = (overrides: Partial<BackgroundControlSettings> = {}): BackgroundControlSettings => ({ ...backgroundBase, ...overrides })
const bubble = (overrides: Partial<BubbleControlSettings> = {}): BubbleControlSettings => ({ ...bubbleBase, ...overrides })

export const defaultBackgroundControls: Record<string, BackgroundControlSettings> = {
  floatingLines: bg({ color1: '#ffffff', color2: '#87cfff', opacity: .48, density: 1, thickness: 1 }),
  ghostFibers: bg({ color1: '#140E35', color2: '#3437A0', speed: 1, scale: 1, density: 1, glow: 1, rotation: .25, noise: .05 }),
  rippleDistortion: bg({ color1: '#a855f7', color2: '#ffffff', intensity: 1, density: 1, glow: .2, interaction: .7 }),
  webThreads: bg({ color1: '#5227FF', color2: '#FF9FFC', color3: '#FFFFFF', speed: 1, intensity: 1, scale: 1, opacity: 1, density: 1, glow: 1, thickness: 1, noise: .05, interaction: .3 }),
  magicRings: bg({ color1: '#fc42ff', color2: '#42fcff', speed: 1, intensity: 1, opacity: 1, density: 1, glow: 1, thickness: 1, rotation: 0, noise: 1, interaction: 0 }),
  auroraWaves: bg({ color1: '#aefff4', color2: '#9874ff', color3: '#51bcff', speed: 1, intensity: 1, scale: 1, opacity: .9, density: 1, glow: 1 }),
  nebulaFlow: bg({ color1: '#8048ff', color2: '#2dc6ff', color3: '#ff66ce', speed: 1, intensity: 1, scale: 1, opacity: .88, density: 1, glow: 1.1 }),
  liquidLight: bg({ color1: '#ffffff', color2: '#6ab5ff', color3: '#d574ff', speed: 1, intensity: 1, scale: 1, opacity: .85, density: 1, glow: 1 }),
  prismTunnel: bg({ color1: '#78d7ff', color2: '#ff82f5', color3: '#ffffff', speed: 1, intensity: 1, scale: 1, opacity: .85, density: 1, glow: 1 }),
  particleVeil: bg({ color1: '#d9f8ff', color2: '#c0a7ff', color3: '#ffffff', speed: 1, intensity: 1, scale: 1, opacity: .9, density: 1, glow: 1.2 }),
  starPulse: bg({ color1: '#ffffff', color2: '#bedcff', color3: '#a78bfa', speed: 1, intensity: 1, scale: 1, opacity: .9, density: 1, glow: 1.2 }),
}

export const defaultBubbleControls: Record<string, BubbleControlSettings> = {
  none: bubble(),
  tiltedCard: bubble({ tilt: 1 }),
  glareHover: bubble({ color1: '#ffffff', intensity: 1.1, glow: 1.1 }),
  borderGlow: bubble({ color1: '#a855f7', color2: '#6ee7ff', intensity: 1.1, glow: 1.3 }),
  splashCursor: bubble({ color1: '#ffffff', color2: '#7fd8ff', speed: 1, intensity: 1 }),
  rippleDistortion: bubble({ color1: '#ffffff', color2: '#a855f7', speed: 1, intensity: 1 }),
  softPulse: bubble({ color1: '#d7e6ff', color2: '#ffffff', speed: 1, intensity: 1, glow: 1 }),
  orbitGlow: bubble({ color1: '#ffffff', color2: '#7ed0ff', speed: 1, intensity: 1, glow: 1 }),
  magneticTilt: bubble({ color1: '#ffffff', color2: '#9bbdff', tilt: 1.1, intensity: 1 }),
  neonRipple: bubble({ color1: '#aad2ff', color2: '#d49cff', speed: 1, intensity: 1, glow: 1 }),
  glassShine: bubble({ color1: '#ffffff', color2: '#d7edff', speed: 1, intensity: 1 }),
  haloRing: bubble({ color1: '#ffffff', color2: '#91b7ff', speed: 1, intensity: 1, glow: 1 }),
}

export const backgroundCapabilities: Record<string, BackgroundControlKey[]> = {
  floatingLines: ['color1', 'color2', 'speed', 'opacity', 'density', 'scale', 'thickness'],
  ghostFibers: ['color1', 'color2', 'speed', 'intensity', 'scale', 'density', 'glow', 'rotation', 'noise'],
  rippleDistortion: ['color1', 'color2', 'intensity', 'scale', 'density', 'glow', 'rotation', 'noise', 'interaction'],
  webThreads: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'density', 'glow', 'thickness', 'noise', 'interaction'],
  magicRings: ['color1', 'color2', 'speed', 'intensity', 'opacity', 'density', 'glow', 'thickness', 'rotation', 'noise', 'interaction'],
  auroraWaves: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'glow'],
  nebulaFlow: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'glow'],
  liquidLight: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'density', 'glow'],
  prismTunnel: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'density', 'glow', 'rotation'],
  particleVeil: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'density', 'glow'],
  starPulse: ['color1', 'color2', 'color3', 'speed', 'intensity', 'scale', 'opacity', 'density', 'glow'],
}

export const bubbleCapabilities: Record<string, BubbleControlKey[]> = {
  none: [],
  tiltedCard: ['tilt'],
  glareHover: ['color1', 'intensity', 'glow', 'opacity'],
  borderGlow: ['color1', 'color2', 'intensity', 'glow', 'opacity'],
  splashCursor: ['color1', 'color2', 'speed', 'intensity', 'opacity'],
  rippleDistortion: ['color1', 'color2', 'intensity', 'glow', 'opacity'],
  softPulse: ['color1', 'color2', 'speed', 'intensity', 'glow', 'opacity'],
  orbitGlow: ['color1', 'color2', 'speed', 'intensity', 'glow', 'opacity'],
  magneticTilt: ['color1', 'color2', 'intensity', 'glow', 'tilt', 'opacity'],
  neonRipple: ['color1', 'color2', 'speed', 'intensity', 'glow', 'opacity'],
  glassShine: ['color1', 'color2', 'speed', 'intensity', 'opacity'],
  haloRing: ['color1', 'color2', 'speed', 'intensity', 'glow', 'opacity'],
}

export function mergeBackgroundControls(saved?: Record<string, Partial<BackgroundControlSettings>>) {
  return Object.fromEntries(
    Object.entries(defaultBackgroundControls).map(([key, value]) => [key, { ...value, ...(saved?.[key] ?? {}) }])
  ) as Record<string, BackgroundControlSettings>
}

export function mergeBubbleControls(saved?: Record<string, Partial<BubbleControlSettings>>) {
  return Object.fromEntries(
    Object.entries(defaultBubbleControls).map(([key, value]) => [key, { ...value, ...(saved?.[key] ?? {}) }])
  ) as Record<string, BubbleControlSettings>
}
