'use client'

import { RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Character } from '@/lib/character-assets'
import {
  DEFAULT_CHARACTER_SCENE_SETTINGS,
  type CharacterSceneSettings,
  type HubBackgroundTransition,
} from '@/lib/character-scene-settings'

type Props = {
  character: Character
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CharacterSceneSettings
  onChange: (settings: CharacterSceneSettings) => void
}

const transitionOptions: { id: HubBackgroundTransition; label: string }[] = [
  { id: 'auto', label: 'Automático' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'drift', label: 'Deslizar' },
  { id: 'focus', label: 'Enfoque' },
  { id: 'fade', label: 'Fundido' },
]

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-xs text-white/80">
        <span>{label}</span>
        <strong className="font-medium text-white">{Number.isInteger(value) ? value : value.toFixed(2)}{suffix}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="w-full accent-white"
      />
    </label>
  )
}

export function CharacterSceneSettingsDialog({ character, open, onOpenChange, settings, onChange }: Props) {
  const update = <K extends keyof CharacterSceneSettings>(key: K, value: CharacterSceneSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[86vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,.30), rgba(255,255,255,.11) 48%, rgba(255,255,255,.07))',
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
          border: '1px solid rgba(255,255,255,.48)',
          borderRadius: '32px',
          boxShadow: '0 28px 90px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.46)',
          color: '#fff',
          padding: '1.5rem',
        }}
      >
        <DialogHeader>
          <DialogTitle>Escena {character.toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <section className="grid gap-4 rounded-2xl border border-white/20 bg-white/8 p-4">
            <div>
              <h3 className="text-sm font-semibold">Neblina</h3>
              <p className="mt-1 text-xs text-white/60">La escena se actualiza en vivo mientras mueves los controles.</p>
            </div>
            <RangeControl label="Altura" value={settings.fogOffset} min={-18} max={28} step={1} suffix=" vh" onChange={(value) => update('fogOffset', value)} />
            <RangeControl label="Intensidad" value={settings.fogIntensity} min={0.2} max={1} step={0.02} onChange={(value) => update('fogIntensity', value)} />
            <RangeControl label="Velocidad" value={settings.fogSpeed} min={0.35} max={2.5} step={0.05} suffix="×" onChange={(value) => update('fogSpeed', value)} />
            <RangeControl label="Velocidad de color" value={settings.fogColorSpeed} min={0.35} max={2.5} step={0.05} suffix="×" onChange={(value) => update('fogColorSpeed', value)} />
            <label className="flex items-center justify-between gap-4 text-sm text-white/85">
              <span>Cambio de color</span>
              <input type="checkbox" checked={settings.fogColorCycle} onChange={(event) => update('fogColorCycle', event.currentTarget.checked)} className="h-4 w-4 accent-white" />
            </label>
          </section>

          <section className="grid gap-4 rounded-2xl border border-white/20 bg-white/8 p-4">
            <div>
              <h3 className="text-sm font-semibold">Fondos</h3>
              <p className="mt-1 text-xs text-white/60">Controla el ritmo y la transición de las fotografías del carrusel.</p>
            </div>
            <RangeControl label="Cambio de foto" value={settings.backgroundInterval} min={2.5} max={20} step={0.5} suffix=" s" onChange={(value) => update('backgroundInterval', value)} />
            <RangeControl label="Duración de transición" value={settings.backgroundTransitionDuration} min={0.35} max={3} step={0.05} suffix=" s" onChange={(value) => update('backgroundTransitionDuration', value)} />
            <div className="grid gap-2">
              <span className="text-xs text-white/80">Efecto de transición</span>
              <div className="grid grid-cols-2 gap-2">
                {transitionOptions.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => update('backgroundTransition', option.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${settings.backgroundTransition === option.id ? 'border-white/60 bg-white/24 text-white' : 'border-white/15 bg-white/6 text-white/70 hover:bg-white/12'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-white/20 bg-white/8 p-4">
            <div>
              <h3 className="text-sm font-semibold">Redes sociales</h3>
              <p className="mt-1 text-xs text-white/60">Sube o baja la fila completa sin alterar el tamaño de los iconos.</p>
            </div>
            <RangeControl label="Altura de iconos" value={settings.socialLift} min={0} max={64} step={1} suffix=" px" onChange={(value) => update('socialLift', value)} />
          </section>

          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_CHARACTER_SCENE_SETTINGS })}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/28 bg-white/10 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/18"
          >
            <RotateCcw size={15} />
            Restablecer escena
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
