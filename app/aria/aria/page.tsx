'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const ARIA_MODULE_URL = process.env.NEXT_PUBLIC_ARIA_LLM_URL || 'https://aria-llm.vercel.app/'

function buildAriaUrl(idToken: string) {
  const target = new URL(ARIA_MODULE_URL)
  const params = new URLSearchParams()

  params.set('source', 'ajnliq128')
  params.set('returnTo', `${window.location.origin}/aria`)
  params.set('loginUrl', `${window.location.origin}/?login=true`)
  target.search = params.toString()

  // Fragment data never reaches Vercel/server logs. arIA consumes it in the browser
  // and immediately removes it from the visible URL.
  target.hash = `idToken=${encodeURIComponent(idToken)}`
  return target.toString()
}

export default function AriaLLMBridgePage() {
  const { user, loading } = useAuth()
  const [moduleUrl, setModuleUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const ready = useMemo(() => !loading && Boolean(user), [loading, user])

  useEffect(() => {
    if (!ready || !user) return
    const currentUser = user
    let cancelled = false

    async function openModule() {
      try {
        const currentToken = await currentUser.getIdToken()
        const response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        })
        if (!response.ok) throw new Error('No se pudo preparar la sesión central de arIA.')

        // Force refresh so the JWT includes role=authenticated for Supabase.
        const refreshedToken = await currentUser.getIdToken(true)
        if (!cancelled) setModuleUrl(buildAriaUrl(refreshedToken))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo abrir arIA.')
      }
    }

    openModule()
    return () => { cancelled = true }
  }, [ready, user])

  useEffect(() => {
    if (!user) return
    const ariaOrigin = new URL(ARIA_MODULE_URL).origin

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== ariaOrigin) return
      if (event.data?.type !== 'AJN_ARIA_TOKEN_REQUEST') return

      try {
        const token = await user.getIdToken(Boolean(event.data?.forceRefresh))
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'AJN_ARIA_TOKEN_RESPONSE', token, requestId: event.data?.requestId },
          ariaOrigin,
        )
      } catch {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'AJN_ARIA_TOKEN_RESPONSE', error: 'token_refresh_failed', requestId: event.data?.requestId },
          ariaOrigin,
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user])

  if (loading) {
    return <main className="min-h-[100svh] bg-black text-white grid place-items-center">Conectando con arIA…</main>
  }

  if (!user) {
    return (
      <main className="min-h-[100svh] bg-black text-white grid place-items-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">arIA pertenece a AJNLIQ128</h1>
          <p className="text-white/70">Inicia sesión en la central para entrar con la misma identidad y memoria.</p>
          <Link href="/?login=true" className="inline-flex rounded-full border border-white/30 px-5 py-3 hover:bg-white hover:text-black transition">Iniciar sesión</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 bg-black text-white">
      <div className="absolute left-3 top-3 z-50 flex items-center gap-2">
        <Link href="/aria" className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-sm backdrop-blur hover:bg-white hover:text-black transition">← Aria</Link>
        <span className="hidden sm:inline rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/60">AJNLIQ128 / Aria / arIA</span>
      </div>

      {error ? (
        <div className="h-full grid place-items-center px-6 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-lg">{error}</p>
            <button className="rounded-full border border-white/30 px-5 py-2" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      ) : moduleUrl ? (
        <iframe
          ref={iframeRef}
          title="arIA"
          src={moduleUrl}
          className="h-full w-full border-0 bg-black"
          allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="h-full grid place-items-center text-white/70">Preparando arIA…</div>
      )}
    </main>
  )
}
