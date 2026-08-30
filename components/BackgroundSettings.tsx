'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBackground, BackgroundType } from './BackgroundManager'

export function BackgroundSettings() {
  const { settings, updateSettings } = useBackground()
  const [open, setOpen] = useState(false)

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ type: e.target.value as BackgroundType })
  }

  const updateColor = (key: string, subkey: string, value: string) => {
    updateSettings({
      [key]: {
        ...(settings as any)[key],
        [subkey]: value
      }
    } as any)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="login-button"
        aria-label="Ajustes de Fondo"
        title="Ajustes de Fondo"
        style={{ marginLeft: '10px' }}
      >
        <Settings2 size={16} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" style={{
        background: 'rgba(8, 10, 24, 0.65)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#fff'
      }}>
        <DialogHeader>
          <DialogTitle>Personalizar Entorno</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="bg-type" className="text-right text-sm font-medium">Efecto</label>
            <select
              id="bg-type"
              value={settings.type}
              onChange={handleTypeChange}
              className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="floatingLines">Líneas Flotantes</option>
              <option value="ghostFibers">Ghost Fibers</option>
              <option value="rippleDistortion">Ripple Distortion</option>
              <option value="webThreads">Web Threads</option>
              <option value="magicRings">Magic Rings</option>
            </select>
          </div>

          {settings.type === 'ghostFibers' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Línea</label>
                <input
                  type="color"
                  value={settings.ghostFibers.lineColor}
                  onChange={(e) => updateColor('ghostFibers', 'lineColor', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Brillo</label>
                <input
                  type="color"
                  value={settings.ghostFibers.glowColor}
                  onChange={(e) => updateColor('ghostFibers', 'glowColor', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
            </>
          )}

          {settings.type === 'rippleDistortion' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Tinte</label>
              <input
                type="color"
                value={settings.rippleDistortion.tint}
                onChange={(e) => updateColor('rippleDistortion', 'tint', e.target.value)}
                className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
              />
            </div>
          )}

          {settings.type === 'webThreads' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Color 1</label>
                <input
                  type="color"
                  value={settings.webThreads.color1}
                  onChange={(e) => updateColor('webThreads', 'color1', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Color 2</label>
                <input
                  type="color"
                  value={settings.webThreads.color2}
                  onChange={(e) => updateColor('webThreads', 'color2', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Color 3</label>
                <input
                  type="color"
                  value={settings.webThreads.color3}
                  onChange={(e) => updateColor('webThreads', 'color3', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
            </>
          )}

          {settings.type === 'magicRings' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Color 1</label>
                <input
                  type="color"
                  value={settings.magicRings.color}
                  onChange={(e) => updateColor('magicRings', 'color', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Color 2</label>
                <input
                  type="color"
                  value={settings.magicRings.colorTwo}
                  onChange={(e) => updateColor('magicRings', 'colorTwo', e.target.value)}
                  className="col-span-3 h-10 w-full cursor-pointer bg-transparent"
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
