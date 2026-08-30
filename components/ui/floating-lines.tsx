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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)
    resize()

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      lines.forEach(line => {
        line.x += line.vx
        line.y += line.vy

        if (line.x < -200) line.x = canvas.width + 200
        else if (line.x > canvas.width + 200) line.x = -200

        if (line.y < -200) line.y = canvas.height + 200
        else if (line.y > canvas.height + 200) line.y = -200

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
        background: '#000'
      }}
    />
  )
}
