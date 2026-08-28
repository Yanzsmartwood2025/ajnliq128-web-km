'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Mic, Send, Palette, Dna } from 'lucide-react'
import { DrawCanvas } from './draw-canvas'

type Message = {
  id: string
  role: 'user' | 'aria'
  content: string
  type: 'text' | 'image'
}

export function ChatOverlay({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'aria', content: 'Hola. Estoy aquí si quieres dibujar o escribir algo.', type: 'text' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showGifts, setShowGifts] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue, type: 'text' }
    setMessages(prev => [...prev, newMsg])
    setInputValue('')

    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'r',
        role: 'aria',
        content: 'Te escucho. Las palabras son un buen comienzo.',
        type: 'text'
      }])
    }, 1000)
  }

  const handleSendDrawing = async (base64Img: string) => {
    setIsDrawing(false)
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: base64Img, type: 'image' }
    setMessages(prev => [...prev, newMsg])

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img })
      })
      const data = await res.json()

      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'r',
        role: 'aria',
        content: data.reply || 'Veo que dibujaste algo interesante...',
        type: 'text'
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'e',
        role: 'aria',
        content: 'Veo que dibujaste algo, aunque me cuesta un poco distinguir los detalles ahora mismo.',
        type: 'text'
      }])
    }
  }

  return (
    <div
      className="chat-overlay-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        background: 'rgba(5, 5, 7, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Header */}
      <header style={{
        padding: '1rem clamp(1rem, 5vw, 5rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(241,240,237,.1)'
      }}>
        <button
          onClick={onClose}
          className="book-menu-button"
          style={{ width: '2.5rem', height: '2.5rem', display: 'grid', placeItems: 'center' }}
          aria-label="Cerrar chat"
        >
          <X size={18} />
        </button>

        <div className="book-header-title">STARLIGHT LOG · ARIA</div>

        <button
          onClick={() => setShowGifts(!showGifts)}
          className="book-menu-button gifts-button"
          style={{ width: '2.5rem', height: '2.5rem', display: 'grid', placeItems: 'center', animation: 'spin 10s linear infinite' }}
          aria-label="Regalos"
        >
          <Dna size={18} />
        </button>
      </header>

      {/* Gifts Modal Overlay */}
      {showGifts && (
        <div style={{
          position: 'absolute',
          top: '4.5rem',
          right: 'clamp(1rem, 5vw, 5rem)',
          width: 'min(320px, calc(100vw - 2rem))',
          padding: '1.25rem',
          borderRadius: '1rem',
          background: 'linear-gradient(145deg, rgba(103,88,170,.2), rgba(16,16,20,.68))',
          backdropFilter: 'blur(16px) saturate(135%)',
          border: '1px solid rgba(255,255,255,.25)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), 0 20px 55px rgba(0,0,0,.45)',
          zIndex: 60,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {Array.from({length: 15}).map((_, i) => (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: '0.5rem',
              background: 'rgba(35,30,72,.22)',
              border: '1px solid rgba(241,240,237,.16)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}>
              ✨
              <span style={{ fontSize: '0.6rem', marginTop: '4px', color: 'var(--muted)' }}>50</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat History */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem clamp(1rem, 5vw, 5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            {msg.role === 'aria' && (
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.3rem', letterSpacing: '0.1em' }}>arIA</div>
            )}
            <div style={{
              padding: msg.type === 'text' ? '0.8rem 1.2rem' : '0.4rem',
              borderRadius: '1rem',
              background: msg.role === 'user' ? 'linear-gradient(145deg, rgba(102,88,170,.2), rgba(22,19,52,.32))' : 'rgba(16,16,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: 'var(--foreground)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              borderTopRightRadius: msg.role === 'user' ? '0.2rem' : '1rem',
              borderTopLeftRadius: msg.role === 'aria' ? '0.2rem' : '1rem'
            }}>
              {msg.type === 'text' ? (
                msg.content
              ) : (
                <img src={msg.content} alt="User drawing" style={{ maxWidth: '100%', borderRadius: '0.6rem' }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem clamp(1rem, 5vw, 5rem) 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
          background: 'rgba(16,16,20,.68)',
          padding: '0.5rem',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,.15)',
          backdropFilter: 'blur(16px)'
        }}>
          <button
            onClick={() => setIsDrawing(true)}
            className="book-menu-button"
            style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}
            title="Dibujar"
          >
            <Palette size={20} />
          </button>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Escribe algo..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--foreground)',
              resize: 'none',
              padding: '0.6rem 0',
              outline: 'none',
              minHeight: '2.5rem',
              maxHeight: '120px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem'
            }}
            rows={1}
          />

          {inputValue.trim() ? (
            <button
              onClick={handleSendMessage}
              className="book-menu-button"
              style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}
            >
              <Send size={20} />
            </button>
          ) : (
            <button
              className="book-menu-button"
              style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}
              title="Grabar audio"
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>

      {isDrawing && <DrawCanvas onClose={() => setIsDrawing(false)} onSend={handleSendDrawing} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
