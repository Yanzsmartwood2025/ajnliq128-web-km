'use client'

import { useRef, useEffect } from 'react'

export function AnimatedGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let timeoutId: NodeJS.Timeout

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)
    resize()

    const render = () => {
      // Create grain effect
      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 12 // Alpha - very subtle
      }

      ctx.putImageData(imageData, 0, 0)

      // We only update every 50ms for a more authentic grainy feel
      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(render)
      }, 50)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#000'
      }}
    />
  )
}
