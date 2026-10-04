'use client'

import { useMemo, useState } from 'react'
import { RotateCcw, Settings2 } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBackground, type BackgroundType, type BubbleEffectType } from './BackgroundManager'
import { BackgroundEffectRenderer } from './effects/BackgroundEffectRenderer'
import { BubbleWrapper } from './BubbleWrapper'
import {
  backgroundCapabilities,
  bubbleCapabilities,
  defaultBackgroundControls,
  defaultBubbleControls,
  type BackgroundControlKey,
  type BackgroundControlSettings,
  type BubbleControlKey,
  type BubbleControlSettings,
} from './effects/effect-settings'

const bgOptions: { id: BackgroundType; label: string }[] = [
  { id: 'floatingLines', label: 'Líneas Flotantes' },
  { id: 'ghostFibers', label: 'Ghost Fibers' },
  { id: 'rippleDistortion', label: 'Ripple Distortion' },
  { id: 'webThreads', label: 'Web Threads' },
  { id: 'magicRings', label: 'Magic Rings' },
  { id: 'auroraWaves', label: 'Aurora Waves' },
  { id: 'nebulaFlow', label: 'Nebula Flow' },
  { id: 'liquidLight', label: 'Liquid Light' },
  { id: 'prismTunnel', label: 'Prism Tunnel' },
  { id: 'particleVeil', label: 'Particle Veil' },
  { id: 'starPulse', label: 'Star Pulse' },
]

const bubbleOptions: { id: BubbleEffectType; label: string }[] = [
  { id: 'none', label: 'Ninguno' },
  { id: 'tiltedCard', label: 'Tilted Card' },
  { id: 'glareHover', label: 'Glare Hover' },
  { id: 'borderGlow', label: 'Border Glow' },
  { id: 'splashCursor', label: 'Splash Cursor' },
  { id: 'rippleDistortion', label: 'Ripple Distortion' },
  { id: 'softPulse', label: 'Soft Pulse' },
  { id: 'orbitGlow', label: 'Orbit Glow' },
  { id: 'magneticTilt', label: 'Magnetic Tilt' },
  { id: 'neonRipple', label: 'Neon Ripple' },
  { id: 'glassShine', label: 'Glass Shine' },
  { id: 'haloRing', label: 'Halo Ring' },
]

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

type ColorKey = 'color1' | 'color2' | 'color3'
type DetailMode = 'basic' | 'advanced'

type SliderConfig = {
  min: number
  max: number
  step: number
  label: string
  format?: (value: number) => string
}

const percent = (value: number) => `${Math.round(value * 100)}%`
const multiple = (value: number) => `${value.toFixed(2)}×`

function backgroundSliderConfig(type: BackgroundType, key: BackgroundControlKey): SliderConfig {
  if (key === 'speed') return { min: .2, max: 3, step: .05, label: 'Velocidad', format: multiple }
  if (key === 'intensity') return { min: .2, max: 2, step: .05, label: 'Intensidad', format: multiple }
  if (key === 'opacity') return { min: .05, max: 1, step: .01, label: 'Opacidad', format: percent }
  if (key === 'scale') return { min: .5, max: 2, step: .05, label: type === 'floatingLines' ? 'Longitud' : type === 'rippleDistortion' ? 'Extensión' : 'Escala', format: multiple }
  if (key === 'density') {
    const label = type === 'magicRings' || type === 'rippleDistortion' || type === 'prismTunnel' ? 'Anillos / densidad' : type === 'webThreads' ? 'Cantidad de hilos' : type === 'ghostFibers' || type === 'liquidLight' ? 'Capas / densidad' : 'Densidad'
    return { min: .4, max: 2, step: .05, label, format: multiple }
  }
  if (key === 'glow') return { min: 0, max: 2, step: .05, label: 'Brillo / Glow', format: multiple }
  if (key === 'thickness') return { min: .4, max: 2, step: .05, label: 'Grosor', format: multiple }
  if (key === 'rotation') return { min: -1, max: 1, step: .02, label: 'Rotación', format: (v) => `${Math.round(v * 180)}°` }
  if (key === 'noise') return { min: 0, max: 1, step: .01, label: 'Ruido / Grano', format: percent }
  return { min: 0, max: 1, step: .01, label: 'Interacción', format: percent }
}

