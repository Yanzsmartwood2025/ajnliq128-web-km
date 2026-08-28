'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { moduleFlags, slugifyProgram, type Character } from '@/lib/module-flags'

export function ProgramLauncher({ character, program, index, destination, onActivate }: { character: Character; program: string; index: number; destination?: string; onActivate?: () => void }) {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const slug = slugifyProgram(program)
  const enabled = moduleFlags[character].enabled && moduleFlags[character].programs[slug] !== false

  function openProgram() {
    if (!enabled || launching) return
    setLaunching(true)
    onActivate?.()
    window.setTimeout(() => router.push(destination ?? `/${character}/${slug}`), 1200)
  }

  return <button type="button" className={`program-card program-card-button${launching ? ' is-launching' : ''}`} onClick={openProgram} disabled={!enabled || launching} aria-label={`Abrir ${program}`}>
    <span className="program-card-glass" aria-hidden="true"><span className="program-card-clip" /></span>
    <span className="program-number">0{index + 1}</span>
    <h2>{program}</h2>
    <span className="program-status">{enabled ? 'Enter frequency' : 'Temporarily unavailable'} <span aria-hidden="true">↗</span></span>
    {launching && <span className="program-launch" aria-live="polite"><strong>{program}</strong><small>Loading module</small></span>}
  </button>
}
