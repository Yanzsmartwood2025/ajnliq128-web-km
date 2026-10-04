'use client'

import { useEffect, useRef } from 'react'

type Props = {
  color?: string
  color2?: string
  speed?: number
  density?: number
  length?: number
  thickness?: number
  opacity?: number
  className?: string
}

const hexToRgb = (hex: string) => {
  const raw = hex.replace('#', '').trim()
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return [255, 255, 255]
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function FloatingLines({
  color = '#ffffff',
  color2 = '#87cfff',
  speed = 1,
  density = 1,
  length = 1,
  thickness = 1,
  opacity = .48,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const host = canvas.parentElement
    const ctx = canvas.getContext('2d')
    if (!host || !ctx) return

    let animationFrameId = 0
    let lastFrame = 0
    let width = 1
    let height = 1
    let dpr = 1
    const isMobile = window.innerWidth < 768
    const targetFrameMs = isMobile ? 1000 / 30 : 1000 / 60
    const c1 = hexToRgb(color)
    const c2 = hexToRgb(color2)
    const count = Math.max(8, Math.round((isMobile ? 22 : 40) * Math.max(.4, Math.min(2, density))))
    const velocity = Math.max(.15, Math.min(3, speed))
    const lengthScale = Math.max(.5, Math.min(2, length))
    const widthScale = Math.max(.4, Math.min(2, thickness))
    const alphaScale = Math.max(.05, Math.min(1, opacity))

    const lines = Array.from({ length: count }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - .5) * velocity,
      vy: (Math.random() - .5) * velocity,
      lineLength: (Math.random() * 110 + 45) * lengthScale,
      lineWidth: (Math.random() * 1.45 + .45) * widthScale,
      alpha: (Math.random() * .45 + .18) * alphaScale,
      mix: index / Math.max(count - 1, 1),
    }))

    const resize = () => {
      const rect = host.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const render = (time = performance.now()) => {
      animationFrameId = requestAnimationFrame(render)
      if (document.hidden || time - lastFrame < targetFrameMs) return
      lastFrame = time
      ctx.clearRect(0, 0, width, height)

      lines.forEach((line) => {
        let x = line.x * width
        let y = line.y * height
        x += line.vx
        y += line.vy
        line.x = x / width
        line.y = y / height

        if (x < -180) line.x = (width + 180) / width
        else if (x > width + 180) line.x = -180 / width
        if (y < -180) line.y = (height + 180) / height
        else if (y > height + 180) line.y = -180 / height

        const r = Math.round(c1[0] + (c2[0] - c1[0]) * line.mix)
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * line.mix)
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * line.mix)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + line.vx * line.lineLength, y + line.vy * line.lineLength)
        ctx.strokeStyle = `rgba(${r},${g},${b},${line.alpha})`
        ctx.lineWidth = line.lineWidth
        ctx.stroke()
      })
    }

    animationFrameId = requestAnimationFrame(render)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, color2, speed, density, length, thickness, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'transparent' }}
    />
  )
}
