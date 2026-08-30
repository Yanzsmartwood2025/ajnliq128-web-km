import Link from 'next/link'

export default function NaylaPage() {
  return (
    <main className="program-page nayla-page">
      <Link href="/" className="program-page-back">← Back to FUEGO</Link>
      <section className="program-placeholder" aria-live="polite">
        <p className="program-placeholder-kicker">NAYLA / CHANNEL</p>
        <h1>NAYLA</h1>
        <p>The third frequency is now open.</p>
        <span className="program-placeholder-note">Nayla is ready to receive you.</span>
      </section>
    </main>
  )
}
