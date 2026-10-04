import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

const required = [
  'public/assets/home/ajnliq128.png',
  'public/assets/home/fuego.png',
  'public/manifest.json',
  'public/icon-32x32.png',
  'public/icon-192x192.png',
  'public/icon-512x512.png',
  'public/apple-icon.png',

  'public/assets/characters/aria/cards/arias-anthem.jpg',
  'public/assets/characters/aria/cards/synthetic-soul.jpg',
  'public/assets/characters/aria/cards/starlight-log.jpg',
  'public/assets/characters/aria/cards/code-and-conscience.jpg',
  'public/assets/characters/aria/cards/real-world-quests.jpg',
  'public/assets/characters/aria/cards/lyrical-resonance.jpg',
  'public/assets/characters/aria/cards/aria-main.jpg',

  'public/assets/characters/joziel/cards/midnight-mantras.jpg',
  'public/assets/characters/joziel/cards/dark-siren.jpg',
  'public/assets/characters/joziel/cards/night-strategy.webp',
  'public/assets/characters/joziel/cards/sonic-autopsy.jpg',
  'public/assets/characters/joziel/cards/shadow-files.jpg',
  'public/assets/characters/joziel/cards/joziels-grimoire.jpg',
  'public/assets/characters/joziel/cards/lumenfall.jpg',
]

for (let index = 1; index <= 9; index += 1) {
  const names = [
    'noir-rain-portrait',
    'noir-rain-standing',
    'noir-window-closeup',
    'purple-braid-train-window',
    'lavender-braid-train',
    'lavender-sunset-mountains',
    'cyber-noir-led-city',
    'silver-cyber-grid-seated',
    'silver-cyber-grid-standing',
  ]
  required.push(`public/assets/characters/aria/carousel/${String(index).padStart(2, '0')}-${names[index - 1]}.jpg`)
}

const jozielBackgrounds = [
  'tattooed-studio-portrait',
  'rainy-forest-crouch',
  'moonlit-hooded-walk',
  'snowy-window-seat',
  'graveyard-witch-walk',
  'graveyard-witch-profile',
  'moonlit-hooded-portrait',
  'moonlit-hooded-closeup',
  'graveyard-witch-fullbody',
  'snowy-studio-window',
  'empty-theater-leather-jacket',
  'lumenfall-wordmark',
]

jozielBackgrounds.forEach((name, index) => {
  required.push(`public/assets/characters/joziel/carousel/${String(index + 1).padStart(2, '0')}-${name}.jpg`)
})

for (const file of [
  'facebook-neon.png',
  'instagram-neon.png',
  'tiktok-neon.png',
  'x-neon.png',
  'youtube-neon.png',
]) {
  required.push(`public/assets/characters/aria/social/${file}`)
}

for (const file of [
  'facebook-blue-flame.png',
  'instagram-blue-flame.png',
  'tiktok-blue-flame.png',
  'x-blue-flame.png',
  'youtube-blue-flame.png',
]) {
  required.push(`public/assets/characters/joziel/social/${file}`)
}

const missing = []
for (const relative of required) {
  try {
    await fs.access(path.join(root, relative))
  } catch {
    missing.push(relative)
  }
}

if (missing.length) {
  console.error('[assets] Missing required files:')
  for (const file of missing) console.error(` - ${file}`)
  process.exit(1)
}

console.log(`[assets] Verified ${required.length} required files.`)
