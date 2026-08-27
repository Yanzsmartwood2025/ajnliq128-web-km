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
        <Link href="/" className="auth-back">← Volver a FUEGO</Link>
        <p className="auth-kicker">AJNLIQ128 / FUEGO</p>
        <h1 id="auth-title">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="auth-lede">{isRegister ? 'Entrá a la constelación.' : 'Volvé a tu frecuencia.'}</p>
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
