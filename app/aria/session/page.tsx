'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AriaLaunchScreen } from '@/components/AriaLaunchScreen'

const ARIA_ORIGIN = new URL(process.env.NEXT_PUBLIC_ARIA_LLM_URL || 'https://aria-llm.vercel.app').origin

/** Top-level authorization window: reads AJN's existing, unpartitioned account. */
export default function AriaSessionPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [requestId, setRequestId] = useState('')
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('requestId') || ''
    if (!window.opener || !/^[A-Za-z0-9-]{16,80}$/.test(id)) {
      setError('Abre este acceso desde la aplicación arIA.'); return
    }
    setRequestId(id)
  }, [])
  useEffect(() => {
    if (!requestId || !window.opener) return
    const opener = window.opener
    const receive = (event: MessageEvent) => {
      if (event.origin !== ARIA_ORIGIN || event.source !== opener || event.data?.requestId !== requestId) return
      if (event.data?.type === 'AJN_ARIA_SSO_REQUEST') setRequested(true)
      if (event.data?.type === 'AJN_ARIA_SSO_ACK') window.close()
    }
    window.addEventListener('message', receive)
    opener.postMessage({ type: 'AJN_ARIA_SSO_READY', requestId }, ARIA_ORIGIN)
    return () => window.removeEventListener('message', receive)
  }, [requestId])
  useEffect(() => {
    if (loading || !requested || !requestId) return
    if (!user) {
      router.replace('/?login=true&skipIntro=1&next=%2Faria%2Fsession&requestId=' + encodeURIComponent(requestId))
      return
    }
    const controller = new AbortController()
    let active = true
    const timer = window.setTimeout(() => controller.abort(), 15000)
    void (async () => {
      try {
        const token = await user.getIdToken()
        controller.signal.throwIfAborted()
        const response = await fetch('/api/auth/token', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        const data = await response.json()
        if (!response.ok || typeof data.customToken !== 'string' || controller.signal.aborted) throw new Error('unavailable')
        window.opener?.postMessage({ type: 'AJN_ARIA_SSO_RESPONSE', requestId, customToken: data.customToken }, ARIA_ORIGIN)
      } catch {
        if (!active) return
        if (!controller.signal.aborted) setError('No se pudo preparar tu sesión. Reintenta desde arIA.')
        else setError('La conexión tardó demasiado. Reintenta desde arIA.')
      } finally { window.clearTimeout(timer) }
    })()
    return () => { active = false; window.clearTimeout(timer); controller.abort() }
  }, [user, loading, requested, requestId, router])
  if (error) return <main className="min-h-[100svh] grid place-items-center bg-black p-6 text-center text-white"><p role="alert">{error}</p></main>
  return <AriaLaunchScreen />
}
