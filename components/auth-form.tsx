'use client'

import Link from 'next/link'
import { FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { getClientAuth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useToastManager } from '@/components/ui/toast'
import { FirebaseError } from 'firebase/app'
import { useRouter } from 'next/navigation'

export function AuthForm({ mode, onClose, onSwitchMode }: { mode: 'login' | 'register', onClose?: () => void, onSwitchMode?: (mode: 'login' | 'register') => void }) {
  const isRegister = mode === 'register'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToastManager()
  const { user } = useAuth()
  const router = useRouter()

  function getErrorMessage(code: string) {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email o contraseña incorrectos.'
      case 'auth/email-already-in-use':
        return 'El email ya está registrado.'
      case 'auth/weak-password':
        return 'La contraseña es muy débil (mínimo 6 caracteres).'
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de Google antes de terminar.'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.'
      default:
        return 'Ocurrió un error. Intenta de nuevo.'
    }
  }

  async function handleGoogleAuth() {
    setError('')
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(getClientAuth(), provider)
      toast.add({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión con éxito.',
        type: 'success'
      })
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof FirebaseError) {
        toast.add({
          title: 'Error de autenticación',
          description: getErrorMessage(err.code),
          type: 'error'
        })
      } else {
        toast.add({
          title: 'Error',
          description: 'No se pudo conectar con Google.',
          type: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    const confirmation = String(form.get('confirmation') || '')

    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Ingresá un email válido.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (isRegister && password !== confirmation) return setError('Las contraseñas no coinciden.')

    setLoading(true)

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(getClientAuth(), email, password)
        toast.add({
          title: 'Cuenta creada',
          description: 'Tu cuenta ha sido creada exitosamente.',
          type: 'success'
        })
      } else {
        await signInWithEmailAndPassword(getClientAuth(), email, password)
        toast.add({
          title: '¡Hola de nuevo!',
          description: 'Has iniciado sesión con éxito.',
          type: 'success'
        })
      }
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof FirebaseError) {
        toast.add({
          title: isRegister ? 'Error al registrarse' : 'Error al iniciar sesión',
          description: getErrorMessage(err.code),
          type: 'error'
        })
      } else {
        toast.add({
          title: 'Error',
          description: 'Ha ocurrido un error inesperado.',
          type: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Si ya está logueado, podríamos mostrar un mensaje diferente en este componente
  if (user) {
    return (
      <div className={onClose ? '' : 'auth-page'}>
        <section className="auth-panel" aria-labelledby="auth-title" style={{ background: 'transparent', textAlign: 'center' }}>
          <h1 id="auth-title" style={{ marginBottom: '1rem' }}>Ya estás conectado</h1>
          <p className="auth-lede" style={{ marginBottom: '2rem' }}>Has iniciado sesión como {user.email}</p>
          {onClose ? (
            <button type="button" onClick={onClose} className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>Cerrar</button>
          ) : (
            <Link href="/" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>Ir al inicio</Link>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className={onClose ? '' : 'auth-page'}>
      <section className="auth-panel" aria-labelledby="auth-title" style={{ background: 'transparent' }}>
        <div className="auth-panel-topline">
          <p className="auth-kicker">AJNLIQ128 / FUEGO</p>
          {onClose ? (
            <button type="button" onClick={onClose} className="auth-back" aria-label="Volver a FUEGO" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
          ) : (
            <Link href="/" className="auth-back" aria-label="Volver a FUEGO">← Volver</Link>
          )}
        </div>
        <h1 id="auth-title">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="auth-lede">{isRegister ? 'Entrá a la constelación.' : 'Volvé a tu frecuencia.'}</p>
        <button className="google-auth-button" type="button" onClick={handleGoogleAuth} disabled={loading}>
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.54 13.69a5.86 5.86 0 0 1 0-3.38V7.79H3.3a9.76 9.76 0 0 0 0 8.42l3.24-2.52Z"/><path fill="#EA4335" d="M12 6.28c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.27 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z"/></svg>
          Continuar con Google
        </button>
        <div className="auth-divider" aria-hidden="true"><span>o</span></div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && <label>Nombre<input name="name" type="text" autoComplete="name" required disabled={loading} /></label>}
          <label>Email<input name="email" type="email" autoComplete="email" required disabled={loading} /></label>
          <label>Contraseña<input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required disabled={loading} /></label>
          {isRegister && <label>Confirmar contraseña<input name="confirmation" type="password" autoComplete="new-password" required disabled={loading} /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Cargando...' : (isRegister ? 'Crear cuenta' : 'Entrar')}</button>
        </form>
        {!isRegister ? (
          <div className="auth-links">
            {onSwitchMode ? (
              <button type="button" onClick={() => {
                toast.add({ title: 'Recuperar contraseña', description: 'Función no implementada en la demo todavía.', type: 'info' })
              }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}>¿Olvidaste tu contraseña?</button>
            ) : (
              <Link href="/login?forgot=1">¿Olvidaste tu contraseña?</Link>
            )}
            {onSwitchMode ? (
              <button type="button" onClick={() => onSwitchMode('register')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}>Crear cuenta</button>
            ) : (
              <Link href="/registro">Crear cuenta</Link>
            )}
          </div>
        ) : (
          <p className="auth-switch">
            ¿Ya tenés una cuenta?{' '}
            {onSwitchMode ? (
              <button type="button" onClick={() => onSwitchMode('login')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}>Iniciar sesión</button>
            ) : (
              <Link href="/login">Iniciar sesión</Link>
            )}
          </p>
        )}
      </section>
    </div>
  )
}

export function LoginHeader({ onLoginClick }: { onLoginClick?: () => void }) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (user) {
      setIsExpanded(true)
      const timer = setTimeout(() => setIsExpanded(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [user])

  if (loading) return null

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(35, 30, 72, 0.28)',
            padding: isExpanded ? '0.2rem 0.6rem 0.2rem 0.2rem' : '0.2rem',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(14px)',
            cursor: 'pointer',
            transition: 'padding 0.3s ease'
          }}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="Perfil" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' }}>
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 20c.65-3.15 2.85-5 6.5-5s5.85 1.85 6.5 5" />
              </svg>
            </div>
          )}
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--foreground)',
            maxWidth: isExpanded ? '200px' : '0px',
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            marginLeft: isExpanded ? '0.5rem' : '0px',
            transition: 'max-width 0.3s ease, opacity 0.3s ease, margin-left 0.3s ease',
            whiteSpace: 'nowrap'
          }}>
            {user.email}
          </span>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, scale: 1, width: '2.35rem', marginLeft: '0.75rem' }}
              exit={{ opacity: 0, scale: 0.8, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.3 }}
              onClick={async () => {
                await signOut()
                router.push('/')
              }}
              className="login-button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              style={{ height: '2.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg className="login-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (onLoginClick) {
    return (
      <button onClick={onLoginClick} className="login-button" aria-label="Iniciar sesión" title="Iniciar sesión" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.25)' }}>
        <svg className="login-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20c.65-3.15 2.85-5 6.5-5s5.85 1.85 6.5 5" />
        </svg>
      </button>
    )
  }

  return (
    <Link href="/login" className="login-button" aria-label="Iniciar sesión" title="Iniciar sesión">
      <svg className="login-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20c.65-3.15 2.85-5 6.5-5s5.85 1.85 6.5 5" />
      </svg>
    </Link>
  )
}

export function SiteHeader() {
  return <header className="site-header"><Link href="/" className="site-wordmark">AJNLIQ128</Link><LoginHeader /></header>
}
