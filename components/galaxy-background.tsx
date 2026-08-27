'use client'

import { useEffect, useState } from 'react'

export function GalaxyBackground() {
  const [motionReady, setMotionReady] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event: DeviceOrientationEvent) => {
      setOffset({ x: (event.gamma ?? 0) * 0.18, y: (event.beta ?? 0) * 0.08 })
    }
    const onPointer = (event: PointerEvent) => {
      setOffset({ x: (event.clientX / window.innerWidth - 0.5) * 12, y: (event.clientY / window.innerHeight - 0.5) * 8 })
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) setNeedsPermission(true)
    window.addEventListener('deviceorientation', onMove)
    return () => { window.removeEventListener('pointermove', onPointer); window.removeEventListener('deviceorientation', onMove) }
  }, [])

  async function enableMotion() {
    const permission = await (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission: () => Promise<string> }).requestPermission()
    if (permission === 'granted') { setMotionReady(true); setNeedsPermission(false) }
  }

  return <div className="galaxy" aria-hidden="true">
    <div className="stars stars-one" style={{ transform: `translate3d(${offset.x * 0.35}px, ${offset.y * 0.35}px, 0)` }} />
    <div className="stars stars-two" style={{ transform: `translate3d(${offset.x * 0.7}px, ${offset.y * 0.7}px, 0)` }} />
    <div className="galaxy-vignette" />
    {needsPermission && !motionReady && <button className="motion-button" onClick={enableMotion} aria-label="Activar movimiento del fondo">Activar movimiento</button>}
  </div>
}

export function FlameMark() {
  return <span className="flame-mark" aria-hidden="true"><span /></span>
}

export function Wordmark({ name }: { name: string }) { return <span className="wordmark">{name}</span> }