function bubbleSliderConfig(key: BubbleControlKey): SliderConfig {
  if (key === 'speed') return { min: .2, max: 3, step: .05, label: 'Velocidad', format: multiple }
  if (key === 'intensity') return { min: .2, max: 2, step: .05, label: 'Intensidad', format: multiple }
  if (key === 'glow') return { min: 0, max: 2, step: .05, label: 'Brillo / Glow', format: multiple }
  if (key === 'tilt') return { min: .25, max: 2, step: .05, label: 'Inclinación', format: multiple }
  return { min: .05, max: 1, step: .01, label: 'Opacidad', format: percent }
}

function SliderRow({ config, value, onChange }: { config: SliderConfig; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl border border-white/12 bg-black/10 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-white/82">{config.label}</span>
        <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5 font-mono text-[10px] text-white/70">{config.format ? config.format(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-white"
      />
    </label>
  )
}

export function BackgroundSettings({ open: controlledOpen, onOpenChange, hideTrigger = false }: Props = {}) {
  const { settings, updateSettings } = useBackground()
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'fondo' | 'botones'>('fondo')
  const [detailMode, setDetailMode] = useState<DetailMode>('basic')
  const [activeColor, setActiveColor] = useState<ColorKey>('color1')
  const [localSettings, setLocalSettings] = useState(settings)
  const open = controlledOpen ?? internalOpen

  const bgControls = localSettings.backgroundControls[localSettings.type] ?? defaultBackgroundControls[localSettings.type]
  const bubbleControls = localSettings.bubbleControls[localSettings.bubbleEffect] ?? defaultBubbleControls[localSettings.bubbleEffect]
  const bgCaps = backgroundCapabilities[localSettings.type] ?? []
  const bubbleCaps = bubbleCapabilities[localSettings.bubbleEffect] ?? []

  const bgColorKeys = useMemo(() => (['color1', 'color2', 'color3'] as ColorKey[]).filter((key) => bgCaps.includes(key)), [bgCaps])
  const bubbleColorKeys = useMemo(() => (['color1', 'color2'] as ColorKey[]).filter((key) => bubbleCaps.includes(key as BubbleControlKey)), [bubbleCaps])

  const handleOpenChange = (isOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(isOpen)
    onOpenChange?.(isOpen)
    if (isOpen) {
      setLocalSettings(settings)
      setDetailMode('basic')
      setActiveColor('color1')
    }
  }

  const saveAndClose = () => {
    updateSettings(localSettings)
    handleOpenChange(false)
  }

  const selectBackground = (type: BackgroundType) => {
    setLocalSettings((prev) => ({ ...prev, type }))
    setActiveColor('color1')
    setDetailMode('basic')
  }

  const selectBubble = (bubbleEffect: BubbleEffectType) => {
    setLocalSettings((prev) => ({ ...prev, bubbleEffect }))
    setActiveColor('color1')
    setDetailMode('basic')
  }

  const updateBackgroundControl = (patch: Partial<BackgroundControlSettings>) => {
    setLocalSettings((prev) => ({
      ...prev,
      backgroundControls: {
        ...prev.backgroundControls,
        [prev.type]: { ...(prev.backgroundControls[prev.type] ?? defaultBackgroundControls[prev.type]), ...patch },
      },
    }))
  }

  const updateBubbleControl = (patch: Partial<BubbleControlSettings>) => {
    setLocalSettings((prev) => ({
      ...prev,
      bubbleControls: {
        ...prev.bubbleControls,
        [prev.bubbleEffect]: { ...(prev.bubbleControls[prev.bubbleEffect] ?? defaultBubbleControls[prev.bubbleEffect]), ...patch },
      },
    }))
  }

  const resetCurrent = () => {
    if (activeTab === 'fondo') {
      updateBackgroundControl({ ...defaultBackgroundControls[localSettings.type] })
    } else {
      updateBubbleControl({ ...defaultBubbleControls[localSettings.bubbleEffect] })
    }
    setActiveColor('color1')
  }

  const activeColorKeys = activeTab === 'fondo' ? bgColorKeys : bubbleColorKeys
  const selectedColorKey = activeColorKeys.includes(activeColor) ? activeColor : activeColorKeys[0] ?? 'color1'
  const selectedColor = activeTab === 'fondo' ? bgControls[selectedColorKey] : bubbleControls[selectedColorKey as 'color1' | 'color2']

  const renderColors = () => {
    if (activeColorKeys.length === 0) return null
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {activeColorKeys.map((key, index) => {
            const value = activeTab === 'fondo' ? bgControls[key] : bubbleControls[key as 'color1' | 'color2']
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveColor(key)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${selectedColorKey === key ? 'border-white/55 bg-white/20 text-white' : 'border-white/12 bg-white/6 text-white/65 hover:bg-white/12'}`}
              >
                <span className="h-3 w-3 rounded-full border border-white/35" style={{ background: value }} />
                Color {index + 1}
              </button>
            )
          })}
        </div>
        <div className="flex justify-center rounded-2xl border border-white/10 bg-black/10 p-3">
          <HexColorPicker
            color={selectedColor}
            onChange={(color) => activeTab === 'fondo' ? updateBackgroundControl({ [selectedColorKey]: color }) : updateBubbleControl({ [selectedColorKey]: color })}
          />
        </div>
      </div>
    )
  }

  const bgBasic = bgCaps.filter((key) => ['speed', 'intensity', 'opacity'].includes(key))
  const bgAdvanced = bgCaps.filter((key) => ['scale', 'density', 'glow', 'thickness', 'rotation', 'noise', 'interaction'].includes(key))
  const bubbleBasic = bubbleCaps.filter((key) => ['speed', 'intensity', 'opacity'].includes(key))
  const bubbleAdvanced = bubbleCaps.filter((key) => ['glow', 'tilt'].includes(key))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger className="login-button" aria-label="Opciones" title="Opciones" style={{ marginLeft: '10px' }}>
          <Settings2 size={16} />
        </DialogTrigger>
      )}

      <DialogContent
        className="sm:max-w-[540px] max-h-[88vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,.31), rgba(255,255,255,.12) 48%, rgba(255,255,255,.07))',
          backdropFilter: 'blur(32px) saturate(145%)',
          WebkitBackdropFilter: 'blur(32px) saturate(145%)',
          border: '1px solid rgba(255,255,255,.48)',
          borderRadius: '32px',
          boxShadow: '0 28px 90px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.48)',
          color: '#fff',
          padding: '1.5rem',
        }}
      >
        <DialogHeader><DialogTitle>Opciones</DialogTitle></DialogHeader>

        <div className="mb-4 flex gap-4 border-b border-white/20 pb-2">
          <button className={`pb-2 text-sm font-medium ${activeTab === 'fondo' ? 'border-b-2 border-white text-white' : 'text-white/60'}`} onClick={() => { setActiveTab('fondo'); setDetailMode('basic'); setActiveColor('color1') }}>Fondo</button>
          <button className={`pb-2 text-sm font-medium ${activeTab === 'botones' ? 'border-b-2 border-white text-white' : 'text-white/60'}`} onClick={() => { setActiveTab('botones'); setDetailMode('basic'); setActiveColor('color1') }}>Botones</button>
        </div>

        {activeTab === 'fondo' ? (
          <div className="space-y-5">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/20 bg-black/35">
              <BackgroundEffectRenderer type={localSettings.type} controls={bgControls} />
              <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[10px] text-white/85 backdrop-blur-md">Vista previa en vivo</span>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-white/85">Efecto</h4>
              <div className="grid grid-cols-2 gap-2">
                {bgOptions.map((opt) => (
                  <button key={opt.id} onClick={() => selectBackground(opt.id)} className={`rounded-xl border p-2.5 text-left text-xs transition-all ${localSettings.type === opt.id ? 'border-white/60 bg-white/25' : 'border-white/15 bg-white/7 hover:bg-white/13'}`}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-full border border-white/12 bg-black/10 p-1">
                <button className={`rounded-full px-3 py-1.5 text-xs ${detailMode === 'basic' ? 'bg-white/22 text-white' : 'text-white/55'}`} onClick={() => setDetailMode('basic')}>Básico</button>
                <button className={`rounded-full px-3 py-1.5 text-xs ${detailMode === 'advanced' ? 'bg-white/22 text-white' : 'text-white/55'}`} onClick={() => setDetailMode('advanced')}>Avanzado</button>
              </div>
              <button onClick={resetCurrent} className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs text-white/72 hover:bg-white/13"><RotateCcw size={12} /> Restablecer</button>
            </div>

            {detailMode === 'basic' ? (
              <div className="space-y-4">
                {renderColors()}
                <div className="grid gap-2 sm:grid-cols-2">
                  {bgBasic.map((key) => <SliderRow key={key} config={backgroundSliderConfig(localSettings.type, key)} value={bgControls[key] as number} onChange={(value) => updateBackgroundControl({ [key]: value })} />)}
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {bgAdvanced.length ? bgAdvanced.map((key) => <SliderRow key={key} config={backgroundSliderConfig(localSettings.type, key)} value={bgControls[key] as number} onChange={(value) => updateBackgroundControl({ [key]: value })} />) : <p className="text-sm text-white/60">Este efecto no necesita controles avanzados adicionales.</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.12),rgba(0,0,0,.35)_65%)]">
              <div style={{ width: 104, height: 104, position: 'relative' }}>
                <BubbleWrapper effectOverride={localSettings.bubbleEffect} controlsOverride={bubbleControls}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(145deg, ${bubbleControls.color1}44, ${bubbleControls.color2}33 52%, rgba(0,0,0,.52))`, border: '1px solid rgba(255,255,255,.22)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '.14em' }}>AJ</div>
                </BubbleWrapper>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"><span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[10px] text-white/85 backdrop-blur-md">Vista previa en vivo</span></div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-white/85">Efecto del círculo</h4>
              <div className="grid grid-cols-2 gap-2">
                {bubbleOptions.map((opt) => (
                  <button key={opt.id} onClick={() => selectBubble(opt.id)} className={`rounded-xl border p-2.5 text-left text-xs transition-all ${localSettings.bubbleEffect === opt.id ? 'border-white/60 bg-white/25' : 'border-white/15 bg-white/7 hover:bg-white/13'}`}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-full border border-white/12 bg-black/10 p-1">
                <button className={`rounded-full px-3 py-1.5 text-xs ${detailMode === 'basic' ? 'bg-white/22 text-white' : 'text-white/55'}`} onClick={() => setDetailMode('basic')}>Básico</button>
                <button className={`rounded-full px-3 py-1.5 text-xs ${detailMode === 'advanced' ? 'bg-white/22 text-white' : 'text-white/55'}`} onClick={() => setDetailMode('advanced')}>Avanzado</button>
              </div>
              <button onClick={resetCurrent} disabled={localSettings.bubbleEffect === 'none'} className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs text-white/72 hover:bg-white/13 disabled:opacity-35"><RotateCcw size={12} /> Restablecer</button>
            </div>

            {localSettings.bubbleEffect === 'none' ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/62">Sin efecto adicional. El círculo conserva únicamente su diseño base.</p>
            ) : detailMode === 'basic' ? (
              <div className="space-y-4">
                {renderColors()}
                <div className="grid gap-2 sm:grid-cols-2">
                  {bubbleBasic.map((key) => <SliderRow key={key} config={bubbleSliderConfig(key)} value={bubbleControls[key] as number} onChange={(value) => updateBubbleControl({ [key]: value })} />)}
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {bubbleAdvanced.length ? bubbleAdvanced.map((key) => <SliderRow key={key} config={bubbleSliderConfig(key)} value={bubbleControls[key] as number} onChange={(value) => updateBubbleControl({ [key]: value })} />) : <p className="text-sm text-white/60">Este efecto no necesita controles avanzados adicionales.</p>}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-white/20 pt-4">
          <button className="rounded-xl px-4 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => handleOpenChange(false)}>Descartar</button>
          <button className="rounded-xl border border-white/40 bg-white/22 px-4 py-2 text-sm hover:bg-white/32" onClick={saveAndClose}>Guardar cambios</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
