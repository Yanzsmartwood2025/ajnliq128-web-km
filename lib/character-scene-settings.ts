import type { Character } from '@/lib/character-assets'

export type HubBackgroundTransition = 'auto' | 'zoom' | 'drift' | 'focus' | 'fade'

export interface CharacterSceneSettings {
  socialLift: number
  fogOffset: number
  fogIntensity: number
  fogSpeed: number
  fogColorSpeed: number
  fogColorCycle: boolean
  backgroundInterval: number
  backgroundTransition: HubBackgroundTransition
  backgroundTransitionDuration: number
}

export const DEFAULT_CHARACTER_SCENE_SETTINGS: CharacterSceneSettings = {
  socialLift: 18,
  fogOffset: 10,
  fogIntensity: 0.84,
  fogSpeed: 1,
  fogColorSpeed: 1,
  fogColorCycle: true,
  backgroundInterval: 5,
  backgroundTransition: 'auto',
  backgroundTransitionDuration: 1.25,
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

export function normalizeCharacterSceneSettings(raw: unknown): CharacterSceneSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CHARACTER_SCENE_SETTINGS }
  const value = raw as Partial<CharacterSceneSettings>
  const transitions: HubBackgroundTransition[] = ['auto', 'zoom', 'drift', 'focus', 'fade']

  return {
    socialLift: clamp(value.socialLift, 0, 64, DEFAULT_CHARACTER_SCENE_SETTINGS.socialLift),
    fogOffset: clamp(value.fogOffset, -18, 28, DEFAULT_CHARACTER_SCENE_SETTINGS.fogOffset),
    fogIntensity: clamp(value.fogIntensity, 0.2, 1, DEFAULT_CHARACTER_SCENE_SETTINGS.fogIntensity),
    fogSpeed: clamp(value.fogSpeed, 0.35, 2.5, DEFAULT_CHARACTER_SCENE_SETTINGS.fogSpeed),
    fogColorSpeed: clamp(value.fogColorSpeed, 0.35, 2.5, DEFAULT_CHARACTER_SCENE_SETTINGS.fogColorSpeed),
    fogColorCycle: typeof value.fogColorCycle === 'boolean' ? value.fogColorCycle : DEFAULT_CHARACTER_SCENE_SETTINGS.fogColorCycle,
    backgroundInterval: clamp(value.backgroundInterval, 2.5, 20, DEFAULT_CHARACTER_SCENE_SETTINGS.backgroundInterval),
    backgroundTransition: transitions.includes(value.backgroundTransition as HubBackgroundTransition)
      ? value.backgroundTransition as HubBackgroundTransition
      : DEFAULT_CHARACTER_SCENE_SETTINGS.backgroundTransition,
    backgroundTransitionDuration: clamp(value.backgroundTransitionDuration, 0.35, 3, DEFAULT_CHARACTER_SCENE_SETTINGS.backgroundTransitionDuration),
  }
}

export const characterSceneStorageKey = (character: Character) => `ajnliq128_scene_${character}`
