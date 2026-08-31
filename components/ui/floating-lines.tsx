'use client'

import { useRef, useEffect } from 'react'

export function FloatingLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const lines = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      length: Math.random() * 150 + 50,
      width: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    }))

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr

      // We don't necessarily need to scale the context with ctx.scale(dpr, dpr) here
      // if we are keeping the logic pixel-based and mapping to canvas.width,
      // but to keep math in CSS pixels, it's easier.
      // Wait, the lines logic generates random positions based on window.innerWidth!
      // If we scale the canvas width, the bounds logic uses canvas.width.
      // Let's adjust bounds to be based on window.innerWidth instead of canvas.width,
      // and use ctx.scale to scale all drawing commands.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    window.addEventListener('resize', resize)
    resize()

    const render = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      // Clear scaled space
      ctx.clearRect(0, 0, w, h)

      lines.forEach(line => {
        line.x += line.vx
        line.y += line.vy

        if (line.x < -200) line.x = w + 200
        else if (line.x > w + 200) line.x = -200

        if (line.y < -200) line.y = h + 200
        else if (line.y > h + 200) line.y = -200

        ctx.beginPath()
        ctx.moveTo(line.x, line.y)
        ctx.lineTo(line.x + line.vx * line.length, line.y + line.vy * line.length)

        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`
        ctx.lineWidth = line.width
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
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
        background: 'transparent' // Changed to let it act as an overlay/underlay without hiding everything if it is z-index -1
      }}
    />
  )
}
