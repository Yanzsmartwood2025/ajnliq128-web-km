'use client'

import React, { useRef, useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function DrawCanvas({ onClose, onSend }: { onClose: () => void, onSend: (base64Img: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.strokeStyle = 'white'
        context.lineWidth = 4
        setCtx(context)
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return
    setIsDrawing(true)
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
    ctx.beginPath()
    ctx.moveTo(clientX, clientY)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
    ctx.lineTo(clientX, clientY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!ctx) return
    ctx.closePath()
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSend = () => {
    const canvas = canvasRef.current
    if (canvas) {
      // Get the image data
      const dataUrl = canvas.toDataURL('image/png')
      onSend(dataUrl)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(5,5,7,0.95)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 101
        }}
        aria-label="Cerrar dibujo"
      >
        <X size={20} />
      </button>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ flex: 1, touchAction: 'none' }}
      />
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        background: 'rgba(16,16,20,.68)',
        padding: '0.75rem',
        borderRadius: '2rem',
        border: '1px solid rgba(255,255,255,.15)',
        backdropFilter: 'blur(16px)'
      }}>
        <button
          onClick={onClose}
          style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleClear}
          style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem', color: 'white', cursor: 'pointer' }}
        >
          Borrar
        </button>
        <button
          onClick={handleSend}
          style={{ padding: '0.5rem 1rem', background: 'linear-gradient(145deg, rgba(102,88,170,.4), rgba(22,19,52,.6))', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1rem', color: 'white', cursor: 'pointer' }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
