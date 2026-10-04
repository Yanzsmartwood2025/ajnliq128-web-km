'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { Character } from '@/lib/character-assets'
import type { CharacterSceneSettings } from '@/lib/character-scene-settings'
import { AuthForm } from './auth-form'
import { CharacterSceneSettingsDialog } from './character-scene-settings'

export function CharacterMenu({
  character,
  sceneSettings,
  onSceneSettingsChange,
}: {
  character: Character
  sceneSettings: CharacterSceneSettings
  onSceneSettingsChange: (settings: CharacterSceneSettings) => void
}) {
  const [open, setOpen] = useState(false)
  const [sceneOpen, setSceneOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const { user, loading, signOut } = useAuth()
  const usesGoogle = Boolean(user?.providerData?.some((provider) => provider.providerId === 'google.com'))

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  const openSceneSettings = () => {
    setOpen(false)
    setSceneOpen(true)
  }

  const openLogin = () => {
    setOpen(false)
    setAuthMode('login')
  }

  return (
    <>
      <CharacterSceneSettingsDialog
        character={character}
        open={sceneOpen}
        onOpenChange={setSceneOpen}
        settings={sceneSettings}
        onChange={onSceneSettingsChange}
      />

      <header className="hub-header hub-header-clean">
        <button
          type="button"
          className="fuego-menu-button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label="Abrir opciones"
        >
          <img src="/assets/home/fuego.png" alt="" aria-hidden="true" />
        </button>
      </header>

      {open && (
        <>
          <button
            className="hub-menu-scrim"
            type="button"
            aria-label="Cerrar opciones"
            onClick={() => setOpen(false)}
          />
          <aside className="hub-menu hub-menu-crystal" aria-label="Opciones del canal">
            <div className="hub-menu-topline">
              <div className="hub-menu-brand" aria-hidden="true">
                <img src="/assets/home/fuego.png" alt="" />
              </div>
              <button
                type="button"
                className="hub-menu-close"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="hub-session-card" aria-live="polite">
              <span className="hub-session-avatar" aria-hidden="true">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : usesGoogle ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z" />
                    <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6Z" />
                    <path fill="#FBBC05" d="M6.54 13.69a5.86 5.86 0 0 1 0-3.38V7.79H3.3a9.76 9.76 0 0 0 0 8.42l3.24-2.52Z" />
                    <path fill="#EA4335" d="M12 6.28c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.27 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="hub-session-email-icon">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                    <path d="m4.5 7 7.5 5.7L19.5 7" />
                  </svg>
                )}
              </span>

              <span className="hub-session-copy">
                <strong>{loading ? 'Comprobando sesión…' : user ? 'Sesión activa' : 'Sin sesión activa'}</strong>
                {!loading && user?.email && <span>{user.email}</span>}
                {!loading && !user && <span>Accede para sincronizar tu cuenta.</span>}
              </span>
            </div>

            <button type="button" onClick={openSceneSettings}>Ajustes del canal</button>
            <Link href="/?skipIntro=1" onClick={() => setOpen(false)}>Inicio</Link>

            {!loading && !user && (
              <button type="button" onClick={openLogin}>Iniciar sesión</button>
            )}

            {!loading && user && (
              <button type="button" onClick={handleSignOut}>Cerrar sesión</button>
            )}
          </aside>
        </>
      )}

      {authMode && (
        <div className="hub-auth-modal" role="dialog" aria-modal="true" aria-label="Acceso">
          <button
            type="button"
            className="hub-auth-scrim"
            aria-label="Cerrar acceso"
            onClick={() => setAuthMode(null)}
          />
          <div className="hub-auth-panel">
            <AuthForm
              mode={authMode}
              onClose={() => setAuthMode(null)}
              onSwitchMode={setAuthMode}
            />
          </div>
        </div>
      )}
    </>
  )
}
