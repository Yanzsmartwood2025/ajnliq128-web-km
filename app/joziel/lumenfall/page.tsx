'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const LUMENFALL_URL =
  process.env.NEXT_PUBLIC_LUMENFALL_URL || 'https://lumen-fall-official.vercel.app/'

function buildLumenfallUrl(idToken: string) {
  const target = new URL(LUMENFALL_URL)
  const params = new URLSearchParams()
  params.set('source', 'ajnliq128')
  params.set('returnTo', `${window.location.origin}/joziel`)
  params.set('loginUrl', `${window.location.origin}/?login=true`)
  target.search = params.toString()
  target.hash = `idToken=${encodeURIComponent(idToken)}`
  return target.toString()
}

export default function LumenfallBridgePage() {
  const { user, loading, signOut } = useAuth()
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
        if (!response.ok) throw new Error('No se pudo preparar la sesión central de Lumenfall.')
        const refreshedToken = await currentUser.getIdToken(true)
        if (!cancelled) setModuleUrl(buildLumenfallUrl(refreshedToken))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo abrir Lumenfall.')
        }
      }
    }

    openModule()
    return () => { cancelled = true }
  }, [ready, user])

  useEffect(() => {
    if (!user) return
    const lumenfallOrigin = new URL(LUMENFALL_URL).origin

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== lumenfallOrigin) return

      if (event.data?.type === 'AJN_LUMENFALL_TOKEN_REQUEST') {
        try {
          const token = await user.getIdToken(Boolean(event.data?.forceRefresh))
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'AJN_LUMENFALL_TOKEN_RESPONSE',
              token,
              requestId: event.data?.requestId,
            },
            lumenfallOrigin,
          )
        } catch {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'AJN_LUMENFALL_TOKEN_RESPONSE',
              error: 'token_refresh_failed',
              requestId: event.data?.requestId,
            },
            lumenfallOrigin,
          )
        }
      }

      if (event.data?.type === 'AJN_LUMENFALL_LOGOUT_REQUEST') {
        await signOut()
        window.location.href = '/?login=true'
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user, signOut])

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-black text-white grid place-items-center">
        Conectando con Lumenfall…
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-[100svh] bg-black text-white grid place-items-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Lumenfall pertenece a AJNLIQ128 / Joziel</h1>
          <p className="text-white/70">
            Inicia sesión en AJNLIQ128 para entrar con la misma identidad y progreso.
          </p>
          <Link
            href="/?login=true"
            className="inline-flex rounded-full border border-white/30 px-5 py-3 hover:bg-white hover:text-black transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 bg-black text-white">
      {error ? (
        <div className="h-full grid place-items-center px-6 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-lg">{error}</p>
            <button
              className="rounded-full border border-white/30 px-5 py-2"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : moduleUrl ? (
        <iframe
          ref={iframeRef}
          title="Lumenfall"
          src={moduleUrl}
          className="h-full w-full border-0 bg-black"
          allow="fullscreen; gamepad; autoplay"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="h-full grid place-items-center text-white/70">Preparando Lumenfall…</div>
      )}
    </main>
  )
}
