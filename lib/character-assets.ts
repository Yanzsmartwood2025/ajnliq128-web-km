export type Character = 'aria' | 'joziel'

export const CHARACTER_PROGRAMS: Record<Character, readonly string[]> = {
  aria: [
    "Aria's Anthem",
    'Synthetic Soul',
    'Starlight Log',
    'Code & Conscience',
    'Real World Quests',
    'Lyrical Resonance',
    'arIA',
  ],
  joziel: [
    'Midnight Mantras',
    'Dark Siren',
    'Night Strategy',
    'Sonic Autopsy',
    'Shadow Files',
    "Joziel's Grimoire",
    'Lumenfall',
  ],
}

export const CHARACTER_CARD_IMAGES: Record<Character, Record<string, string>> = {
  aria: {
    'arias-anthem': '/assets/characters/aria/cards/arias-anthem.jpg',
    'synthetic-soul': '/assets/characters/aria/cards/synthetic-soul.jpg',
    'starlight-log': '/assets/characters/aria/cards/starlight-log.jpg',
    'code-and-conscience': '/assets/characters/aria/cards/code-and-conscience.jpg',
    'real-world-quests': '/assets/characters/aria/cards/real-world-quests.jpg',
    'lyrical-resonance': '/assets/characters/aria/cards/lyrical-resonance.jpg',
    aria: '/assets/characters/aria/cards/aria-main.jpg',
  },
  joziel: {
    'midnight-mantras': '/assets/characters/joziel/cards/midnight-mantras.jpg',
    'dark-siren': '/assets/characters/joziel/cards/dark-siren.jpg',
    'night-strategy': '/assets/characters/joziel/cards/night-strategy.webp',
    'sonic-autopsy': '/assets/characters/joziel/cards/sonic-autopsy.jpg',
    'shadow-files': '/assets/characters/joziel/cards/shadow-files.jpg',
    'joziels-grimoire': '/assets/characters/joziel/cards/joziels-grimoire.jpg',
    lumenfall: '/assets/characters/joziel/cards/lumenfall.jpg',
  },
}

export const CHARACTER_BACKGROUNDS: Record<Character, readonly string[]> = {
  aria: [
    '/assets/characters/aria/carousel/01-noir-rain-portrait.jpg',
    '/assets/characters/aria/carousel/02-noir-rain-standing.jpg',
    '/assets/characters/aria/carousel/03-noir-window-closeup.jpg',
    '/assets/characters/aria/carousel/04-purple-braid-train-window.jpg',
    '/assets/characters/aria/carousel/05-lavender-braid-train.jpg',
    '/assets/characters/aria/carousel/06-lavender-sunset-mountains.jpg',
    '/assets/characters/aria/carousel/07-cyber-noir-led-city.jpg',
    '/assets/characters/aria/carousel/08-silver-cyber-grid-seated.jpg',
    '/assets/characters/aria/carousel/09-silver-cyber-grid-standing.jpg',
  ],
  joziel: [
    '/assets/characters/joziel/carousel/01-tattooed-studio-portrait.jpg',
    '/assets/characters/joziel/carousel/02-rainy-forest-crouch.jpg',
    '/assets/characters/joziel/carousel/03-moonlit-hooded-walk.jpg',
    '/assets/characters/joziel/carousel/04-snowy-window-seat.jpg',
    '/assets/characters/joziel/carousel/05-graveyard-witch-walk.jpg',
    '/assets/characters/joziel/carousel/06-graveyard-witch-profile.jpg',
    '/assets/characters/joziel/carousel/07-moonlit-hooded-portrait.jpg',
    '/assets/characters/joziel/carousel/08-moonlit-hooded-closeup.jpg',
    '/assets/characters/joziel/carousel/09-graveyard-witch-fullbody.jpg',
    '/assets/characters/joziel/carousel/10-snowy-studio-window.jpg',
    '/assets/characters/joziel/carousel/11-empty-theater-leather-jacket.jpg',
    '/assets/characters/joziel/carousel/12-lumenfall-wordmark.jpg',
  ],
}

export const CHARACTER_SOCIAL_ICONS: Record<Character, readonly string[]> = {
  aria: [
    '/assets/characters/aria/social/facebook-neon.png',
    '/assets/characters/aria/social/instagram-neon.png',
    '/assets/characters/aria/social/tiktok-neon.png',
    '/assets/characters/aria/social/x-neon.png',
    '/assets/characters/aria/social/youtube-neon.png',
  ],
  joziel: [
    '/assets/characters/joziel/social/facebook-blue-flame.png',
    '/assets/characters/joziel/social/instagram-blue-flame.png',
    '/assets/characters/joziel/social/tiktok-blue-flame.png',
    '/assets/characters/joziel/social/x-blue-flame.png',
    '/assets/characters/joziel/social/youtube-blue-flame.png',
  ],
}

export function getCharacterFallbackPhoto(character: Character) {
  return character === 'aria'
    ? '/assets/characters/aria/cards/aria-main.jpg'
    : '/assets/characters/joziel/cards/lumenfall.jpg'
}

export function getCharacterCardSources(character: Character) {
  return Object.values(CHARACTER_CARD_IMAGES[character])
}
