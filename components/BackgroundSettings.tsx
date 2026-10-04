'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBackground, BackgroundType, BubbleEffectType } from './BackgroundManager'
import { HexColorPicker } from 'react-colorful'
import dynamic from 'next/dynamic'
import type { AmbientBackgroundType } from './effects/AmbientBackgrounds'

const FloatingLines = dynamic(() => import('@/components/ui/floating-lines').then(mod => mod.FloatingLines), { ssr: false })
const GhostFibers = dynamic(() => import('@/components/GhostFibers'), { ssr: false })
const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const WebThreads = dynamic(() => import('@/components/WebThreads'), { ssr: false })
const MagicRings = dynamic(() => import('@/components/MagicRings'), { ssr: false })
const AmbientBackground = dynamic(() => import('@/components/effects/AmbientBackgrounds'), { ssr: false })

const ambientTypes = new Set<AmbientBackgroundType>([
  'auroraWaves', 'nebulaFlow', 'liquidLight', 'prismTunnel', 'particleVeil', 'starPulse',
])

type BackgroundSettingsProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

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

export function BackgroundSettings({ open: controlledOpen, onOpenChange, hideTrigger = false }: BackgroundSettingsProps = {}) {
  const { settings, updateSettings } = useBackground()
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'fondo' | 'botones'>('fondo')
  const [localSettings, setLocalSettings] = useState(settings)
  const [activeColorTab, setActiveColorTab] = useState<'color1' | 'color2' | 'color3'>('color1')
  const open = controlledOpen ?? internalOpen

  const handleOpenChange = (isOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(isOpen)
    onOpenChange?.(isOpen)
    if (isOpen) setLocalSettings(settings)
  }

  const saveAndClose = () => {
    updateSettings(localSettings)
    handleOpenChange(false)
  }

  const updateLocalSettings = (newSettings: Partial<typeof settings>) => {
    setLocalSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateLocalColor = (key: keyof typeof settings, subkey: string, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as any), [subkey]: value },
    }))
  }

  const renderPreview = () => {
    if (localSettings.type === 'floatingLines') return <FloatingLines />
    if (localSettings.type === 'ghostFibers') return <GhostFibers lineColor={localSettings.ghostFibers.lineColor} glowColor={localSettings.ghostFibers.glowColor} />
    if (localSettings.type === 'rippleDistortion') return <RippleDistortion tint={localSettings.rippleDistortion.tint} />
    if (localSettings.type === 'webThreads') return <WebThreads color1={localSettings.webThreads.color1} color2={localSettings.webThreads.color2} color3={localSettings.webThreads.color3} />
    if (localSettings.type === 'magicRings') return <MagicRings color={localSettings.magicRings.color} colorTwo={localSettings.magicRings.colorTwo} scaleRate={0} noiseAmount={0.035} attenuation={12} />
    if (ambientTypes.has(localSettings.type as AmbientBackgroundType)) return <AmbientBackground variant={localSettings.type as AmbientBackgroundType} />
    return null
  }

  const renderColorPicker = () => {
    if (localSettings.type === 'ghostFibers') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color1')}>Línea</button>
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color2')}>Brillo</button>
          </div>
          <div className="flex justify-center"><HexColorPicker color={activeColorTab === 'color1' ? localSettings.ghostFibers.lineColor : localSettings.ghostFibers.glowColor} onChange={(c) => updateLocalColor('ghostFibers', activeColorTab === 'color1' ? 'lineColor' : 'glowColor', c)} /></div>
        </div>
      )
    }
    if (localSettings.type === 'rippleDistortion') {
      return <div className="flex justify-center"><HexColorPicker color={localSettings.rippleDistortion.tint} onChange={(c) => updateLocalColor('rippleDistortion', 'tint', c)} /></div>
    }
    if (localSettings.type === 'webThreads') {
      const color = activeColorTab === 'color1' ? localSettings.webThreads.color1 : activeColorTab === 'color2' ? localSettings.webThreads.color2 : localSettings.webThreads.color3
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['color1','color2','color3'] as const).map((key, index) => <button key={key} className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === key ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab(key)}>Color {index + 1}</button>)}
          </div>
          <div className="flex justify-center"><HexColorPicker color={color} onChange={(c) => updateLocalColor('webThreads', activeColorTab, c)} /></div>
        </div>
      )
    }
    if (localSettings.type === 'magicRings') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color1')}>Color 1</button>
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color2')}>Color 2</button>
          </div>
          <div className="flex justify-center"><HexColorPicker color={activeColorTab === 'color1' ? localSettings.magicRings.color : localSettings.magicRings.colorTwo} onChange={(c) => updateLocalColor('magicRings', activeColorTab === 'color1' ? 'color' : 'colorTwo', c)} /></div>
        </div>
      )
    }
    return null
  }

  const hasColorPicker = ['ghostFibers','rippleDistortion','webThreads','magicRings'].includes(localSettings.type)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && <DialogTrigger className="login-button" aria-label="Opciones" title="Opciones" style={{ marginLeft: '10px' }}><Settings2 size={16} /></DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,.30), rgba(255,255,255,.11) 48%, rgba(255,255,255,.07))', backdropFilter: 'blur(32px) saturate(140%)', WebkitBackdropFilter: 'blur(32px) saturate(140%)', border: '1px solid rgba(255,255,255,.48)', borderRadius: '32px', boxShadow: '0 28px 90px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.46)', color: '#fff', padding: '1.5rem' }}>
        <DialogHeader><DialogTitle>Opciones</DialogTitle></DialogHeader>
        <div className="flex gap-4 border-b border-white/20 pb-2 mb-4">
          <button className={`pb-2 text-sm font-medium ${activeTab === 'fondo' ? 'border-b-2 border-white text-white' : 'text-white/60'}`} onClick={() => setActiveTab('fondo')}>Fondo</button>
          <button className={`pb-2 text-sm font-medium ${activeTab === 'botones' ? 'border-b-2 border-white text-white' : 'text-white/60'}`} onClick={() => setActiveTab('botones')}>Botones</button>
        </div>

        {activeTab === 'fondo' ? (
          <div className="space-y-6">
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/20 bg-black/30">
              {renderPreview()}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="bg-black/30 px-3 py-1.5 rounded-full text-xs text-white/90 backdrop-blur-md">Vista Previa</span></div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 text-white/85">Efecto</h4>
              <div className="grid grid-cols-2 gap-2">
                {bgOptions.map((opt) => <button key={opt.id} onClick={() => updateLocalSettings({ type: opt.id })} className={`text-xs p-2.5 rounded-xl border transition-all text-left ${localSettings.type === opt.id ? 'bg-white/25 border-white/60' : 'bg-white/7 border-white/15 hover:bg-white/13'}`}>{opt.label}</button>)}
              </div>
            </div>
            {hasColorPicker && <div><h4 className="text-sm font-medium mb-3 text-white/85">Colores</h4>{renderColorPicker()}</div>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/70 mb-4">Cada efecto se monta de forma independiente. Al cambiarlo, el anterior se desmonta por completo.</p>
            <div className="grid grid-cols-2 gap-2">
              {bubbleOptions.map((opt) => <button key={opt.id} onClick={() => updateLocalSettings({ bubbleEffect: opt.id })} className={`text-sm p-3 rounded-xl border transition-all text-left ${localSettings.bubbleEffect === opt.id ? 'bg-white/25 border-white/60' : 'bg-white/7 border-white/15 hover:bg-white/13'}`}>{opt.label}</button>)}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/20">
          <button className="px-4 py-2 rounded-xl text-sm text-white/80 hover:bg-white/10" onClick={() => handleOpenChange(false)}>Descartar</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-white/22 border border-white/40 hover:bg-white/32" onClick={saveAndClose}>Guardar cambios</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
