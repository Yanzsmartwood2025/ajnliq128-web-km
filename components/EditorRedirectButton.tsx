'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function EditorRedirectButton() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEditorClick = async () => {
    if (!user) {
      // User is not logged in, set pending redirect flag and go to login
      localStorage.setItem('pendingEditorRedirect', 'true')
      router.push('/?login=true')
      return
    }

    setLoading(true)
    try {
      // User is logged in, fetch token and redirect to editor
      const idToken = await user.getIdToken()
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch auth token')
      }

      const data = await res.json()
      if (data.customToken) {
        const editorUrl = process.env.NEXT_PUBLIC_EDITOR_URL || 'https://editor.vercel.app'
        window.location.href = `${editorUrl}/#authToken=${data.customToken}`
      } else {
        throw new Error('Token generation failed')
      }
    } catch (err) {
      console.error('Error redirecting to editor:', err)
      // On error, revert loading state
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleEditorClick}
      disabled={loading}
      style={{
        marginTop: '2rem',
        padding: '0.8rem 2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '999px',
        color: 'var(--foreground)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        letterSpacing: '0.1em',
        transition: 'background 0.3s, border-color 0.3s, transform 0.2s',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {loading ? 'Redirigiendo...' : 'NAYLA EDITOR'}
    </button>
  )
}
