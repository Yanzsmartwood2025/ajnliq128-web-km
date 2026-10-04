'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBackground, BackgroundType, BubbleEffectType } from './BackgroundManager'
import { HexColorPicker } from 'react-colorful'
import dynamic from 'next/dynamic'

const FloatingLines = dynamic(() => import('@/components/ui/floating-lines').then(mod => mod.FloatingLines), { ssr: false })
const GhostFibers = dynamic(() => import('@/components/GhostFibers'), { ssr: false })
const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const WebThreads = dynamic(() => import('@/components/WebThreads'), { ssr: false })
const MagicRings = dynamic(() => import('@/components/MagicRings'), { ssr: false })

type BackgroundSettingsProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

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
    setLocalSettings(prev => ({ ...prev, ...newSettings }))
  }

  const updateLocalColor = (key: keyof typeof settings, subkey: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [subkey]: value
      }
    }))
  }

  const bgOptions: { id: BackgroundType; label: string }[] = [
    { id: 'floatingLines', label: 'Líneas Flotantes' },
    { id: 'ghostFibers', label: 'Ghost Fibers' },
    { id: 'rippleDistortion', label: 'Ripple Distortion' },
    { id: 'webThreads', label: 'Web Threads' },
    { id: 'magicRings', label: 'Magic Rings' },
  ]

  const bubbleOptions: { id: BubbleEffectType; label: string }[] = [
    { id: 'none', label: 'Ninguno' },
    { id: 'tiltedCard', label: 'Tilted Card' },
    { id: 'glareHover', label: 'Glare Hover' },
    { id: 'borderGlow', label: 'Border Glow' },
    { id: 'splashCursor', label: 'Splash Cursor' },
    { id: 'rippleDistortion', label: 'Ripple Distortion' },
  ]

  const renderColorPicker = () => {
    if (localSettings.type === 'floatingLines') return null

    if (localSettings.type === 'ghostFibers') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color1')}>Línea</button>
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color2')}>Brillo</button>
          </div>
          <div className="flex justify-center">
            <HexColorPicker
              color={activeColorTab === 'color1' ? localSettings.ghostFibers.lineColor : localSettings.ghostFibers.glowColor}
              onChange={(newColor) => updateLocalColor('ghostFibers', activeColorTab === 'color1' ? 'lineColor' : 'glowColor', newColor)}
            />
          </div>
        </div>
      )
    }

    if (localSettings.type === 'rippleDistortion') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2"><button className="px-3 py-1 text-xs rounded-full border bg-white/20 border-white/40">Tinte</button></div>
          <div className="flex justify-center">
            <HexColorPicker color={localSettings.rippleDistortion.tint} onChange={(newColor) => updateLocalColor('rippleDistortion', 'tint', newColor)} />
          </div>
        </div>
      )
    }

    if (localSettings.type === 'webThreads') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color1')}>Color 1</button>
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color2')}>Color 2</button>
            <button className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color3' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`} onClick={() => setActiveColorTab('color3')}>Color 3</button>
          </div>
          <div className="flex justify-center">
            <HexColorPicker
              color={activeColorTab === 'color1' ? localSettings.webThreads.color1 : activeColorTab === 'color2' ? localSettings.webThreads.color2 : localSettings.webThreads.color3}
              onChange={(newColor) => updateLocalColor('webThreads', activeColorTab, newColor)}
            />
          </div>
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
          <div className="flex justify-center">
            <HexColorPicker
              color={activeColorTab === 'color1' ? localSettings.magicRings.color : localSettings.magicRings.colorTwo}
              onChange={(newColor) => updateLocalColor('magicRings', activeColorTab === 'color1' ? 'color' : 'colorTwo', newColor)}
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger className="login-button" aria-label="Opciones" title="Opciones" style={{ marginLeft: '10px' }}>
          <Settings2 size={16} />
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,.22), rgba(255,255,255,.08))',
          backdropFilter: 'blur(30px) saturate(135%)',
          WebkitBackdropFilter: 'blur(30px) saturate(135%)',
          border: '1px solid rgba(255,255,255,.38)',
          borderRadius: '32px',
          boxShadow: '0 28px 90px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.34)',
          color: '#fff',
          padding: '1.5rem'
        }}
      >
        <DialogHeader>
          <DialogTitle>Opciones</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 border-b border-white/15 pb-2 mb-4">
          <button className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'fondo' ? 'border-b-2 border-white text-white' : 'text-white/55 hover:text-white/85'}`} onClick={() => setActiveTab('fondo')}>Fondo</button>
          <button className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'botones' ? 'border-b-2 border-white text-white' : 'text-white/55 hover:text-white/85'}`} onClick={() => setActiveTab('botones')}>Botones</button>
        </div>

        <div className="py-2">
          {activeTab === 'fondo' && (
            <div className="space-y-6">
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/15 bg-black/35">
                {localSettings.type === 'floatingLines' && <FloatingLines />}
                {localSettings.type === 'ghostFibers' && <GhostFibers lineColor={localSettings.ghostFibers.lineColor} glowColor={localSettings.ghostFibers.glowColor} />}
                {localSettings.type === 'rippleDistortion' && <RippleDistortion tint={localSettings.rippleDistortion.tint} />}
                {localSettings.type === 'webThreads' && <WebThreads color1={localSettings.webThreads.color1} color2={localSettings.webThreads.color2} color3={localSettings.webThreads.color3} />}
                {localSettings.type === 'magicRings' && <MagicRings color={localSettings.magicRings.color} colorTwo={localSettings.magicRings.colorTwo} />}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-black/35 px-3 py-1.5 rounded-full text-xs text-white/85 backdrop-blur-md">Vista Previa</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3 text-white/80">Efecto</h4>
                <div className="grid grid-cols-2 gap-2">
                  {bgOptions.map((opt) => (
                    <button key={opt.id} onClick={() => updateLocalSettings({ type: opt.id })} className={`text-xs p-2.5 rounded-xl border transition-all text-left ${localSettings.type === opt.id ? 'bg-white/22 border-white/55' : 'bg-white/6 border-white/12 hover:bg-white/12'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {localSettings.type !== 'floatingLines' && (
                <div>
                  <h4 className="text-sm font-medium mb-3 text-white/80">Colores</h4>
                  {renderColorPicker()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'botones' && (
            <div className="space-y-4">
              <p className="text-sm text-white/65 mb-4">Selecciona el efecto 3D/interactivo para las burbujas de los personajes.</p>
              <div className="grid grid-cols-2 gap-2">
                {bubbleOptions.map((opt) => (
                  <button key={opt.id} onClick={() => updateLocalSettings({ bubbleEffect: opt.id })} className={`text-sm p-3 rounded-xl border transition-all text-left ${localSettings.bubbleEffect === opt.id ? 'bg-white/22 border-white/55' : 'bg-white/6 border-white/12 hover:bg-white/12'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/15">
          <button className="px-4 py-2 rounded-xl text-sm text-white/75 hover:bg-white/10 transition-colors" onClick={() => handleOpenChange(false)}>Descartar</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-white/20 border border-white/35 hover:bg-white/30 transition-colors" onClick={saveAndClose}>Guardar cambios</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
