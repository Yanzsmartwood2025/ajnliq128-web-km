'use client'

import type { Character } from '@/lib/character-assets'
import { CHARACTER_SOCIAL_ICONS } from '@/lib/character-assets'

const labels = ['Facebook', 'Instagram', 'TikTok', 'X', 'YouTube'] as const

export function SocialDock({ character }: { character: Character }) {
  const icons = CHARACTER_SOCIAL_ICONS[character]

  return (
    <div className={`social-dock social-dock-${character}`} aria-label="Redes sociales">
      {icons.map((src, index) => (
        <span
          key={src}
          className={`social-dock-item${index === 2 ? ' is-primary' : ''}`}
          title={labels[index]}
        >
          <img
            src={src}
            alt={labels[index]}
            loading="eager"
            decoding="async"
            onError={(event) => { event.currentTarget.style.visibility = 'hidden' }}
          />
        </span>
      ))}
    </div>
  )
}
