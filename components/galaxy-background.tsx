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
    const orientation = typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : undefined
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const requestPermission = orientation && 'requestPermission' in orientation && typeof orientation.requestPermission === 'function'

    window.addEventListener('pointermove', onPointer, { passive: true })
    if (isIOS && requestPermission) setNeedsPermission(true)
    if (!requestPermission) window.addEventListener('deviceorientation', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onMove)
    }
  }, [])

  async function enableMotion() {
    try {
      const requestPermission = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission: () => Promise<string> }).requestPermission
      const permission = await requestPermission()
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', onOrientation, { passive: true })
        setMotionReady(true)
        setNeedsPermission(false)
      }
    } catch {
      setNeedsPermission(false)
    }
  }

  function onOrientation(event: DeviceOrientationEvent) {
    setOffset({ x: (event.gamma ?? 0) * 0.18, y: (event.beta ?? 0) * 0.08 })
  }

  return <>
    <div className="galaxy" aria-hidden="true">
      <div className="stars stars-one" style={{ transform: `translate3d(${offset.x * 0.35}px, ${offset.y * 0.35}px, 0)` }} />
      <div className="stars stars-two" style={{ transform: `translate3d(${offset.x * 0.7}px, ${offset.y * 0.7}px, 0)` }} />
      <div className="galaxy-vignette" />
    </div>
    {needsPermission && !motionReady && <button className="motion-button" onClick={enableMotion} aria-label="Activar movimiento del fondo">Activar movimiento</button>}
  </>
}

export function FlameMark() {
  return <span className="flame-mark" aria-hidden="true"><span /></span>
}

export function Wordmark({ name }: { name: string }) { return <span className="wordmark">{name}</span> }
