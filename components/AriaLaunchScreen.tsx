/** Uses the original local arIA logo, including before client hydration. */
export function AriaLaunchScreen() {
  return (
    <div role="status" aria-label="Abriendo arIA" data-aria-launch="true"
      style={{ position: 'fixed', inset: 0, zIndex: 2147483646, boxSizing: 'border-box', display: 'grid', placeItems: 'center', background: '#000', padding: 'max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))' }}>
      <img src="/branding/aria-logo-source.png" alt="arIA" width="328" height="172"
        style={{ display: 'block', width: 'clamp(160px, 42vw, 260px)', maxWidth: '70vw', height: 'auto', objectFit: 'contain' }} />
    </div>
  )
}
