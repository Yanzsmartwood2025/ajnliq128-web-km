'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBackground, BackgroundType, BubbleEffectType } from './BackgroundManager'
import { HexColorPicker } from 'react-colorful'
import dynamic from 'next/dynamic'

// Import preview components dynamically to avoid SSR issues
const FloatingLines = dynamic(() => import('@/components/ui/floating-lines').then(mod => mod.FloatingLines), { ssr: false })
const GhostFibers = dynamic(() => import('@/components/GhostFibers'), { ssr: false })
const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })
const WebThreads = dynamic(() => import('@/components/WebThreads'), { ssr: false })
const MagicRings = dynamic(() => import('@/components/MagicRings'), { ssr: false })

export function BackgroundSettings() {
  const { settings, updateSettings } = useBackground()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'fondo' | 'botones'>('fondo')

  // Local state for previewing before saving
  const [localSettings, setLocalSettings] = useState(settings)

  // Color picker tab state for multi-color backgrounds
  const [activeColorTab, setActiveColorTab] = useState<'color1' | 'color2' | 'color3'>('color1')

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      // Sync local state when opening
      setLocalSettings(settings)
    }
  }

  const saveAndClose = () => {
    updateSettings(localSettings)
    setOpen(false)
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

  // Helper function to render color picker based on selected background
  const renderColorPicker = () => {
    if (localSettings.type === 'floatingLines') return null;

    if (localSettings.type === 'ghostFibers') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color1')}
            >Línea</button>
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color2')}
            >Brillo</button>
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
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded-full border bg-white/20 border-white/40">Tinte</button>
          </div>
          <div className="flex justify-center">
            <HexColorPicker
              color={localSettings.rippleDistortion.tint}
              onChange={(newColor) => updateLocalColor('rippleDistortion', 'tint', newColor)}
            />
          </div>
        </div>
      )
    }

    if (localSettings.type === 'webThreads') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color1')}
            >Color 1</button>
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color2')}
            >Color 2</button>
             <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color3' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color3')}
            >Color 3</button>
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
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color1' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color1')}
            >Color 1</button>
            <button
              className={`px-3 py-1 text-xs rounded-full border ${activeColorTab === 'color2' ? 'bg-white/20 border-white/40' : 'border-white/10 text-white/60'}`}
              onClick={() => setActiveColorTab('color2')}
            >Color 2</button>
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

    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="login-button"
        aria-label="Opciones"
        title="Opciones"
        style={{ marginLeft: '10px' }}
      >
        <Settings2 size={16} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" style={{
        background: 'rgba(8, 10, 24, 0.65)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#fff'
      }}>
        <DialogHeader>
          <DialogTitle>Opciones</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-2 mb-4">
          <button
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'fondo' ? 'border-b-2 border-white text-white' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setActiveTab('fondo')}
          >
            Fondo
          </button>
          <button
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'botones' ? 'border-b-2 border-white text-white' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setActiveTab('botones')}
          >
            Botones
          </button>
        </div>

        <div className="py-2">
          {activeTab === 'fondo' && (
            <div className="space-y-6">
              {/* Preview Area */}
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                 {localSettings.type === 'floatingLines' && <FloatingLines />}
                  {localSettings.type === 'ghostFibers' && (
                    <GhostFibers
                      lineColor={localSettings.ghostFibers.lineColor}
                      glowColor={localSettings.ghostFibers.glowColor}
                    />
                  )}
                  {localSettings.type === 'rippleDistortion' && (
                    <RippleDistortion
                      tint={localSettings.rippleDistortion.tint}
                    />
                  )}
                  {localSettings.type === 'webThreads' && (
                    <WebThreads
                      color1={localSettings.webThreads.color1}
                      color2={localSettings.webThreads.color2}
                      color3={localSettings.webThreads.color3}
                    />
                  )}
                  {localSettings.type === 'magicRings' && (
                    <MagicRings
                      color={localSettings.magicRings.color}
                      colorTwo={localSettings.magicRings.colorTwo}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="bg-black/40 px-2 py-1 rounded text-xs text-white/80 backdrop-blur-md">Vista Previa</span>
                  </div>
              </div>

              {/* Effect Selector (Cards) */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-white/80">Efecto</h4>
                <div className="grid grid-cols-2 gap-2">
                  {bgOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateLocalSettings({ type: opt.id })}
                      className={`text-xs p-2 rounded border transition-all text-left ${localSettings.type === opt.id ? 'bg-white/20 border-white/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker Section */}
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
                <p className="text-sm text-white/60 mb-4">Selecciona el efecto 3D/interactivo para las burbujas de los personajes.</p>
                <div className="grid grid-cols-2 gap-2">
                  {bubbleOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateLocalSettings({ bubbleEffect: opt.id })}
                      className={`text-sm p-3 rounded border transition-all text-left ${localSettings.bubbleEffect === opt.id ? 'bg-white/20 border-white/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            className="px-4 py-2 rounded text-sm text-white/70 hover:bg-white/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            Descartar
          </button>
          <button
            className="px-4 py-2 rounded text-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-colors"
            onClick={saveAndClose}
          >
            Guardar cambios
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
