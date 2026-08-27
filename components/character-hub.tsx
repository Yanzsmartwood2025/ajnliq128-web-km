import Link from 'next/link'
import { FlameMark, Wordmark } from './galaxy-background'

const programs = {
  aria: ['Aria\'s Anthem', 'Synthetic Soul', 'Starlight Log', 'Code & Conscience', 'Real World Quests', 'Lyrical Resonance'],
  joziel: ['Midnight Mantras', 'Dark Siren', 'Night Strategy', 'Sonic Autopsy', 'Shadow Files', "Joziel's Grimoire"],
}

export function CharacterHub({ character }: { character: 'aria' | 'joziel' }) {
  const isAria = character === 'aria'
  const name = isAria ? 'ARIA' : 'JOZIEL'
  return <main className="hub"><header className="hub-header"><Link href="/" className="back-link"><FlameMark /> <span>FUEGO</span></Link><span className="hub-index">{isAria ? '01' : '02'} / 02</span></header><section className="hub-intro"><p className="eyebrow">FUEGO / MODULE {isAria ? '01' : '02'}</p><Wordmark name={name} /><p className="hub-description">{isAria ? 'A synthetic heart exploring the space between code, conscience, and feeling.' : 'A midnight mind for the strange hours, the sharp questions, and the beautiful unknown.'}</p></section><div className="program-grid">{programs[character].map((program, index) => isAria && program === 'Starlight Log' ? <Link className="program-card" key={program} href="/aria/starlight-log"><span className="program-number">0{index + 1}</span><h2>{program}</h2><span className="program-status">Open log <span>↗</span></span></Link> : <article className="program-card" key={program}><span className="program-number">0{index + 1}</span><h2>{program}</h2><span className="program-status">Explore soon <span>↗</span></span></article>)}</div></main>
}
