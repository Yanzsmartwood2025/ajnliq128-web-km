'use client'

import Link from 'next/link'

export function RouteErrorState({ reset, label = 'este módulo' }: { reset: () => void; label?: string }) {
  return (
    <main className="module-error-state" role="alert">
      <div className="module-error-card">
        <img src="/assets/home/fuego.png" alt="" aria-hidden="true" />
        <strong>No se pudo abrir {label}</strong>
        <span>El resto del sistema sigue disponible.</span>
        <div>
          <button type="button" onClick={reset}>Reintentar</button>
          <Link href="/?skipIntro=1">Inicio</Link>
        </div>
      </div>
    </main>
  )
}
