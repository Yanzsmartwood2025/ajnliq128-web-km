import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')

const registry = read('components/effects/effect-settings.ts')
const panel = read('components/BackgroundSettings.tsx')
const renderer = read('components/effects/BackgroundEffectRenderer.tsx')
const ambient = read('components/effects/AmbientBackgrounds.tsx')
const bubbles = read('components/effects/BubbleEffects.tsx')

const backgrounds = [
  'floatingLines', 'ghostFibers', 'rippleDistortion', 'webThreads', 'magicRings',
  'auroraWaves', 'nebulaFlow', 'liquidLight', 'prismTunnel', 'particleVeil', 'starPulse',
]

const bubbleEffects = [
  'none', 'tiltedCard', 'glareHover', 'borderGlow', 'splashCursor', 'rippleDistortion',
  'softPulse', 'orbitGlow', 'magneticTilt', 'neonRipple', 'glassShine', 'haloRing',
]

const fail = (message) => {
  console.error(`[effects] ${message}`)
  process.exitCode = 1
}

for (const id of backgrounds) {
  if (!registry.includes(`${id}:`)) fail(`missing background defaults/capabilities: ${id}`)
  if (!panel.includes(`id: '${id}'`)) fail(`background missing from selector: ${id}`)
  const rendered = renderer.includes(`type === '${id}'`) || ambient.includes(`'${id}'`)
  if (!rendered) fail(`background missing renderer: ${id}`)
}

for (const id of bubbleEffects) {
  if (!registry.includes(`${id}:`)) fail(`missing bubble defaults/capabilities: ${id}`)
  if (!panel.includes(`id: '${id}'`)) fail(`bubble effect missing from selector: ${id}`)
  const rendered = id === 'none' || panel.includes('effectOverride={localSettings.bubbleEffect}')
  if (!rendered) fail(`bubble effect preview path missing: ${id}`)
}

const previewCount = panel.split('Vista previa en vivo').length - 1
if (previewCount < 2) fail('both Fondo and Botones must have live previews')
if (!panel.includes("'basic' | 'advanced'")) fail('basic/advanced controls are missing')
if (!panel.includes('Restablecer')) fail('per-effect reset is missing')

if (!process.exitCode) console.log(`[effects] Verified ${backgrounds.length} backgrounds, ${bubbleEffects.length} bubble effects, live previews and controls.`)
