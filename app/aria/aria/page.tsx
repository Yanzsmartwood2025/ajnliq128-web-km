'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const ARIA_MODULE_URL = process.env.NEXT_PUBLIC_ARIA_LLM_URL || 'https://aria-llm.vercel.app/'

function buildAriaUrl() {
  const target = new URL(ARIA_MODULE_URL)
  const params = new URLSearchParams()

  params.set('source', 'ajnliq128')
  params.set('returnTo', `${window.location.origin}/aria`)
  params.set('loginUrl', `${window.location.origin}/?login=true`)
  const studio = new URLSearchParams(window.location.search).get('studio')
  if (studio && /^[a-z-]{1,32}$/.test(studio)) params.set('studio', studio)
  target.search = params.toString()

  // Credentials travel only through the origin-checked iframe postMessage bridge.
  // Never place Firebase ID tokens into URLs, including fragments.
  return target.toString()
}

export default function AriaLLMBridgePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [moduleUrl, setModuleUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const ready = useMemo(() => !loading && Boolean(user), [loading, user])

  useEffect(() => {
    if (!loading && !user) {
      const studio = new URLSearchParams(window.location.search).get('studio')
      const query = studio && /^[a-z-]{1,32}$/.test(studio) ? `&studio=${encodeURIComponent(studio)}` : ''
      router.replace('/?login=true&skipIntro=1&next=%2Faria%2Faria' + query)
    }
  }, [loading, user, router])

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
        await currentUser.getIdToken(true)
        if (!cancelled) setModuleUrl(buildAriaUrl())
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
      if (event.origin !== ariaOrigin || event.source !== iframeRef.current?.contentWindow) return
      if (event.data?.type !== 'AJN_ARIA_TOKEN_REQUEST') return
      if (typeof event.data?.requestId !== 'string' || event.data.requestId.length > 128) return

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
    return <main className="min-h-[100svh] bg-black text-white grid place-items-center">Abriendo el inicio de sesión…</main>
  }

  return (
    <main className="fixed inset-0 bg-black text-white">
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
