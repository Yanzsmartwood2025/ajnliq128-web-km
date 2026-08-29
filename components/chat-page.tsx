'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Send, Image as ImageIcon, Palette } from 'lucide-react'
import { DrawCanvas } from './draw-canvas'

type Message = {
  id: string
  role: 'user' | 'aria'
  content: string
  type: 'text' | 'image'
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'aria', content: 'Hola. Estoy aquí si quieres dibujar o escribir algo.', type: 'text' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [displayedTypingText, setDisplayedTypingText] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, displayedTypingText])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue, type: 'text' }
    setMessages(prev => [...prev, newMsg])
    setInputValue('')
    setShowPlusMenu(false)

    // Mock response with typewriter effect
    const responseId = Date.now().toString() + 'r'
    const fullResponse = 'Te escucho. Las palabras son un buen comienzo.'

    setMessages(prev => [...prev, {
      id: responseId,
      role: 'aria',
      content: fullResponse,
      type: 'text'
    }])

    // Start typewriter effect
    setTypingMessageId(responseId)
    setDisplayedTypingText('')

    let i = 0
    const interval = setInterval(() => {
      setDisplayedTypingText(fullResponse.slice(0, i + 1))
      i++
      if (i >= fullResponse.length) {
        clearInterval(interval)
        setTypingMessageId(null)
      }
    }, 50)
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

      const responseId = Date.now().toString() + 'r'
      const fullResponse = data.reply || 'Veo que dibujaste algo interesante...'

      setMessages(prev => [...prev, {
        id: responseId,
        role: 'aria',
        content: fullResponse,
        type: 'text'
      }])

      // Start typewriter effect
      setTypingMessageId(responseId)
      setDisplayedTypingText('')

      let i = 0
      const interval = setInterval(() => {
        setDisplayedTypingText(fullResponse.slice(0, i + 1))
        i++
        if (i >= fullResponse.length) {
          clearInterval(interval)
          setTypingMessageId(null)
        }
      }, 50)
    } catch (e) {
      const responseId = Date.now().toString() + 'e'
      const fullResponse = 'Veo que dibujaste algo, aunque me cuesta un poco distinguir los detalles ahora mismo.'

      setMessages(prev => [...prev, {
        id: responseId,
        role: 'aria',
        content: fullResponse,
        type: 'text'
      }])

      // Start typewriter effect
      setTypingMessageId(responseId)
      setDisplayedTypingText('')

      let i = 0
      const interval = setInterval(() => {
        setDisplayedTypingText(fullResponse.slice(0, i + 1))
        i++
        if (i >= fullResponse.length) {
          clearInterval(interval)
          setTypingMessageId(null)
        }
      }, 50)
    }
  }

  // Prevent event propagation so scrolling inside chat doesn't flip the book page
  const stopPropagation = (e: React.UIEvent | React.PointerEvent | React.TouchEvent | React.WheelEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="book-face book-chat-page"
      onPointerDown={stopPropagation}
      onTouchStart={stopPropagation}
      onWheel={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <div className="book-kicker" style={{ padding: '0.8rem 1rem 0' }}>ST★RLIGHT LOG / ARIA CHAT</div>

      {/* Chat History */}
      <div className="chat-history" ref={scrollRef}>
        {messages.map(msg => {
          const isTyping = msg.id === typingMessageId
          return (
            <div key={msg.id} className={`chat-message-row ${msg.role}`}>
              {msg.role === 'aria' && (
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.3rem', letterSpacing: '0.1em' }}>arIA</div>
              )}
              <div className="chat-bubble">
                {msg.type === 'text' ? (
                  isTyping ? displayedTypingText : msg.content
                ) : (
                  <img src={msg.content} alt="User upload" style={{ maxWidth: '100%', borderRadius: '0.5rem' }} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <button
          className="chat-action-button"
          onClick={() => setShowPlusMenu(!showPlusMenu)}
        >
          <Plus size={18} />
        </button>

        {showPlusMenu && (
          <div className="chat-plus-menu">
            <button onClick={() => { setIsDrawing(true); setShowPlusMenu(false); }}>
              <Palette size={16} />
              Dibujar
            </button>
            <button onClick={() => setShowPlusMenu(false)}>
              <ImageIcon size={16} />
              Subir Foto
            </button>
          </div>
        )}

        <input
          type="text"
          className="chat-input"
          placeholder="Escribe algo..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
        />

        <button
          className="chat-action-button"
          onClick={handleSendMessage}
          style={{ opacity: inputValue.trim() ? 1 : 0.5, pointerEvents: inputValue.trim() ? 'auto' : 'none' }}
        >
          <Send size={16} />
        </button>
      </div>

      {isDrawing && <DrawCanvas onClose={() => setIsDrawing(false)} onSend={handleSendDrawing} />}
    </div>
  )
}
