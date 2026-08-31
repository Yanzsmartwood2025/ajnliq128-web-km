'use client'

import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { BubbleWrapper } from './BubbleWrapper'
import { mediaUrl } from '@/lib/media-urls'

interface PhysicsBubblesProps {
  onSelectModule: (module: 'ARIA' | 'JOZIEL' | 'NAYLA') => void;
}

export default function PhysicsBubbles({ onSelectModule }: PhysicsBubblesProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)

  const [positions, setPositions] = useState({
    ARIA: { x: -1000, y: -1000, angle: 0 },
    JOZIEL: { x: -1000, y: -1000, angle: 0 },
    NAYLA: { x: -1000, y: -1000, angle: 0 },
  })
  const [isReady, setIsReady] = useState(false)

  // To track click vs drag
  const clickPosRef = useRef<{x: number, y: number, time: number} | null>(null)

  useEffect(() => {
    if (!sceneRef.current) return

    const sceneEl = sceneRef.current
    const width = sceneEl.clientWidth || window.innerWidth
    const height = sceneEl.clientHeight || window.innerHeight

    // Initialize Engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }
    })
    engineRef.current = engine

    // Create bodies
    const radius = window.innerWidth < 768 ? 40 : 60 // responsive radius roughly matching original
    const options = {
      restitution: 0.8, // Bounciness
      friction: 0.05,
      frictionAir: 0.02,
      density: 0.001
    }

    // AJN starting positions relative to center
    const center = { x: width / 2, y: height / 2 }
    const initialPositions = {
      ARIA: { x: center.x - width * 0.25, y: center.y - height * 0.1 },
      JOZIEL: { x: center.x + width * 0.25, y: center.y + height * 0.15 },
      NAYLA: { x: center.x, y: center.y - height * 0.25 }
    }

    const ariaBody = Matter.Bodies.circle(initialPositions.ARIA.x, initialPositions.ARIA.y, radius, { ...options, label: 'ARIA' })
    const jozielBody = Matter.Bodies.circle(initialPositions.JOZIEL.x, initialPositions.JOZIEL.y, radius, { ...options, label: 'JOZIEL' })
    const naylaBody = Matter.Bodies.circle(initialPositions.NAYLA.x, initialPositions.NAYLA.y, radius, { ...options, label: 'NAYLA' })

    const bodiesMap: Record<string, Matter.Body> = {
      ARIA: ariaBody,
      JOZIEL: jozielBody,
      NAYLA: naylaBody
    }

    // Walls
    const wallOptions = { isStatic: true, restitution: 1.0, friction: 0 }
    const walls = [
      Matter.Bodies.rectangle(width / 2, -50, width * 2, 100, wallOptions), // Top
      Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, wallOptions), // Bottom
      Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions), // Left
      Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions) // Right
    ]

    Matter.Composite.add(engine.world, [ariaBody, jozielBody, naylaBody, ...walls])

    // Mouse constraint for dragging
    // We attach the mouse to the sceneRef, but since it's full overlay, we need to ensure events pass through or are captured properly.
    const mouse = Matter.Mouse.create(sceneEl)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    })

    // Allow scrolling through the canvas when not interacting with a body
    // Typecast for Matter.Mouse internals
    const m = mouseConstraint.mouse as any;
    if (m.mousewheel) {
      m.element.removeEventListener("mousewheel", m.mousewheel);
      m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    }

    Matter.Composite.add(engine.world, mouseConstraint)

    // Spring/Gravity logic to return to initial positions
    let lastInteractionTime = Date.now()

    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      lastInteractionTime = Date.now()
    })
    Matter.Events.on(mouseConstraint, 'mousemove', () => {
      if (mouseConstraint.body) {
         lastInteractionTime = Date.now()
      }
    })
    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      lastInteractionTime = Date.now()
    })

    Matter.Events.on(engine, 'beforeUpdate', () => {
      const timeSinceInteraction = Date.now() - lastInteractionTime
      if (timeSinceInteraction > 3000 && !mouseConstraint.body) {
        // Apply force towards initial positions
        ['ARIA', 'JOZIEL', 'NAYLA'].forEach(label => {
          const body = bodiesMap[label]
          const target = initialPositions[label as keyof typeof initialPositions]

          const dx = target.x - body.position.x
          const dy = target.y - body.position.y

          // Spring force proportional to distance
          const forceMagnitude = 0.000015 // Tweak this for strength
          Matter.Body.applyForce(body, body.position, {
            x: dx * forceMagnitude,
            y: dy * forceMagnitude
          })

          // Add some damping to prevent infinite orbiting
          Matter.Body.setVelocity(body, {
             x: body.velocity.x * 0.95,
             y: body.velocity.y * 0.95
          })
        })
      }
    })

    // Click logic vs drag logic
    Matter.Events.on(mouseConstraint, 'mousedown', (e) => {
       const body = Matter.Query.point(engine.world.bodies, mouse.position)[0]
       if (body && ['ARIA', 'JOZIEL', 'NAYLA'].includes(body.label)) {
          clickPosRef.current = { x: mouse.position.x, y: mouse.position.y, time: Date.now() }
       }
    })

    Matter.Events.on(mouseConstraint, 'mouseup', (e) => {
       if (clickPosRef.current) {
         const { x, y, time } = clickPosRef.current
         const dist = Math.hypot(mouse.position.x - x, mouse.position.y - y)
         const duration = Date.now() - time

         if (dist < 10 && duration < 300) {
            // It's a click
            const body = Matter.Query.point(engine.world.bodies, mouse.position)[0]
            if (body && ['ARIA', 'JOZIEL', 'NAYLA'].includes(body.label)) {
               onSelectModule(body.label as 'ARIA' | 'JOZIEL' | 'NAYLA')
            }
         }
         clickPosRef.current = null
       }
    })

    // Update dimensions on resize
    const handleResize = () => {
       const newWidth = sceneEl.clientWidth || window.innerWidth
       const newHeight = sceneEl.clientHeight || window.innerHeight
       // Update walls
       Matter.Body.setPosition(walls[0], { x: newWidth / 2, y: -50 })
       Matter.Body.setPosition(walls[1], { x: newWidth / 2, y: newHeight + 50 })
       Matter.Body.setPosition(walls[2], { x: -50, y: newHeight / 2 })
       Matter.Body.setPosition(walls[3], { x: newWidth + 50, y: newHeight / 2 })

       // Initial positions update
       const newCenter = { x: newWidth / 2, y: newHeight / 2 }
       initialPositions.ARIA = { x: newCenter.x - newWidth * 0.25, y: newCenter.y - newHeight * 0.1 }
       initialPositions.JOZIEL = { x: newCenter.x + newWidth * 0.25, y: newCenter.y + newHeight * 0.15 }
       initialPositions.NAYLA = { x: newCenter.x, y: newCenter.y - newHeight * 0.25 }
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrame: number
    let lastTime = performance.now()
    const update = (time: number) => {
      const delta = time - lastTime
      lastTime = time

      // Cap delta at 50ms to prevent huge jumps if tab is inactive
      Matter.Engine.update(engine, Math.min(delta, 50))

      setPositions({
        ARIA: { x: ariaBody.position.x, y: ariaBody.position.y, angle: ariaBody.angle },
        JOZIEL: { x: jozielBody.position.x, y: jozielBody.position.y, angle: jozielBody.angle },
        NAYLA: { x: naylaBody.position.x, y: naylaBody.position.y, angle: naylaBody.angle }
      })

      animationFrame = requestAnimationFrame(update)
    }
    animationFrame = requestAnimationFrame(update)
    setIsReady(true)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrame)
      Matter.Engine.clear(engine)
      if (engineRef.current) {
        Matter.World.clear(engine.world, false)
      }
    }
  }, [onSelectModule])

  const bubbleRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 60 // Roughly half of standard 80-120px

  const getVideoSrc = (module: string) => {
    switch (module) {
      case 'ARIA': return mediaUrl('fuego/botones/aria-preview.mp4')
      case 'JOZIEL': return mediaUrl('fuego/botones/joziel-preview.mp4')
      case 'NAYLA': return mediaUrl('fuego/botones/nayla-preview.mp4')
      default: return ''
    }
  }

  const getFallbackSrc = (module: string) => {
    switch (module) {
      case 'ARIA': return '/placeholder-video-1.mp4'
      case 'JOZIEL': return '/placeholder-video-2.mp4'
      case 'NAYLA': return '/placeholder-video-3.mp4'
      default: return ''
    }
  }

  return (
    <div ref={sceneRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 10 }}>
       {isReady && ['ARIA', 'JOZIEL', 'NAYLA'].map(module => {
          const pos = positions[module as keyof typeof positions]
          return (
             <div
               key={module}
               style={{
                 position: 'absolute',
                 left: pos.x - bubbleRadius,
                 top: pos.y - bubbleRadius,
                 width: bubbleRadius * 2,
                 height: bubbleRadius * 2,
                 transform: `rotate(${pos.angle}rad)`,
                 pointerEvents: 'none' // The scene div handles mouse events via Matter.Mouse
               }}
             >
                <BubbleWrapper className="floating-bubble" onClick={() => {}}>
                  <div className="bubble-video-container" style={{ opacity: 0 }}>
                    <video
                      src={getVideoSrc(module)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bubble-video"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackSrc(module);
                      }}
                    />
                  </div>
                  <span className="bubble-label" style={{ pointerEvents: 'none' }}>{module}</span>
                </BubbleWrapper>
             </div>
          )
       })}
    </div>
  )
}
