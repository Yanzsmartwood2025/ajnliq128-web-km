'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ProgramLauncher } from './program-launcher'
import { CharacterAssetPreloader } from './character-asset-preloader'
import { CharacterMenu } from './character-menu'
import { SocialDock } from './social-dock'
import { slugifyProgram } from '@/lib/module-flags'
import {
  CHARACTER_BACKGROUNDS,
  CHARACTER_CARD_IMAGES,
  CHARACTER_PROGRAMS,
  getCharacterCardSources,
  getCharacterFallbackPhoto,
  type Character,
} from '@/lib/character-assets'
import {
  DEFAULT_CHARACTER_SCENE_SETTINGS,
  characterSceneStorageKey,
  normalizeCharacterSceneSettings,
  type CharacterSceneSettings,
} from '@/lib/character-scene-settings'

export function CharacterHub({
  character,
  showMode = false,
  showDurationMs = 54_000,
  onShowComplete,
}: {
  character: Character
  showMode?: boolean
  showDurationMs?: number
  onShowComplete?: () => void
}) {
  const isAria = character === 'aria'
  const programs = CHARACTER_PROGRAMS[character]
  const backgrounds = CHARACTER_BACKGROUNDS[character]
  const fallbackPhoto = getCharacterFallbackPhoto(character)
  const gridRef = useRef<HTMLDivElement>(null)
  const onShowCompleteRef = useRef(onShowComplete)

  const [assetsReady, setAssetsReady] = useState(false)
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [backgroundLayers, setBackgroundLayers] = useState({
    previous: backgrounds[0],
    current: backgrounds[0],
    version: 0,
  })
  const [sceneSettings, setSceneSettings] = useState<CharacterSceneSettings>({ ...DEFAULT_CHARACTER_SCENE_SETTINGS })

  useEffect(() => {
    onShowCompleteRef.current = onShowComplete
  }, [onShowComplete])

  useEffect(() => {
    setAssetsReady(false)
    setBackgroundIndex(0)
    setBackgroundLayers({ previous: backgrounds[0], current: backgrounds[0], version: 0 })
  }, [backgrounds, character])

  useEffect(() => {
    if (showMode) {
      setSceneSettings({ ...DEFAULT_CHARACTER_SCENE_SETTINGS })
      return
    }

    try {
      const saved = localStorage.getItem(characterSceneStorageKey(character))
      setSceneSettings(normalizeCharacterSceneSettings(saved ? JSON.parse(saved) : null))
    } catch {
      setSceneSettings({ ...DEFAULT_CHARACTER_SCENE_SETTINGS })
    }
  }, [character, showMode])

  const updateSceneSettings = useCallback((next: CharacterSceneSettings) => {
    const normalized = normalizeCharacterSceneSettings(next)
    setSceneSettings(normalized)
    if (!showMode) {
      localStorage.setItem(characterSceneStorageKey(character), JSON.stringify(normalized))
    }
  }, [character, showMode])

  const criticalAssets = useMemo(
    () => [...getCharacterCardSources(character), ...backgrounds.slice(0, 2)],
    [backgrounds, character],
  )
  const deferredAssets = useMemo(() => backgrounds.slice(2), [backgrounds])
  const markAssetsReady = useCallback(() => setAssetsReady(true), [])

  useEffect(() => {
    if (!assetsReady || backgrounds.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let interval: number | null = null

    const stop = () => {
      if (interval !== null) {
        window.clearInterval(interval)
        interval = null
      }
    }

    const start = () => {
      stop()
      if (document.visibilityState !== 'visible') return
      interval = window.setInterval(() => {
        setBackgroundIndex((current) => (current + 1) % backgrounds.length)
      }, sceneSettings.backgroundInterval * 1000)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }

    start()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [assetsReady, backgrounds.length, character, sceneSettings.backgroundInterval])

  const activeBackgroundUrl = backgrounds[backgroundIndex % backgrounds.length]

  useEffect(() => {
    setBackgroundLayers((layers) => {
      if (layers.current === activeBackgroundUrl) return layers
      return {
        previous: layers.current,
        current: activeBackgroundUrl,
        version: layers.version + 1,
      }
    })
  }, [activeBackgroundUrl])

  useEffect(() => {
    if (showMode || !assetsReady) return
    const grid = gridRef.current
    if (!grid) return

    let frame = 0

    const updateDepth = () => {
      frame = 0
      const gridRect = grid.getBoundingClientRect()
      const center = gridRect.left + gridRect.width / 2
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('.program-card'))

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const distancePx = cardCenter - center
        const normalized = Math.max(-1.35, Math.min(1.35, distancePx / Math.max(1, gridRect.width * 0.52)))
        const absolute = Math.min(1, Math.abs(normalized))

        card.style.setProperty('--card-offset', normalized.toFixed(4))
        card.style.setProperty('--card-depth', absolute.toFixed(4))
        card.classList.toggle('is-swipe-focus', absolute < 0.22)
      })
    }

    const requestDepthUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateDepth)
    }

    const startDrag = () => grid.classList.add('is-user-dragging')
    const stopDrag = () => {
      grid.classList.remove('is-user-dragging')
      requestDepthUpdate()
    }

    updateDepth()
    grid.addEventListener('scroll', requestDepthUpdate, { passive: true })
    grid.addEventListener('pointerdown', startDrag, { passive: true })
    grid.addEventListener('pointerup', stopDrag, { passive: true })
    grid.addEventListener('pointercancel', stopDrag, { passive: true })
    window.addEventListener('resize', requestDepthUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      grid.removeEventListener('scroll', requestDepthUpdate)
      grid.removeEventListener('pointerdown', startDrag)
      grid.removeEventListener('pointerup', stopDrag)
      grid.removeEventListener('pointercancel', stopDrag)
      window.removeEventListener('resize', requestDepthUpdate)
    }
  }, [assetsReady, character, showMode])

  const centerProgram = useCallback((el: HTMLElement) => {
    const grid = gridRef.current
    if (!grid) return

    const elRect = el.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const centerOffset = elRect.left - gridRect.left - (gridRect.width / 2) + (elRect.width / 2)
    grid.scrollBy({ left: centerOffset, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!showMode || !assetsReady) return
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.program-card'))
    if (!cards.length) return

    const introHoldMs = 2_800
    const outroHoldMs = 4_200
    const usableMs = Math.max(28_000, showDurationMs - introHoldMs - outroHoldMs)
    const stepMs = Math.max(4_500, Math.floor(usableMs / cards.length))
    let index = 0
    let interval: number | null = null
    let finishTimer: number | null = null

    const focusCard = (nextIndex: number) => {
      const card = cards[nextIndex]
      if (!card) return

      cards.forEach((item, itemIndex) => {
        item.classList.toggle('is-show-focus', itemIndex === nextIndex)
      })

      const left = card.offsetLeft - (grid.clientWidth - card.clientWidth) / 2
      grid.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }

    const firstTimer = window.setTimeout(() => {
      focusCard(0)
      interval = window.setInterval(() => {
        index += 1
        if (index >= cards.length) {
          if (interval) window.clearInterval(interval)
          interval = null
          return
        }
        focusCard(index)
      }, stepMs)
    }, introHoldMs)

    finishTimer = window.setTimeout(() => {
      cards.forEach((item) => item.classList.remove('is-show-focus'))
      onShowCompleteRef.current?.()
    }, showDurationMs)

    return () => {
      window.clearTimeout(firstTimer)
      if (finishTimer) window.clearTimeout(finishTimer)
      if (interval) window.clearInterval(interval)
      cards.forEach((item) => item.classList.remove('is-show-focus'))
    }
  }, [assetsReady, character, showDurationMs, showMode])

  const backgroundEffectClass = useMemo(() => {
    if (sceneSettings.backgroundTransition === 'auto') {
      return ['hub-bg-effect-zoom', 'hub-bg-effect-drift', 'hub-bg-effect-focus'][backgroundLayers.version % 3]
    }
    return `hub-bg-effect-${sceneSettings.backgroundTransition}`
  }, [backgroundLayers.version, sceneSettings.backgroundTransition])

  const stageStyle = {
    '--hub-social-lift': `${sceneSettings.socialLift}px`,
    '--hub-fog-offset': `${sceneSettings.fogOffset}dvh`,
    '--hub-fog-opacity': String(sceneSettings.fogIntensity),
    '--hub-fog-drift-a': `${13 / sceneSettings.fogSpeed}s`,
    '--hub-fog-drift-b': `${17 / sceneSettings.fogSpeed}s`,
    '--hub-fog-color-a': `${17 / sceneSettings.fogColorSpeed}s`,
    '--hub-fog-color-b': `${21 / sceneSettings.fogColorSpeed}s`,
    '--hub-bg-transition-duration': `${sceneSettings.backgroundTransitionDuration}s`,
  } as CSSProperties

  return (
    <main
      className={`hub hub-with-video hub-${character}${showMode ? ' hub-show-tour' : ''}`}
      style={stageStyle}
      data-fog-color-cycle={sceneSettings.fogColorCycle ? 'on' : 'off'}
    >
      <CharacterAssetPreloader
        critical={criticalAssets}
        deferred={deferredAssets}
        onCriticalReady={markAssetsReady}
      />

      <div
        className="hub-carousel-bg is-previous"
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.previous})` }}
      />
      <div
        key={`${backgroundLayers.version}:${backgroundLayers.current}`}
        className={`hub-carousel-bg is-current ${backgroundEffectClass}`}
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundLayers.current})` }}
      />
      <div className="hub-video-wash" aria-hidden="true" />

      {!showMode && (
        <CharacterMenu
          character={character}
          sceneSettings={sceneSettings}
          onSceneSettingsChange={updateSceneSettings}
        />
      )}

      {showMode && <div className="show-camera-vignette" aria-hidden="true" />}

      <div
        className={`program-grid${showMode ? ' is-show-tour' : ''}${assetsReady ? ' is-assets-ready' : ''}`}
        ref={gridRef}
        aria-busy={!assetsReady}
      >
        {programs.map((program, index) => {
          const slug = slugifyProgram(program)
          const photoUrl = CHARACTER_CARD_IMAGES[character][slug] ?? fallbackPhoto

          return (
            <ProgramLauncher
              character={character}
              showMode={showMode}
              program={program}
              index={index}
              photoUrl={photoUrl}
              fallbackPhoto={fallbackPhoto}
              key={program}
              destination={
                isAria && program === 'Starlight Log'
                  ? '/aria/starlight-log'
                  : isAria && program === 'arIA'
                    ? '/aria/aria'
                    : !isAria && program === 'Lumenfall'
                      ? '/joziel/lumenfall'
                      : undefined
              }
              onActivate={centerProgram}
            />
          )
        })}
      </div>

      {!showMode && <SocialDock character={character} />}
    </main>
  )
}
