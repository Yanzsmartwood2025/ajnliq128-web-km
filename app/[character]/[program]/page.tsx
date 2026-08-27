import Link from 'next/link'
import { notFound } from 'next/navigation'
import { characterLabels, isProgramEnabled, programLabels, type Character } from '@/lib/module-flags'

export default async function ProgramPage({ params }: { params: Promise<{ character: string; program: string }> }) {
  const { character, program } = await params
  if (character !== 'aria' && character !== 'joziel') notFound()
  const module = character as Character
  const title = programLabels[program] ?? program.replace(/-/g, ' ')
  const enabled = isProgramEnabled(module, program)

  return <main className="program-page">
    <Link href={`/${module}`} className="program-page-back">← Back to {characterLabels[module]}</Link>
    <section className="program-placeholder" aria-live="polite">
      <p className="program-placeholder-kicker">{characterLabels[module]} / MODULE</p>
      <h1>{title}</h1>
      {enabled ? <><p>This is the {title} module.</p><span className="program-placeholder-note">Content is being prepared for this frequency.</span></> : <><p className="program-unavailable">Not available temporarily</p><span className="program-placeholder-note">This module has been paused independently.</span></>}
    </section>
  </main>
}
