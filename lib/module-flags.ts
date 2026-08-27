export type Character = 'aria' | 'joziel'

export const moduleFlags: Record<Character, { enabled: boolean; programs: Record<string, boolean> }> = {
  aria: {
    enabled: true,
    programs: {
      'arias-anthem': true,
      'synthetic-soul': true,
      'starlight-log': true,
      'code-and-conscience': true,
      'real-world-quests': true,
      'lyrical-resonance': true,
    },
  },
  joziel: {
    enabled: true,
    programs: {
      'midnight-mantras': true,
      'dark-siren': true,
      'night-strategy': true,
      'sonic-autopsy': true,
      'shadow-files': true,
      'joziels-grimoire': true,
    },
  },
}

export function slugifyProgram(program: string) {
  return program.toLowerCase().replace(/['’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function isProgramEnabled(character: Character, slug: string) {
  return moduleFlags[character].enabled && moduleFlags[character].programs[slug] !== false
}

export const programLabels: Record<string, string> = {
  'arias-anthem': "Aria's Anthem",
  'synthetic-soul': 'Synthetic Soul',
  'starlight-log': 'Starlight Log',
  'code-and-conscience': 'Code & Conscience',
  'real-world-quests': 'Real World Quests',
  'lyrical-resonance': 'Lyrical Resonance',
  'midnight-mantras': 'Midnight Mantras',
  'dark-siren': 'Dark Siren',
  'night-strategy': 'Night Strategy',
  'sonic-autopsy': 'Sonic Autopsy',
  'shadow-files': 'Shadow Files',
  'joziels-grimoire': "Joziel's Grimoire",
}

export const characterLabels: Record<Character, string> = { aria: 'ARIA', joziel: 'JOZIEL' }
