'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    const confirmation = String(form.get('confirmation') || '')
    setError('')
    setSubmitted(false)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Ingresá un email válido.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (isRegister && password !== confirmation) return setError('Las contraseñas no coinciden.')
    setSubmitted(true)
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-panel-topline">
          <p className="auth-kicker">AJNLIQ128 / FUEGO</p>
          <Link href="/" className="auth-back" aria-label="Volver a FUEGO">← Volver</Link>
        </div>
        <h1 id="auth-title">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="auth-lede">{isRegister ? 'Entrá a la constelación.' : 'Volvé a tu frecuencia.'}</p>
        <button className="google-auth-button" type="button" onClick={() => setSubmitted(true)}>
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.54 13.69a5.86 5.86 0 0 1 0-3.38V7.79H3.3a9.76 9.76 0 0 0 0 8.42l3.24-2.52Z"/><path fill="#EA4335" d="M12 6.28c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.27 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z"/></svg>
          Continuar con Google
        </button>
        <div className="auth-divider" aria-hidden="true"><span>o</span></div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && <label>Nombre<input name="name" type="text" autoComplete="name" required /></label>}
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Contraseña<input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required /></label>
          {isRegister && <label>Confirmar contraseña<input name="confirmation" type="password" autoComplete="new-password" required /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {submitted && <p className="auth-success" role="status">Interfaz demo: conexión pendiente.</p>}
          <button className="auth-submit" type="submit">{isRegister ? 'Crear cuenta' : 'Entrar'}</button>
        </form>
        {!isRegister ? <div className="auth-links"><Link href="/login?forgot=1">¿Olvidaste tu contraseña?</Link><Link href="/registro">Crear cuenta</Link></div> : <p className="auth-switch">¿Ya tenés una cuenta? <Link href="/login">Iniciar sesión</Link></p>}
      </section>
    </main>
  )
}

export function LoginHeader() {
  return <Link href="/login" className="login-button">Iniciar sesión</Link>
}

export function SiteHeader() {
  return <header className="site-header"><Link href="/" className="site-wordmark">AJNLIQ128</Link><LoginHeader /></header>
}
